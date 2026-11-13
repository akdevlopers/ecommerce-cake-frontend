"use client";
import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { cn, money } from "@/lib/format";
import ProductCard from "./ProductCard";

const SORTS = [
  { value: "featured", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
  { value: "name-asc", label: "Name: A–Z" },
];

/** Quick filters, shown as chips. Each one only appears if some product matches it. */
const QUICK = [
  { key: "sale", label: "On sale", test: (p) => (p.variants || []).some((v) => v.comparePrice > v.price) },
  { key: "instock", label: "Available now", test: (p) => p.inStock },
];

function sortProducts(list, sort) {
  const l = [...list];
  switch (sort) {
    case "name-asc":
      return l.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return l.sort((a, b) => a.price - b.price);
    case "price-desc":
      return l.sort((a, b) => b.price - a.price);
    case "newest":
      return l.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default:
      // Recommended: products with more highlights first, keeping the store's order otherwise.
      return l.sort((a, b) => (b.highlights?.length || 0) - (a.highlights?.length || 0));
  }
}

/** Variant filters built from the products themselves: { Size: ["500 g", "1 kg"], Color: [...] } */
function variantGroups(products) {
  const groups = new Map();
  for (const p of products) {
    for (const o of p.options || []) {
      if (!groups.has(o.name)) groups.set(o.name, { values: [], colors: {} });
      const g = groups.get(o.name);
      for (const v of o.values) if (!g.values.includes(v)) g.values.push(v);
      Object.assign(g.colors, o.colors || {});
    }
  }
  // A filter with only one choice wouldn't narrow anything down.
  return [...groups.entries()].map(([name, g]) => ({ name, ...g })).filter((g) => g.values.length > 1);
}

/** Price buckets that fit the catalogue, e.g. Under ₹600 · ₹600–₹1,200 · Over ₹1,200 */
function priceBuckets(products) {
  const prices = products.map((p) => p.price).filter((n) => n > 0);
  if (prices.length < 2) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max - min < 20000) return [];
  const step = Math.ceil((max - min) / 3 / 10000) * 10000; // round to ₹100
  const a = Math.ceil((min + step) / 10000) * 10000;
  const b = a + step;
  return [
    { key: `0-${a}`, label: `Under ${money(a)}`, min: 0, max: a },
    { key: `${a}-${b}`, label: `${money(a)} – ${money(b)}`, min: a, max: b },
    { key: `${b}-`, label: `Over ${money(b)}`, min: b, max: Infinity },
  ];
}

