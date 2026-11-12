"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { adminApi, toPaise, toRupees } from "@/lib/admin";
import { useUi } from "@/store/ui";

export default function AdminSettingsPage() {
  const toast = useUi((s) => s.toast);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [newSlot, setNewSlot] = useState("");
  const [saving, setSaving] = useState(false);

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
      toast("Settings saved. The store updates within a minute.");
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-6">
          <h2 className="text-lg">Store details</h2>
          {field("Store name", "storeName")}
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
