"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/admin";
import { cn, money } from "@/lib/format";
import { useUi } from "@/store/ui";

export default function AdminProductsPage() {
  const toast = useUi((s) => s.toast);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi("/products")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function toggle(p, field) {
    try {
      const updated = await adminApi(`/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: !p[field] }),
      });
      setData((d) => ({ ...d, products: d.products.map((x) => (x.id === p.id ? updated : x)) }));
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await adminApi(`/products/${confirm.id}`, { method: "DELETE" });
      toast(`${confirm.name} deleted`);
      setConfirm(null);
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <>
      <AdminPageHeader title="Products" subtitle={`${data.count} product(s)`}>
        <Link href="/admin/products/new" className="btn-brand btn-sm">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </AdminPageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price from</th>
                <th className="px-5 py-3 text-center font-medium">In stock</th>
                <th className="px-5 py-3 text-center font-medium">Visible</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                      <div>
                        <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:text-brand">
                          {p.name}
                        </Link>
                        <div className="flex gap-1.5 text-[11px]">
                          {p.bestSeller && <span className="text-brand">Bestseller</span>}
                          {p.featured && <span className="text-mint">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.category?.name || "—"}</td>
                  <td className="px-5 py-3 font-medium text-ink">{money(p.price)}</td>
                  <td className="px-5 py-3 text-center">
                    <Switch checked={p.inStock} onChange={() => toggle(p, "inStock")} label={`${p.name} in stock`} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Switch checked={p.active} onChange={() => toggle(p, "active")} label={`${p.name} visible`} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded-lg p-2 hover:bg-blush hover:text-brand"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setConfirm(p)}
                        className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/40" onClick={() => !busy && setConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
            <h2 className="text-xl">Delete {confirm.name}?</h2>
            <p className="mt-2 text-sm">
              This removes the product and its images from the store. Past orders keep their details.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => setConfirm(null)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-sm bg-red-600 text-white hover:bg-red-700" onClick={remove} disabled={busy}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn("relative inline-flex h-6 w-11 rounded-full transition", checked ? "bg-mint" : "bg-mist")}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}
