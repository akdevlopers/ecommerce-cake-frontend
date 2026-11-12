import { Truck } from "lucide-react";
import { money } from "@/lib/format";
export default function FreeDeliveryBar({ subtotal, settings }) {
  if (!settings.freeDeliveryAbove) return null;
  const left = settings.freeDeliveryAbove - subtotal;
  const pct = Math.min(100, Math.round((subtotal / settings.freeDeliveryAbove) * 100));
  return (
    <div className="rounded-xl bg-cream p-3">
      <p className="mb-2 flex items-center gap-2 text-xs text-ink">
        <Truck className="h-4 w-4 text-brand" />
        {left > 0 ? (
          <span>
            Add <strong>{money(left)}</strong> more for <strong>free delivery</strong>
          </span>
        ) : (
          <span>
            You&apos;ve unlocked <strong>free delivery</strong> 🎉
          </span>
        )}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
