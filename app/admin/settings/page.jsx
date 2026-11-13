"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { BrandMark } from "@/components/ui/Logo";
import { adminApi, fileToUploadPayload, toPaise, toRupees } from "@/lib/admin";
import { useUi } from "@/store/ui";

export default function AdminSettingsPage() {
  const toast = useUi((s) => s.toast);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [newSlot, setNewSlot] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => {
    adminApi("/settings")
      .then((s) =>
        setForm({
          ...s,
          deliveryCharge: toRupees(s.deliveryCharge),
          freeDeliveryAbove: toRupees(s.freeDeliveryAbove),
        }),
      )
      .catch((e) => toast(e.message, "error"));
  }, [toast]);

  if (!form) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  /** Uploads the logo (resized to max 512px) and puts its link in the form. Saved with "Save changes". */
  async function uploadLogo(file) {
    if (!file) return;
    setUploading(true);
    try {
      const payload = await fileToUploadPayload(file, 512);
      const { url } = await adminApi("/uploads", { method: "POST", body: JSON.stringify(payload) });
      setForm((f) => ({ ...f, logoUrl: url }));
      toast("Logo uploaded. Click Save changes to publish it.");
    } catch (e) {
      toast(e.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  function addSlot() {
    const s = newSlot.trim();
    if (!s || form.deliverySlots.includes(s)) return;
    setForm((f) => ({ ...f, deliverySlots: [...f.deliverySlots, s] }));
    setNewSlot("");
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const s = await adminApi("/settings", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          deliveryCharge: toPaise(form.deliveryCharge),
          freeDeliveryAbove: toPaise(form.freeDeliveryAbove),
        }),
      });
      setForm({ ...s, deliveryCharge: toRupees(s.deliveryCharge), freeDeliveryAbove: toRupees(s.freeDeliveryAbove) });
      window.dispatchEvent(new CustomEvent("brand-updated", { detail: { storeName: s.storeName, logoUrl: s.logoUrl } }));
      toast("Settings saved");
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, props = {}) => (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" value={form[key]} onChange={set(key)} {...props} />
      {errors[key] && <span className="field-error block">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={save} noValidate>
      <AdminPageHeader title="Settings" subtitle="Store details, delivery charges and time slots">
        <button className="btn-brand btn-sm" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </AdminPageHeader>

      <section className="card mb-6 p-6">
        <h2 className="mb-1 text-lg">Branding</h2>
        <p className="mb-5 text-sm text-ink-muted">Shown in the store header, footer, browser tab and admin.</p>
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_1fr]">
          <div>
            <span className="label">Logo</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={uploading}
                className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-cream transition hover:border-brand"
                title="Upload logo"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                ) : (
                  <>
                    <BrandMark logoUrl={form.logoUrl} className="h-14 w-14" />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 transition group-hover:opacity-100">
                      <ImagePlus className="h-5 w-5" />
                    </span>
                  </>
                )}
              </button>
              <div className="space-y-1.5">
                <button type="button" onClick={() => logoRef.current?.click()} className="btn-outline btn-sm" disabled={uploading}>
                  <ImagePlus className="h-4 w-4" /> {form.logoUrl ? "Change" : "Upload"}
                </button>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: null }))}
                    className="flex items-center gap-1 text-xs text-ink-muted hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Use default
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-muted">Square PNG/JPG works best.</p>
            <input
              ref={logoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => uploadLogo(e.target.files?.[0])}
            />
            {errors.logoUrl && <span className="field-error block">{errors.logoUrl}</span>}
          </div>
          <div className="space-y-4">
            {field("Store name", "storeName", { maxLength: 80 })}
            {field("Tagline (small text under the name)", "tagline", { maxLength: 80, placeholder: "e.g. Bakery & Cake Studio" })}
          </div>
          <div>
            <span className="label">Preview</span>
            <div className="flex h-[124px] items-center rounded-2xl border border-line bg-white px-5">
              <span className="flex min-w-0 items-center gap-2.5">
                <BrandMark logoUrl={form.logoUrl} className="h-10 w-10 shrink-0" />
                <span className="min-w-0 leading-none">
                  <span className="block truncate font-heading text-2xl font-semibold tracking-tight text-ink">
                    {form.storeName || "Store name"}
                  </span>
                  {form.tagline && (
                    <span className="mt-1 block truncate font-accent text-[10px] uppercase tracking-[0.3em] text-ink-muted">
                      {form.tagline}
                    </span>
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-6">
          <h2 className="text-lg">Store details</h2>
          {field("Phone", "phone", { inputMode: "tel" })}
          {field("Email", "email", { type: "email" })}
          {field("WhatsApp number (with country code, e.g. 919876543210)", "whatsapp", { inputMode: "tel" })}
          <label className="block">
            <span className="label">Address</span>
            <textarea className="input min-h-[80px]" value={form.address} onChange={set("address")} />
          </label>
          {field("Announcement bar text", "announcement", { maxLength: 200 })}
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg">Delivery</h2>
          {field("Delivery charge (₹)", "deliveryCharge", { type: "number", min: 0 })}
          {field("Free delivery above (₹, 0 = never free)", "freeDeliveryAbove", { type: "number", min: 0 })}
          <div>
            <span className="label">Delivery time slots</span>
            <ul className="flex flex-wrap gap-2">
              {form.deliverySlots.map((s) => (
                <li key={s} className="flex items-center gap-1.5 rounded-full bg-cream py-1.5 pl-3 pr-1.5 text-sm text-ink">
                  {s}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, deliverySlots: f.deliverySlots.filter((x) => x !== s) }))}
                    className="rounded-full p-0.5 hover:bg-white hover:text-red-600"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                className="input"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="e.g. 8 AM – 10 AM"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSlot();
                  }
                }}
              />
              <button type="button" onClick={addSlot} className="btn-outline btn-sm">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {errors.deliverySlots && <span className="field-error block">{errors.deliverySlots}</span>}
          </div>
        </section>
      </div>
    </form>
  );
}
