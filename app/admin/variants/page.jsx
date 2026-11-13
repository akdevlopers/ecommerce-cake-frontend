"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/admin";
import { useUi } from "@/store/ui";

const MAX_CHIPS = 8;

export default function VariantListPage() {
  const toast = useUi((s) => s.toast);
  const [types, setTypes] = useState(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi("/variant-types")
      .then(setTypes)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function move(i, dir) {
    const list = [...types];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setTypes(list);
    try {
      await adminApi("/variant-types/order", { method: "PUT", body: JSON.stringify({ ids: list.map((t) => t.id) }) });
    } catch (e) {
      toast(e.message, "error");
      load();
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await adminApi(`/variant-types/${confirm.id}`, { method: "DELETE" });
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
  if (!types) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <>
      <AdminPageHeader title="Variant Master" subtitle={`${types.length} variant type(s) · products pick from these`}>
        <Link href="/admin/variants/new" className="btn-brand btn-sm">
          <Plus className="h-4 w-4" /> Add variant
        </Link>
      </AdminPageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="w-12 px-3 py-3 font-medium" />
                <th className="whitespace-nowrap px-5 py-3 font-medium">Variant</th>
                <th className="px-5 py-3 font-medium">Values</th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">Used in</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {types.map((t, i) => (
                <tr key={t.id} className="hover:bg-cream/60">
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-center text-ink-muted">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="rounded p-0.5 hover:text-ink disabled:invisible"
                        aria-label={`Move ${t.name} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === types.length - 1}
                        className="rounded p-0.5 hover:text-ink disabled:invisible"
                        aria-label={`Move ${t.name} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <Link href={`/admin/variants/${t.id}`} className="flex items-center gap-3 hover:text-brand">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush font-semibold text-brand">
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{t.name}</span>
                        <span className="text-xs text-ink-muted">
                          {t.values.length} value{t.values.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex min-w-[220px] flex-wrap gap-1.5">
                      {t.values.slice(0, MAX_CHIPS).map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink"
                        >
                          {v.colorHex && (
                            <span
                              className="h-3 w-3 rounded-full border border-black/10"
                              style={{ background: v.colorHex }}
                            />
                          )}
                          {v.value}
                        </span>
                      ))}
                      {t.values.length > MAX_CHIPS && (
                        <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink-muted">
                          +{t.values.length - MAX_CHIPS} more
                        </span>
                      )}
                      {!t.values.length && <span className="text-xs text-ink-muted">No values</span>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {t.productCount ? (
                      `${t.productCount} product${t.productCount === 1 ? "" : "s"}`
                    ) : (
                      <span className="text-ink-muted">Not used</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/variants/${t.id}`}
                        className="rounded-lg p-2 hover:bg-blush hover:text-brand"
                        aria-label={`Edit ${t.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setConfirm(t)}
                        className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${t.name}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {types.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-brand">
                        <Layers className="h-6 w-6" />
                      </span>
                      <p>No variants yet. Add Size, Colour, Flavour…</p>
                      <Link href="/admin/variants/new" className="btn-brand btn-sm">
                        <Plus className="h-4 w-4" /> Add variant
                      </Link>
                    </div>
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
            <h2 className="text-xl">{confirm.productCount ? `Can't delete ${confirm.name}` : `Delete ${confirm.name}?`}</h2>
            <p className="mt-2 text-sm">
              {confirm.productCount
                ? `It is used by ${confirm.productCount} product(s). Remove it from those products first.`
                : `This removes ${confirm.name} and its ${confirm.values.length} value(s).`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-outline btn-sm" onClick={() => setConfirm(null)} disabled={busy}>
                {confirm.productCount ? "OK" : "Cancel"}
              </button>
              {!confirm.productCount && (
                <button className="btn btn-sm bg-red-600 text-white hover:bg-red-700" onClick={remove} disabled={busy}>
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