export default function ShopView({ products }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [quick, setQuick] = useState([]); // keys of QUICK
  const [price, setPrice] = useState(null); // bucket key
  const [picked, setPicked] = useState({}); // { Size: ["1 kg"] }
  const [panelOpen, setPanelOpen] = useState(false);

  const groups = useMemo(() => variantGroups(products), [products]);
  const buckets = useMemo(() => priceBuckets(products), [products]);
  // Built-in quick filters plus one chip per custom highlight (New, Trending …) in use.
  const quickAll = useMemo(() => {
    const custom = new Map();
    for (const p of products) for (const h of p.highlights || []) custom.set(h.id, h);
    return [
      ...QUICK,
      ...[...custom.values()].map((h) => ({
        key: `h${h.id}`,
        label: h.name,
        color: h.color,
        test: (p) => (p.highlights || []).some((x) => x.id === h.id),
      })),
    ];
  }, [products]);
  const quickShown = useMemo(() => quickAll.filter((q) => products.some(q.test)), [quickAll, products]);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    const bucket = buckets.find((b) => b.key === price);
    const chosen = Object.entries(picked).filter(([, vals]) => vals.length);
    const out = products.filter((p) => {
      if (term && !`${p.name} ${p.shortDescription}`.toLowerCase().includes(term)) return false;
      for (const k of quick) if (!quickAll.find((q) => q.key === k)?.test(p)) return false;
      const variants = p.variants || [];
      // A product matches when one of its variants has every chosen value (and fits the price).
      return variants.some(
        (v) =>
          chosen.every(([name, vals]) => vals.includes(v.options?.[name])) &&
          (!bucket || (v.price >= bucket.min && v.price < bucket.max)),
      );
    });
    return sortProducts(out, sort);
  }, [products, query, quick, quickAll, price, picked, buckets, sort]);

  const toggleQuick = (k) => setQuick((q) => (q.includes(k) ? q.filter((x) => x !== k) : [...q, k]));
  const toggleValue = (name, value) =>
    setPicked((p) => {
      const cur = p[name] || [];
      return { ...p, [name]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });

  // Everything that is switched on, as removable pills.
  const active = [
    ...(query.trim() ? [{ key: "q", label: `“${query.trim()}”`, clear: () => setQuery("") }] : []),
    ...quick.map((k) => ({ key: k, label: quickAll.find((q) => q.key === k)?.label, clear: () => toggleQuick(k) })),
    ...(price ? [{ key: "price", label: buckets.find((b) => b.key === price)?.label, clear: () => setPrice(null) }] : []),
    ...Object.entries(picked).flatMap(([name, vals]) =>
      vals.map((v) => ({ key: `${name}:${v}`, label: `${name}: ${v}`, clear: () => toggleValue(name, v) })),
    ),
  ];
  const clearAll = () => {
    setQuery("");
    setQuick([]);
    setPrice(null);
    setPicked({});
  };
  const panelCount = (price ? 1 : 0) + Object.values(picked).reduce((n, v) => n + v.length, 0);
  const hasPanel = buckets.length > 0 || groups.length > 0;

  return (
    <div className="container mt-10 md:mt-14">
      {/* search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cakes…"
            aria-label="Search cakes"
            className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base text-ink outline-none transition focus:border-ink sm:text-sm"
          />
        </div>
        <div className="flex gap-3">
          {hasPanel && (
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              className={cn(
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition sm:flex-none",
                panelOpen || panelCount ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {panelCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px]">
                  {panelCount}
                </span>
              )}
            </button>
          )}
          <div className="relative flex-1 sm:flex-none">
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-line bg-white pl-5 pr-10 text-base text-ink outline-none transition hover:border-ink focus:border-ink sm:w-52 sm:text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </div>
      </div>

      {/* quick chips */}
      {quickShown.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={!quick.length} onClick={() => setQuick([])}>
            All cakes
          </Chip>
          {quickShown.map((q) => (
            <Chip key={q.key} active={quick.includes(q.key)} onClick={() => toggleQuick(q.key)} color={q.color}>
              {q.label}
            </Chip>
          ))}
        </div>
      )}

      {/* filter panel */}
      {panelOpen && hasPanel && (
        <div className="mt-4 animate-fade-up rounded-3xl border border-line bg-white p-5 md:p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {buckets.length > 0 && (
              <FilterGroup title="Price">
                {buckets.map((b) => (
                  <Chip key={b.key} small active={price === b.key} onClick={() => setPrice(price === b.key ? null : b.key)}>
                    {b.label}
                  </Chip>
                ))}
              </FilterGroup>
            )}
            {groups.map((g) => (
              <FilterGroup key={g.name} title={g.name}>
                {g.values.map((v) => (
                  <Chip
                    key={v}
                    small
                    active={(picked[g.name] || []).includes(v)}
                    onClick={() => toggleValue(g.name, v)}
                    color={g.colors[v]}
                  >
                    {v}
                  </Chip>
                ))}
              </FilterGroup>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={() => {
                setPrice(null);
                setPicked({});
              }}
              className="text-sm text-ink-soft underline-offset-4 hover:text-brand hover:underline"
            >
              Reset filters
            </button>
            <button type="button" onClick={() => setPanelOpen(false)} className="btn-dark btn-sm">
              Show {list.length} {list.length === 1 ? "cake" : "cakes"}
            </button>
          </div>
        </div>
      )}

      {/* result line + active pills */}
      <div className="mb-8 mt-6 flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm">
          <strong className="text-ink">{list.length}</strong> {list.length === 1 ? "cake" : "cakes"}
        </p>
        {active.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={a.clear}
            className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs text-ink transition hover:bg-blush"
          >
            {a.label}
            <X className="h-3 w-3" />
          </button>
        ))}
        {active.length > 1 && (
          <button type="button" onClick={clearAll} className="text-xs text-brand hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* grid */}
      {list.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-heading text-2xl text-ink">No cakes match</p>
          <p className="mt-2 text-sm">Try removing a filter or searching for something else.</p>
          <button onClick={clearAll} className="btn-outline btn-sm mt-6">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, small, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border font-medium transition",
        small ? "px-3.5 py-1.5 text-[13px]" : "px-5 py-2.5 text-sm",
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
      )}
    >
      {color ? (
        <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: color }} />
      ) : (
        active && small && <Check className="h-3.5 w-3.5" />
      )}
      {children}
    </button>
  );
}
