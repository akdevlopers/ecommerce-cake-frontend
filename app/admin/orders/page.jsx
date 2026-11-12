"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminShell";
import { adminApi, STATUS_STYLES } from "@/lib/admin";
import { cn, formatDate, formatDateTime, money } from "@/lib/format";

const FILTERS = [
  { value: "", label: "Active & completed" },
  { value: "PAID", label: "New (paid)" },
  { value: "PREPARING", label: "Preparing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PENDING", label: "Unpaid" },
  { value: "ALL", label: "All" },
];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (status) qs.set("status", status);
    if (search) qs.set("q", search);
    setData(null);
    adminApi(`/orders?${qs}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [status, search, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <AdminPageHeader title="Orders" subtitle={data ? `${data.total} order(s)` : "Loading…"} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order number, phone or name"
            aria-label="Search orders"
          />
        </div>
        <select
          className="input w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Delivery</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!data &&
                [0, 1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-5 animate-pulse rounded bg-mist" />
                    </td>
                  </tr>
                ))}
              {data?.orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-brand">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-ink-muted">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-ink">{o.customerName}</p>
                    <p className="text-xs text-ink-muted">{o.phone}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <p className="text-ink">{formatDate(o.delivery.date, { day: "numeric", month: "short" })}</p>
                    <p className="text-xs text-ink-muted">{o.delivery.slot}</p>
                  </td>
                  <td className="px-5 py-3">{o.itemCount}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} styles={STATUS_STYLES} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-ink">{money(o.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand hover:bg-brand hover:text-white"
                      aria-label={`View order ${o.orderNumber}`}
                      title="View order details"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {data && data.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className={cn("rounded-lg border border-line bg-white p-2", page <= 1 && "opacity-40")}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages}
            className={cn("rounded-lg border border-line bg-white p-2", page >= pages && "opacity-40")}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
