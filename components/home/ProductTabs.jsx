"use client";
import Link from "next/link";
import { useState } from "react";
import { HOME_TABS } from "@/lib/site";
import { cn } from "@/lib/format";
import ProductCard from "@/components/product/ProductCard";
export default function ProductTabs({ products }) {
  const [tab, setTab] = useState(HOME_TABS[0].value);
  const list = (
    tab === "best" ? products.filter((p) => p.bestSeller) : products.filter((p) => p.category?.slug === tab)
  ).slice(0, 8);
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 md:justify-center" role="tablist">
        {HOME_TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "shrink-0 rounded-full border px-6 py-2.5 text-sm font-medium transition",
              tab === t.value ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7" role="tabpanel">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center">New cakes coming soon in this category.</p>
      )}
      <div className="mt-12 text-center">
        <Link href="/shop" className="btn-outline">
          All products
        </Link>
      </div>
    </div>
  );
}
