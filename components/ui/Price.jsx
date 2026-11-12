import { cn, discountPercent, money } from "@/lib/format";
export default function Price({ price, comparePrice, size = "md", showBadge = false }) {
  const off = discountPercent(price, comparePrice);
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span
        className={cn(
          "font-heading font-medium",
          off ? "text-brand" : "text-ink",
          size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {money(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-ink-muted line-through", size === "lg" ? "text-lg" : "text-sm")}>
            {money(comparePrice)}
          </span>
          {showBadge && (
            <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">-{off}%</span>
          )}
        </>
      )}
    </div>
  );
}
