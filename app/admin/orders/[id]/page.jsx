"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminShell";
import { adminApi, STATUS_STYLES } from "@/lib/admin";
import { formatDate, formatDateTime, money, STATUS_LABEL } from "@/lib/format";
import { useUi } from "@/store/ui";

const NEXT_STATUSES = ["PAID", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage({ params }) {
  const toast = useUi((s) => s.toast);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi(`/orders/${params.id}`)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  async function updateStatus(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const o = await adminApi(`/orders/${params.id}`, { method: "PATCH", body: JSON.stringify({ status, note }) });
      setOrder(o);
      setNote("");
      toast(`Order marked as ${STATUS_LABEL[o.status].toLowerCase()}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!order) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  const unpaid = order.status === "PENDING" || order.status === "FAILED";
  const a = order.address;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      <AdminPageHeader title={`Order ${order.orderNumber}`} subtitle={`Placed ${formatDateTime(order.createdAt)}`}>
        <StatusBadge status={order.status} styles={STATUS_STYLES} />
      </AdminPageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-lg">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-4 py-3">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink">
                      {i.name} × {i.qty}
                    </p>
                    <p>
                      {i.weight} ·{" "}
                      <span className={i.eggless ? "font-medium text-mint" : ""}>
                        {i.eggless ? "EGGLESS" : "With egg"}
                      </span>
                    </p>
                    {i.message && (
                      <p className="mt-1 inline-block rounded-lg bg-blush px-2 py-0.5 text-brand">
                        Message on cake: “{i.message}”
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-ink">{money(i.unitPrice * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-line pt-3 text-sm">
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
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-lg">Timeline</h2>
            <ol className="relative space-y-4 border-l-2 border-line pl-5">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand" />
                  <p className="font-medium text-ink">{STATUS_LABEL[h.status] || h.status}</p>
                  {h.note && <p>{h.note}</p>}
                  <p className="text-xs text-ink-muted">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-lg">Update status</h2>
            {unpaid ? (
              <p className="text-sm">This order hasn&apos;t been paid yet, so it can&apos;t be moved forward.</p>
            ) : (
              <form onSubmit={updateStatus} className="space-y-3">
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
                  {NEXT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  placeholder="Note (optional, visible to customer)"
                />
                <button className="btn-brand btn-sm w-full" disabled={saving || status === order.status}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update
                </button>
              </form>
            )}
          </section>

          <section className="card space-y-3 p-5 text-sm">
            <h2 className="text-lg">Delivery</h2>
            <p className="font-medium text-ink">
              {formatDate(order.delivery.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              <br />
              {order.delivery.slot}
            </p>
            {a && (
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  {a.line1}
                  {a.line2 && (
                    <>
                      <br />
                      {a.line2}
                    </>
                  )}
                  <br />
                  {a.city} – {a.pincode}
                </span>
              </p>
            )}
            {order.notes && <p className="rounded-xl bg-cream p-3">“{order.notes}”</p>}
          </section>

          <section className="card space-y-2 p-5 text-sm">
            <h2 className="text-lg">Customer</h2>
            <p className="font-medium text-ink">{order.customer.name}</p>
            <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 hover:text-brand">
              <Phone className="h-4 w-4 text-brand" /> {order.customer.phone}
            </a>
            <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 break-all hover:text-brand">
              <Mail className="h-4 w-4 shrink-0 text-brand" /> {order.customer.email}
            </a>
          </section>

          <section className="card space-y-1 p-5 text-sm">
            <h2 className="mb-2 text-lg">Payment</h2>
            <p>
              Razorpay order: <span className="break-all text-ink">{order.razorpayOrderId || "—"}</span>
            </p>
            <p>
              Payment ID: <span className="break-all text-ink">{order.razorpayPaymentId || "—"}</span>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
