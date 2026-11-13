"use client";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/format";
import ProductCard from "@/components/product/ProductCard";

const MAX_ITEMS = 8;

/**
 * Home page product tabs. Tabs come only from the admin: highlights with
 * "Home page tab" switched on (and at least one product). With no tabs, the
 * section simply shows the products.
 */
export default function ProductTabs({ products, extraTabs = [] }) {
  const tabs = extraTabs
    .map((h) => ({
      key: `h${h.id}`,
      label: h.name,
      color: h.color,
      items: products.filter((p) => (p.highlights || []).some((x) => x.id === h.id)),
    }))
    .filter((t) => t.items.length > 0);
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) || tabs[0];
  const list = (current ? current.items : products).slice(0, MAX_ITEMS);

  return (
    <div>
      {tabs.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 md:justify-center" role="tablist">
          {tabs.map((t) => {
            const on = t.key === current.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.key)}
                // Tabs stay neutral (black when selected); highlight colours are used on the product badges.
                className={cn(
                  "shrink-0 rounded-full border px-6 py-2.5 text-sm font-medium transition",
                  on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7" role="tabpanel">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/shop" className="btn-outline">
          All products
        </Link>
      </div>
    </div>
  );
}
