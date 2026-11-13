"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Clock, ShoppingBag, Zap } from "lucide-react";
import { cn } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import Price from "@/components/ui/Price";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { useCart } from "@/store/cart";

const EMPTY = [];
const matches = (variant, selected) => Object.entries(selected).every(([k, val]) => variant.options[k] === val);

/** A colour value the browser understands (e.g. "Red", "#f5c"), so it can be shown as a swatch. */
const isColour = (value) => typeof CSS !== "undefined" && CSS.supports?.("color", value);

export default function ProductOptions({ product, compact = false, onAdded, onVariantChange }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const add = useCart((s) => s.add);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const options = product.options || [];
  const variants = product.variants || EMPTY;
  const [selected, setSelected] = useState(() => {
    const first = variants.find((v) => v.inStock) || variants[0];
    return first ? { ...first.options } : {};
  });
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);

  const variant = useMemo(() => variants.find((v) => matches(v, selected)) || variants[0], [variants, selected]);

  useEffect(() => {
    onVariantChange?.(variant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?.id]);

  /** Selects a value; if that combination doesn't exist, jumps to the closest one that does. */
  function choose(name, value) {
    const wanted = { ...selected, [name]: value };
    const exact = variants.find((v) => matches(v, wanted));
    if (exact) return setSelected(wanted);
    const withValue = variants.filter((v) => v.options[name] === value);
    const best = withValue.find((v) => v.inStock) || withValue[0];
    if (best) setSelected({ ...best.options });
  }

  /** Whether picking this value (keeping the other choices) gives a variant that can be bought. */
  function available(name, value) {
    const wanted = { ...selected, [name]: value };
    const exact = variants.find((v) => matches(v, wanted));
    if (exact) return exact.inStock;
    return variants.some((v) => v.options[name] === value && v.inStock);
  }

  if (!variant) return null;
  const canBuy = product.inStock && variant.inStock;

  function addToCart(buyNow = false) {
    add(product, { variantId: variant.id, message, qty });
    onAdded?.();
    if (buyNow) {
      closeDrawer();
      router.push("/checkout");
    }
  }

  return (
    <div className="space-y-6">
      <Price price={variant.price} comparePrice={variant.comparePrice} size="lg" showBadge />

      {!compact && product.shortDescription && <p className="text-[15px]">{product.shortDescription}</p>}

      {options.map((o) => (
        <fieldset key={o.name}>
          <legend className="label">
            {o.name}: <span className="font-normal text-ink-soft">{selected[o.name]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((val) => {
              const active = selected[o.name] === val;
              const ok = available(o.name, val);
              // Colour set in the Variant Master, else a colour name the browser knows ("Red").
              const swatch = o.colors?.[val] || (hydrated && isColour(val) ? val : null);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => choose(o.name, val)}
                  aria-pressed={active}
                  title={ok ? val : `${val} (sold out)`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm transition",
                    active ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
                    !ok && "opacity-40 line-through",
                  )}
                >
                  {swatch && (
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                      style={{ background: swatch }}
                      aria-hidden
                    />
                  )}
                  {val}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {!compact && (
        <div>
          <label htmlFor="cake-message" className="label">
            Message on cake <span className="font-normal text-ink-muted">(optional, free)</span>
          </label>
          <input
            id="cake-message"
            className="input"
            maxLength={40}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Happy Birthday Ananya"
          />
          <p className="mt-1 text-right text-xs text-ink-muted">{message.length}/40</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(10, q)))} />
        <button
          type="button"
          onClick={() => addToCart()}
          disabled={!canBuy}
          className="btn-dark h-12 flex-1 whitespace-nowrap px-4 sm:px-7"
        >
          <ShoppingBag className="h-4 w-4" />
          {canBuy ? "Add to cart" : "Sold out"}
        </button>
      </div>
      {!compact && canBuy && (
        <button type="button" onClick={() => addToCart(true)} className="btn-brand h-12 w-full">
          <Zap className="h-4 w-4" /> Buy it now
        </button>
      )}

      {!compact && (
        <p className="flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm">
          <Clock className="h-4 w-4 shrink-0 text-brand" />
          <span>
            <strong className="text-ink">Delivery:</strong> order at least 24 hours ahead and choose your
            date at checkout.
          </span>
        </p>
      )}
    </div>
  );
}
