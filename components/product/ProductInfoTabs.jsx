"use client";
import { useState } from "react";
import { cn } from "@/lib/format";
export default function ProductInfoTabs({ product }) {
  const tabs = [
    { id: "description", label: "Description", body: product.description || product.shortDescription },
    {
      id: "ingredients",
      label: "Ingredients & Allergens",
      body: product.ingredients || "Ask us for the full ingredient list.",
    },
    {
      id: "delivery",
      label: "Delivery & Care",
      body: "We deliver in the time slot you choose at checkout. Orders before 4 PM can be delivered the same day.\n\nKeep the cake refrigerated and take it out 20–30 minutes before serving. Best enjoyed within 48 hours.",
    },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active);
  return (
    <section className="container mt-14 sm:mt-20">
      <div
        className="no-scrollbar flex justify-start gap-6 overflow-x-auto border-b border-line sm:gap-8 md:justify-center"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              "-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-base font-medium transition sm:pb-4 sm:text-lg",
              t.id === active ? "border-brand text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mx-auto max-w-3xl py-10" role="tabpanel">
        {tab.body.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="mb-4 whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
