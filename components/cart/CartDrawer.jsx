"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { money } from "@/lib/format";
import { useSettings } from "@/components/layout/SettingsProvider";
import { useHydrated } from "@/lib/useHydrated";
import FreeDeliveryBar from "./FreeDeliveryBar";
export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const settings = useSettings();
  const hydrated = useHydrated();
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);
  if (!hydrated || !drawerOpen) return null;
  const subtotal = cartSubtotal(items);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={closeDrawer} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-xl">Shopping Cart</h2>
          <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-mist" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blush">
              <ShoppingBag className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-xl">Your cart is empty</h3>
            <p className="text-sm">Check out our freshly baked cakes and find something you love.</p>
            <Link href="/shop" onClick={closeDrawer} className="btn-dark mt-2">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <FreeDeliveryBar subtotal={subtotal} settings={settings} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((i) => (
                <li key={i.key} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${i.slug}`}
                    onClick={closeDrawer}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream"
                  >
                    {i.image && <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${i.slug}`}
                        onClick={closeDrawer}
                        className="font-heading font-medium text-ink hover:text-brand"
                      >
                        {i.name}
                      </Link>
                      <button
                        onClick={() => remove(i.key)}
                        className="text-ink-muted hover:text-red-600"
                        aria-label={`Remove ${i.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {i.weightLabel} · {i.eggless ? "Eggless" : "With egg"}
                      {i.message && <> · “{i.message}”</>}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper value={i.qty} onChange={(q) => setQty(i.key, q)} small />
                      <span className="font-medium text-ink">{money(i.unitPrice * i.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-6">
              <div className="mb-1 flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-heading text-lg font-medium text-ink">{money(subtotal)}</span>
              </div>
              <p className="mb-5 text-xs text-ink-muted">Delivery charges calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeDrawer} className="btn-outline">
                  View cart
                </Link>
                <Link href="/checkout" onClick={closeDrawer} className="btn-brand">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
export function QtyStepper({ value, onChange, small = false, max = 10 }) {
  const size = small ? "h-8 w-8" : "h-12 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        className={`${size} flex items-center justify-center rounded-full hover:text-brand disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`${small ? "w-6 text-sm" : "w-8"} text-center font-medium text-ink`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${size} flex items-center justify-center rounded-full hover:text-brand disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
