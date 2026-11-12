"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, Rows3, SlidersHorizontal, X } from "lucide-react";
import { cn, money } from "@/lib/format";
import ProductCard from "./ProductCard";
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "name-asc", label: "Alphabetically, A–Z" },
  { value: "name-desc", label: "Alphabetically, Z–A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Date, new to old" },
];
function sortProducts(list, sort) {
  const l = [...list];
  switch (sort) {
    case "best-selling":
      return l.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    case "name-asc":
      return l.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return l.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return l.sort((a, b) => a.price - b.price);
    case "price-desc":
      return l.sort((a, b) => b.price - a.price);
    case "newest":
      return l.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default:
      return l;
  }
}
export default function ShopView({ products, categories, activeCategory }) {
  const [sort, setSort] = useState("featured");
  const [cols, setCols] = useState(3);
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const maxPrice = useMemo(() => Math.max(0, ...products.map((p) => p.price)), [products]);
  const [priceCap, setPriceCap] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const list = useMemo(() => {
    let l = products;
    if (egglessOnly) l = l.filter((p) => p.egglessAvailable);
    if (inStockOnly) l = l.filter((p) => p.inStock);
    if (priceCap !== null) l = l.filter((p) => p.price <= priceCap);
    return sortProducts(l, sort);
  }, [products, egglessOnly, inStockOnly, priceCap, sort]);
  const sidebar = (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg">Categories</h2>
        <ul className="space-y-2.5 text-sm">
          <li>
            <Link
              href="/shop"
              className={cn("flex justify-between hover:text-brand", !activeCategory && "font-medium text-brand")}
            >
              All cakes
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className={cn(
                  "flex justify-between hover:text-brand",
                  activeCategory === c.slug && "font-medium text-brand",
                )}
              >
                {c.name}
                <span className="text-ink-muted">({c.productCount ?? 0})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg">Availability</h2>
        <label className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={egglessOnly}
            onChange={(e) => setEgglessOnly(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Eggless available
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          In stock only
        </label>
      </div>
      {maxPrice > 0 && (
        <div>
          <h2 className="mb-4 text-lg">Price</h2>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1000}
            value={priceCap ?? maxPrice}
            onChange={(e) => setPriceCap(Number(e.target.value))}
            className="w-full accent-brand"
            aria-label="Maximum price"
          />
          <p className="mt-2 text-sm">
            Up to <strong className="text-ink">{money(priceCap ?? maxPrice)}</strong>
          </p>
        </div>
      )}
    </div>
  );
  return (
    <div className="container mt-14 grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{sidebar}</aside>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] animate-slide-in-left overflow-y-auto bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl">Filter</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <p className="text-sm">
              Showing <strong className="text-ink">{list.length}</strong> {list.length === 1 ? "cake" : "cakes"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="hidden gap-1 md:flex">
              <button
                onClick={() => setCols(3)}
                className={cn("rounded-full p-2", cols === 3 ? "bg-ink text-white" : "bg-white")}
                aria-label="3 columns"
              >
                <Rows3 className="h-4 w-4 rotate-90" />
              </button>
              <button
                onClick={() => setCols(4)}
                className={cn("rounded-full p-2", cols === 4 ? "bg-ink text-white" : "bg-white")}
                aria-label="4 columns"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {list.length ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-x-4 gap-y-10 lg:gap-x-7",
              cols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4",
            )}
          >
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line py-16 text-center">
            <p>No cakes match these filters.</p>
            <button
              onClick={() => {
                setEgglessOnly(false);
                setInStockOnly(false);
                setPriceCap(null);
              }}
              className="btn-outline btn-sm mt-4"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
