"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IndianRupee, Package, ShoppingBag, Timer } from "lucide-react";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminShell";
import { adminApi, STATUS_STYLES } from "@/lib/admin";
import { formatDate, formatDateTime, money } from "@/lib/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi("/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!stats) return <Skeleton />;

  const cards = [
    { label: "Orders today", value: stats.today.orders, icon: ShoppingBag, tone: "bg-blush text-brand" },
    { label: "Revenue today", value: money(stats.today.revenue), icon: IndianRupee, tone: "bg-mint-light text-mint" },
    { label: "Revenue this month", value: money(stats.month.revenue), icon: IndianRupee, tone: "bg-peach text-coral" },
    { label: "Orders to fulfil", value: stats.openOrders, icon: Timer, tone: "bg-lilac text-purple-600" },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening in your bakery." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm">{label}</p>
              <p className="font-heading text-2xl font-medium text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="p-6 text-sm">No paid orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Delivery</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/60">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-brand">
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-ink-muted">{formatDateTime(o.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3">{o.customerName}</td>
                      <td className="whitespace-nowrap px-5 py-3">{formatDate(o.delivery.date, { day: "numeric", month: "short" })}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} styles={STATUS_STYLES} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink">{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card h-fit p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-brand">
              <Package className="h-5 w-5" />
            </span>
            <h2 className="text-lg">Products</h2>
          </div>
          <p className="mt-4 font-heading text-4xl font-medium text-ink">{stats.products.count}</p>
          <p className="mt-1 text-xs">products in your store</p>
          <div className="mt-5 grid gap-2">
            <Link href="/admin/products/new" className="btn-brand btn-sm w-full">
              Add product
            </Link>
            <Link href="/admin/products" className="btn-outline btn-sm w-full">
              Manage products
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
