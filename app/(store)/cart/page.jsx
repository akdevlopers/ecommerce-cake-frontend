"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import { QtyStepper } from "@/components/cart/CartDrawer";
import FreeDeliveryBar from "@/components/cart/FreeDeliveryBar";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cartSubtotal, useCart } from "@/store/cart";
import { money } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
export default function CartPage() {
  const { items, setQty, remove } = useCart();
  const settings = useSettings();
  const hydrated = useHydrated();
  const subtotal = cartSubtotal(items);
  const free = settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove;
  const delivery = free ? 0 : settings.deliveryCharge;
  return (
    <>
      <PageBanner title="Shopping Cart" crumbs={[{ label: "Cart" }]} />
      <div className="container mt-14">
        {!hydrated ? (
          <div className="h-64 animate-pulse rounded-2xl bg-cream" />
        ) : items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blush">
              <ShoppingBag className="h-10 w-10 text-brand" />
            </div>
            <h2 className="text-2xl">Your cart is empty</h2>
            <p>You may check out all the available cakes and buy some in the shop.</p>
            <Link href="/shop" className="btn-dark mt-2">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-line pb-3 text-sm font-medium text-ink md:grid">
                <span>Product</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <ul className="divide-y divide-line">
                {items.map((i) => (
                  <li
                    key={i.key}
                    className="grid grid-cols-[80px_1fr] gap-4 py-6 md:grid-cols-[1fr_140px_120px_40px] md:items-center"
                  >
                    <div className="contents md:flex md:items-center md:gap-4">
                      <Link
                        href={`/product/${i.slug}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream md:h-24 md:w-24"
                      >
                        {i.image && <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover" />}
                      </Link>
                      <div>
                        <Link
                          href={`/product/${i.slug}`}
                          className="font-heading text-lg font-medium text-ink hover:text-brand"
                        >
                          {i.name}
                        </Link>
                        {i.variantLabel && <p className="text-sm text-ink-muted">{i.variantLabel}</p>}
                        {i.message && <p className="text-sm text-ink-muted">Message: “{i.message}”</p>}
                        <p className="text-sm">{money(i.unitPrice)} each</p>
                      </div>
                    </div>
                    <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:contents">
                      <QtyStepper value={i.qty} onChange={(q) => setQty(i.key, q)} small />
                      <span className="font-medium text-ink md:text-right">{money(i.qty * i.unitPrice)}</span>
                      <button
                        onClick={() => remove(i.key)}
                        className="text-ink-muted hover:text-red-600 md:justify-self-end"
                        aria-label={`Remove ${i.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/shop" className="link-underline mt-6">
                Continue shopping
              </Link>
            </div>

            <aside className="h-fit rounded-3xl bg-cream p-6 lg:sticky lg:top-28">
              <h2 className="mb-5 text-2xl">Order Summary</h2>
              <FreeDeliveryBar subtotal={subtotal} settings={settings} />
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-ink">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="text-ink">{delivery ? money(delivery) : "Free"}</dd>
                </div>
                <div className="flex justify-between border-t border-cream-dark pt-3 text-base">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="font-heading text-xl font-medium text-ink">{money(subtotal + delivery)}</dd>
                </div>
              </dl>
              <Link href="/checkout" className="btn-brand mt-6 w-full">
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Secure payment by Razorpay · UPI, cards, net banking
              </p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
