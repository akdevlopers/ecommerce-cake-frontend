"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cartSubtotal, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { api, ApiError } from "@/lib/api";
import { cn, money, todayIST } from "@/lib/format";
import { completePayment } from "@/lib/checkout";
import { useHydrated } from "@/lib/useHydrated";
const initial = {
  name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  pincode: "",
  date: "",
  slot: "",
  notes: "",
};
export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const settings = useSettings();
  const { items, clear } = useCart();
  const toast = useUi((s) => s.toast);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cartPayload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        weightId: i.weightId,
        eggless: i.eggless,
        message: i.message,
        qty: i.qty,
      })),
    [items],
  );
  useEffect(() => {
    setForm((f) => ({ ...f, date: f.date || todayIST(1), slot: f.slot || settings.deliverySlots[0] || "" }));
  }, [settings.deliverySlots]);
  useEffect(() => {
    if (!hydrated || !cartPayload.length) return;
    setQuoteError("");
    api("/cart/quote", { method: "POST", body: JSON.stringify({ items: cartPayload }) })
      .then(setQuote)
      .catch((e) => setQuoteError(e instanceof ApiError ? e.message : "Could not price your cart"));
  }, [hydrated, cartPayload]);
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };
  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    let params;
    try {
      params = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartPayload,
          customer: { name: form.name, phone: form.phone, email: form.email },
          address: { line1: form.line1, line2: form.line2, city: form.city, pincode: form.pincode },
          delivery: { date: form.date, slot: form.slot },
          notes: form.notes,
        }),
      });
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.details) {
        // Map "customer.name" -> "name" etc.
        const mapped = {};
        for (const [k, v] of Object.entries(err.details)) mapped[k.split(".").pop()] = v;
        setErrors(mapped);
      }
      toast(err instanceof Error ? err.message : "Could not place order", "error");
      return;
    }
    try {
      const order = await completePayment(params, form.phone);
      clear();
      router.replace(`/order/success?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof Error && err.message === "DISMISSED") {
        router.push(`/order/failed?order=${encodeURIComponent(params.orderNumber)}&reason=cancelled`);
      } else {
        toast(err instanceof Error ? err.message : "Payment failed", "error");
        router.push(`/order/failed?order=${encodeURIComponent(params.orderNumber)}`);
      }
    }
  }
  if (!hydrated) return <div className="container mt-14 h-96 animate-pulse rounded-2xl bg-cream" />;
  if (!items.length) {
    return (
      <>
        <PageBanner title="Checkout" crumbs={[{ label: "Checkout" }]} />
        <div className="container mt-14 text-center">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="btn-dark mt-6">
            Browse cakes
          </Link>
        </div>
      </>
    );
  }
  const subtotal = quote?.subtotal ?? cartSubtotal(items);
  return (
    <>
      <PageBanner title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <form onSubmit={submit} className="container mt-14 grid gap-10 lg:grid-cols-[1fr_420px]" noValidate>
        <div className="space-y-10">
          <Section title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name} className="sm:col-span-2">
                <input className="input" value={form.name} onChange={set("name")} autoComplete="name" required />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <input
                  className="input"
                  value={form.phone}
                  onChange={set("phone")}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                  required
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Delivery address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="House / flat, street" error={errors.line1} className="sm:col-span-2">
                <input
                  className="input"
                  value={form.line1}
                  onChange={set("line1")}
                  autoComplete="address-line1"
                  required
                />
              </Field>
              <Field label="Landmark / area (optional)" error={errors.line2} className="sm:col-span-2">
                <input className="input" value={form.line2} onChange={set("line2")} autoComplete="address-line2" />
              </Field>
              <Field label="City" error={errors.city}>
                <input
                  className="input"
                  value={form.city}
                  onChange={set("city")}
                  autoComplete="address-level2"
                  required
                />
              </Field>
              <Field label="Pincode" error={errors.pincode}>
                <input
                  className="input"
                  value={form.pincode}
                  onChange={set("pincode")}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                />
              </Field>
            </div>
          </Section>

          <Section title="Delivery date & time">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" error={errors.date}>
                <input
                  className="input"
                  type="date"
                  min={todayIST(1)}
                  max={todayIST(60)}
                  value={form.date}
                  onChange={set("date")}
                  required
                />
              </Field>
              <Field label="Time slot" error={errors.slot}>
                <select className="input" value={form.slot} onChange={set("slot")} required>
                  {settings.deliverySlots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notes for the bakery (optional)" error={errors.notes} className="sm:col-span-2">
                <textarea
                  className="input min-h-[90px]"
                  value={form.notes}
                  onChange={set("notes")}
                  maxLength={500}
                  placeholder="Delivery instructions, candles, etc."
                />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="h-fit rounded-3xl bg-cream p-6 lg:sticky lg:top-28">
          <h2 className="mb-5 text-2xl">Your order</h2>
          <ul className="divide-y divide-cream-dark">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                  <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">
                    {i.qty}
                  </span>
                </span>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-ink">{i.name}</p>
                  <p className="text-xs text-ink-muted">
                    {i.weightLabel} · {i.eggless ? "Eggless" : "With egg"}
                    {i.message && ` · “${i.message}”`}
                  </p>
                </div>
                <span className="text-sm text-ink">{money(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>

          {quoteError && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {quoteError}.{" "}
              <Link href="/cart" className="underline">
                Update your cart
              </Link>
            </p>
          )}

          <dl className="mt-4 space-y-2 border-t border-cream-dark pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="text-ink">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="text-ink">
                {quote ? (quote.deliveryCharge ? money(quote.deliveryCharge) : "Free") : "…"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-cream-dark pt-3 text-base">
              <dt className="font-medium text-ink">Total</dt>
              <dd className="font-heading text-2xl font-medium text-ink">{quote ? money(quote.total) : "…"}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting || !quote} className="btn-brand mt-6 h-14 w-full text-[15px]">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
            {submitting ? "Processing…" : quote ? `Pay ${money(quote.total)}` : "Pay now"}
          </button>
          <p className={cn("mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted")}>
            <ShieldCheck className="h-4 w-4 text-mint" /> Payments secured by Razorpay
          </p>
          <p className="mt-2 text-center text-xs text-ink-muted">
            By placing this order you agree to our{" "}
            <Link href="/policies/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/policies/refund" className="underline">
              refund policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </>
  );
}
function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-5 text-2xl">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, error, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="field-error block">{error}</span>}
    </label>
  );
}
