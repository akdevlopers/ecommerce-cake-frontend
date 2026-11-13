import Image from "next/image";
import { formatDate, money } from "@/lib/format";
export default function OrderSummary({ order }) {
  return (
    <div className="rounded-3xl border border-line p-6">
      <div className="grid gap-4 border-b border-line pb-5 text-sm sm:grid-cols-3">
        <div>
          <p className="text-ink-muted">Order number</p>
          <p className="font-medium text-ink">{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-ink-muted">Delivery</p>
          <p className="font-medium text-ink">
            {formatDate(order.delivery.date)} · {order.delivery.slot}
          </p>
        </div>
        <div>
          <p className="text-ink-muted">Total paid</p>
          <p className="font-medium text-ink">{money(order.total)}</p>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex items-center gap-4 py-4">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
              {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
            </span>
            <div className="flex-1 text-sm">
              <p className="font-medium text-ink">
                {i.name} × {i.qty}
              </p>
              <p className="text-ink-muted">
                {[i.variant, i.message && `“${i.message}”`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="text-sm text-ink">{money(i.unitPrice * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{money(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{order.deliveryCharge ? money(order.deliveryCharge) : "Free"}</dd>
        </div>
        <div className="flex justify-between text-base font-medium text-ink">
          <dt>Total</dt>
          <dd>{money(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
