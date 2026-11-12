"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import OrderSummary from "@/components/order/OrderSummary";
import { api, ApiError } from "@/lib/api";
import { cn, formatDateTime, STATUS_LABEL } from "@/lib/format";
const STEPS = ["PAID", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
function TrackContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ orderNumber: orderNumber.trim(), phone: phone.trim() });
      setOrder(await api(`/orders/track?${qs}`));
    } catch (err) {
      setOrder(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  const stepIndex = order ? STEPS.indexOf(order.status) : -1;
  return (
    <div className="container max-w-3xl">
      <form
        onSubmit={submit}
        className="mt-14 grid gap-4 rounded-3xl bg-cream p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label>
          <span className="label">Order number</span>
          <input
            className="input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. CK2611110001"
            required
          />
        </label>
        <label>
          <span className="label">Mobile number</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" required />
        </label>
        <button className="btn-dark h-[46px]" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
        </button>
        {error && <p className="field-error sm:col-span-3">{error}</p>}
      </form>

      {order && (
        <div className="mt-10 space-y-8">
          <div className="text-center">
            <p className="text-sm text-ink-muted">Current status</p>
            <p className="font-heading text-3xl text-ink">{STATUS_LABEL[order.status]}</p>
          </div>

          {stepIndex >= 0 && (
            <ol className="grid grid-cols-4 gap-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      i <= stepIndex ? "border-brand bg-brand text-white" : "border-line text-ink-muted",
                    )}
                  >
                    {i <= stepIndex ? <Check className="h-5 w-5" /> : i + 1}
                  </span>
                  <span className="mt-2 text-xs sm:text-sm">{STATUS_LABEL[s]}</span>
                </li>
              ))}
            </ol>
          )}

          <OrderSummary order={order} />

          <div>
            <h2 className="mb-3 text-xl">History</h2>
            <ul className="space-y-2 text-sm">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-32 shrink-0 text-ink-muted">{formatDateTime(h.at)}</span>
                  <span>
                    <strong className="text-ink">{STATUS_LABEL[h.status] || h.status}</strong>
                    {h.note && <> — {h.note}</>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
export default function TrackOrderPage() {
  return (
    <>
      <PageBanner title="Track Your Order" crumbs={[{ label: "Track order" }]} />
      <Suspense>
        <TrackContent />
      </Suspense>
    </>
  );
}
