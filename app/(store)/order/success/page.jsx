"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import OrderSummary from "@/components/order/OrderSummary";
import { getLastOrder } from "@/lib/checkout";
function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const [order, setOrder] = useState(null);
  useEffect(() => {
    const last = getLastOrder();
    if (last && (!orderNumber || last.orderNumber === orderNumber)) setOrder(last);
  }, [orderNumber]);
  return (
    <div className="container max-w-2xl py-16">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-light">
          <CheckCircle2 className="h-10 w-10 text-mint" />
        </div>
        <h1 className="mt-6 text-4xl">Thank you{order ? `, ${order.customer.name.split(" ")[0]}` : ""}!</h1>
        <p className="mt-3">
          Your payment was successful and your order{" "}
          <strong className="text-ink">{orderNumber || order?.orderNumber}</strong> is confirmed. We&apos;ll start
          baking soon.
        </p>
      </div>
      {order && (
        <div className="mt-10">
          <OrderSummary order={order} />
        </div>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/track-order" className="btn-outline">
          Track order
        </Link>
        <Link href="/shop" className="btn-dark">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
