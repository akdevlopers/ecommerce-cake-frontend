"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2, RefreshCw, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { completePayment, getPendingOrder } from "@/lib/checkout";
import { useCart } from "@/store/cart";
function FailedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const orderNumber = params.get("order") || "";
  const cancelled = params.get("reason") === "cancelled";
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const pending = getPendingOrder();
    if (pending && pending.orderNumber === orderNumber) setPhone(pending.phone);
  }, [orderNumber]);
  async function retry() {
    setLoading(true);
    setError("");
    try {
      const p = await api("/orders/retry", { method: "POST", body: JSON.stringify({ orderNumber, phone }) });
      const order = await completePayment(p, phone);
      clear();
      router.replace(`/order/success?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (e) {
      setLoading(false);
      if (e instanceof Error && e.message === "DISMISSED") return;
      if (e instanceof ApiError && e.code === "ALREADY_PAID") {
        router.replace(`/track-order?order=${encodeURIComponent(orderNumber)}`);
        return;
      }
      setError(e instanceof Error ? e.message : "Payment failed");
    }
  }
  return (
    <div className="container max-w-xl py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="mt-6 text-4xl">{cancelled ? "Payment not completed" : "Payment failed"}</h1>
      <p className="mt-3">
        {cancelled
          ? "You closed the payment window before finishing."
          : "Your payment could not be completed. No money has been taken, or any deducted amount will be refunded automatically by your bank."}{" "}
        Your cart is still saved.
      </p>
      {orderNumber && (
        <p className="mt-2 text-sm">
          Order reference: <strong className="text-ink">{orderNumber}</strong>
        </p>
      )}

      {orderNumber && (
        <div className="mx-auto mt-8 max-w-sm space-y-3 text-left">
          <label className="block">
            <span className="label">Mobile number used for the order</span>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </label>
          <button onClick={retry} disabled={loading || !phone} className="btn-brand h-12 w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Try payment again
          </button>
          {error && <p className="field-error text-center">{error}</p>}
        </div>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/checkout" className="btn-outline btn-sm">
          Back to checkout
        </Link>
        <Link href="/contact" className="btn-outline btn-sm">
          Contact us
        </Link>
      </div>
    </div>
  );
}
export default function OrderFailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
