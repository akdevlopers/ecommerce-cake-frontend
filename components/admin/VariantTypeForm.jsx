"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Palette, Plus, Save, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/admin";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";

const DEFAULT_COLOR = "#e8a0b4";
let seq = 0;
const key = () => `n${++seq}`;
const ROW = "grid grid-cols-[28px_44px_minmax(0,1fr)_40px] items-center gap-3 sm:grid-cols-[36px_56px_minmax(0,1fr)_120px_40px]";

/** Add / edit one variant type (e.g. Colour) and its values; everything is saved together. */
export default function VariantTypeForm({ type }) {
  const router = useRouter();
  const toast = useUi((s) => s.toast);
  const [name, setName] = useState(type?.name || "");
  const [values, setValues] = useState(() =>
    type?.values?.length
      ? type.values.map((v) => ({ key: key(), id: v.id, value: v.value, colorHex: v.colorHex, productCount: v.productCount }))
      : [{ key: key(), value: "", colorHex: null }],
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [focusKey, setFocusKey] = useState(null);

  const setValue = (k, patch) => {
    setValues((list) => list.map((v) => (v.key === k ? { ...v, ...patch } : v)));
    setErrors((e) => ({ ...e, values: "" }));
  };
  const addRow = () => {
    const k = key();
    setValues((list) => [...list, { key: k, value: "", colorHex: null }]);
    setFocusKey(k);
  };
  const removeRow = (row) => setValues((list) => list.filter((v) => v.key !== row.key));
  const move = (i, dir) =>
    setValues((list) => {
      const next = [...list];
      const j = i + dir;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function submit(e) {
    e.preventDefault();
    const rows = values.filter((v) => v.value.trim() || v.id);
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (rows.some((v) => !v.value.trim())) errs.values = "A value can't be empty";
    const seen = new Set();
    for (const v of rows) {
      const k = v.value.trim().toLowerCase();
      if (k && seen.has(k)) errs.values = `“${v.value.trim()}” is listed twice`;
      seen.add(k);
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setErrors({});
    const body = JSON.stringify({
      name: name.trim(),
      values: rows.map((v) => ({ id: v.id || null, value: v.value.trim(), colorHex: v.colorHex || null })),
    });
    try {
      if (type) await adminApi(`/variant-types/${type.id}`, { method: "PUT", body });
      else await adminApi("/variant-types", { method: "POST", body });
      toast(type ? "Variant saved" : "Variant created");
      router.push("/admin/variants");
    } catch (err) {
      const d = err.details || {};
      setErrors({ name: d.name, values: Object.entries(d).find(([k]) => k.startsWith("values"))?.[1] });
      toast(err.message, "error");
      setSaving(false);
    }
  }

  const usedBy = type?.productCount || 0;

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <section className="card p-5 md:p-6">
          <h2 className="mb-4 text-lg">Details</h2>
          <label className="block max-w-md">
            <span className="label">Variant name</span>
            <input
              className="input"
              value={name}
              maxLength={30}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((x) => ({ ...x, name: "" }));
              }}
              placeholder="e.g. Size, Colour, Flavour"
              autoFocus={!type}
            />
            {errors.name ? (
              <span className="field-error block">{errors.name}</span>
            ) : (
              usedBy > 0 &&
              name.trim() !== type.name && (
                <span className="mt-1 block text-xs text-ink-muted">Renaming updates {usedBy} product(s).</span>
              )
            )}
          </label>
        </section>

        <section className="card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Values ({values.filter((v) => v.value.trim()).length})</h2>
          </div>

          <div className={cn(ROW, "px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-muted")}>
            <span />
            <span>Colour</span>
            <span>Value</span>
            <span className="hidden sm:block">Used in</span>
            <span />
          </div>

          <ul className="divide-y divide-line rounded-2xl border border-line">
            {values.map((v, i) => (
              <li key={v.key} className={cn(ROW, "px-2 py-2.5")}>
                <div className="flex flex-col items-center text-ink-muted">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 hover:text-ink disabled:invisible"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === values.length - 1}
                    className="rounded p-0.5 hover:text-ink disabled:invisible"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <ColorField value={v.colorHex} onChange={(colorHex) => setValue(v.key, { colorHex })} />
                <input
                  className="input h-10 w-full"
                  value={v.value}
                  maxLength={40}
                  autoFocus={focusKey === v.key}
                  onChange={(e) => setValue(v.key, { value: e.target.value })}
                  onKeyDown={(e) => {
                    // Enter on the last row adds the next one, so values can be typed quickly.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (i === values.length - 1 && v.value.trim()) addRow();
                    }
                  }}
                  placeholder={`Value ${i + 1}`}
                  aria-label={`Value ${i + 1}`}
                />
                <span className="hidden text-sm sm:block">
                  {v.productCount ? (
                    `${v.productCount} product${v.productCount === 1 ? "" : "s"}`
                  ) : (
                    <span className="text-ink-muted">{v.id ? "Not used" : "New"}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(v)}
                  disabled={v.productCount > 0}
                  title={v.productCount ? "Used by products, can't remove" : "Remove"}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                  aria-label={`Remove ${v.value || "value"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {!values.length && <li className="px-4 py-8 text-center text-sm text-ink-muted">No values yet.</li>}
          </ul>
          {errors.values && <p className="field-error">{errors.values}</p>}

          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-3 text-sm font-medium text-ink-soft transition hover:border-brand hover:bg-blush/40 hover:text-brand"
          >
            <Plus className="h-4 w-4" /> Add value
          </button>
          <p className="mt-3 text-xs text-ink-muted">
            Colour is optional and shows as a swatch on the product page. Values used by products can be renamed
            (products update automatically) but not removed.
          </p>
        </section>
      </div>

      <div>
        <div className="sticky top-6 flex gap-2">
          <button type="button" onClick={() => router.push("/admin/variants")} className="btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-brand flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>
    </form>
  );
}

/** Optional colour: a palette button that becomes a colour picker with a small clear button. */
function ColorField({ value, onChange }) {
  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange(DEFAULT_COLOR)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line bg-white text-ink-muted transition hover:border-brand hover:text-brand"
        title="Add colour (optional)"
        aria-label="Add colour"
      >
        <Palette className="h-4 w-4" />
      </button>
    );
  }
  return (
    <span className="relative inline-flex h-10 w-10">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer appearance-none rounded-full border border-line bg-white p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
        aria-label="Colour"
      />
      <button
        type="button"
        onClick={() => onChange(null)}
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-white"
        aria-label="Remove colour"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
