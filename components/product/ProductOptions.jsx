"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, ShoppingBag, Zap } from "lucide-react";
import { cn, money } from "@/lib/format";
import Price from "@/components/ui/Price";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { useCart } from "@/store/cart";
export default function ProductOptions({ product, compact = false, onAdded }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const [weightId, setWeightId] = useState(product.weights[0]?.id);
  const [eggless, setEggless] = useState(false);
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const weight = product.weights.find((w) => w.id === weightId) || product.weights[0];
  const extra = eggless ? product.egglessExtra : 0;
  const unit = weight.price + extra;
  const compare = weight.comparePrice ? weight.comparePrice + extra : null;
  function addToCart(buyNow = false) {
    add(product, { weightId: weight.id, eggless, message, qty });
    onAdded?.();
    if (buyNow) {
      closeDrawer();
      router.push("/checkout");
    }
  }
  return (
    <div className="space-y-6">
      <Price price={unit} comparePrice={compare} size="lg" showBadge />

      {!compact && product.shortDescription && <p className="text-[15px]">{product.shortDescription}</p>}

      <fieldset>
        <legend className="label">
          Size: <span className="font-normal text-ink-soft">{weight.label}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.weights.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWeightId(w.id)}
              aria-pressed={w.id === weight.id}
              className={cn(
                "rounded-full border px-5 py-2 text-sm transition",
                w.id === weight.id ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Type</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEggless(false)}
            aria-pressed={!eggless}
            className={cn(
              "rounded-full border px-5 py-2 text-sm transition",
              !eggless ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
            )}
          >
            With egg
          </button>
          <button
            type="button"
            disabled={!product.egglessAvailable}
            onClick={() => setEggless(true)}
            aria-pressed={eggless}
            className={cn(
              "rounded-full border px-5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40",
              eggless ? "border-mint bg-mint text-white" : "border-line text-ink hover:border-mint",
            )}
          >
            Eggless {product.egglessExtra > 0 && <span className="opacity-80">(+{money(product.egglessExtra)})</span>}
          </button>
        </div>
        {!product.egglessAvailable && (
          <p className="mt-1.5 text-xs text-ink-muted">This cake contains egg and can&apos;t be made eggless.</p>
        )}
      </fieldset>

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
        <button type="button" onClick={() => addToCart()} disabled={!product.inStock} className="btn-dark h-12 flex-1 whitespace-nowrap px-4 sm:px-7">
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? "Add to cart" : "Sold out"}
        </button>
      </div>
      {!compact && product.inStock && (
        <button type="button" onClick={() => addToCart(true)} className="btn-brand h-12 w-full">
          <Zap className="h-4 w-4" /> Buy it now
        </button>
      )}

      {!compact && (
        <p className="flex items-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm">
          <Clock className="h-4 w-4 shrink-0 text-brand" />
          <span>
            <strong className="text-ink">Estimate delivery:</strong> today if ordered before 4 PM, otherwise choose any
            date at checkout.
          </span>
        </p>
      )}
    </div>
  );
}
