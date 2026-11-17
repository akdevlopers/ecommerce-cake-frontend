"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { useUi } from "@/store/ui";
import { api, normalizeProduct } from "@/lib/api";
import { searchProducts, searchSuggestions } from "@/lib/search";
import Price from "@/components/ui/Price";

const MAX_RESULTS = 8;

/** Search popup: full screen on phones, a panel under the header on larger screens. */
export default function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState(null); // null = loading
  const [failed, setFailed] = useState(false);
  const inputRef = useRef(null);

  // Load the live product list each time the popup opens (it is small, so search is instant).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setFailed(false);
    api("/products")
      .then((list) => !cancelled && setProducts(list.map(normalizeProduct)))
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setProducts((p) => p || []);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const term = q.trim();
  const results = useMemo(() => (products && term ? searchProducts(products, term) : []), [products, term]);
  const suggestions = useMemo(() => (products ? searchSuggestions(products) : []), [products]);
  // Shown before typing: highlighted products first, then the rest.
  const featured = useMemo(
    () =>
      (products || [])
        .slice()
        .sort((a, b) => (b.highlights?.length || 0) - (a.highlights?.length || 0))
        .slice(0, 4),
    [products],
  );

  if (!open) return null;
  const close = () => setOpen(false);
  const goToResults = () => {
    if (!term) return;
    close();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 hidden animate-fade-in bg-ink/40 sm:block" onClick={close} />
      <div className="relative flex h-full animate-fade-up flex-col bg-white shadow-card sm:h-auto sm:max-h-[85vh] sm:rounded-b-3xl">
        {/* Search field */}
        <div className="border-b border-line">
          <div className="container max-w-3xl py-3 sm:py-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToResults();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-1 items-center gap-3 rounded-full bg-cream px-4 py-2.5 ring-brand/30 focus-within:ring-2 sm:px-5 sm:py-3">
                <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                <label htmlFor="site-search" className="sr-only">
                  Search cakes
                </label>
                <input
                  id="site-search"
                  ref={inputRef}
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search cakes, combos…"
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted sm:text-lg [&::-webkit-search-cancel-button]:hidden"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="rounded-full p-1 text-ink-muted hover:bg-white hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-mist"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="container max-w-3xl py-4 sm:py-5">
            {products === null ? (
              <p className="flex items-center gap-2 py-6 text-sm text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : failed && !products.length ? (
              <p className="py-6 text-sm text-ink-muted">Cannot reach the server. Please try again.</p>
            ) : term ? (
              results.length ? (
                <>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">
                    {results.length} {results.length === 1 ? "result" : "results"}
                  </p>
                  <ResultList items={results.slice(0, MAX_RESULTS)} onPick={close} />
                  {results.length > MAX_RESULTS && (
                    <button onClick={goToResults} className="btn-outline btn-sm mt-4 w-full sm:w-auto">
                      View all {results.length} results <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-heading text-lg text-ink">No results for “{term}”</p>
                  <p className="mt-1 text-sm">Check the spelling or try another word.</p>
                  {suggestions.length > 0 && (
                    <div className="mt-5">
                      <Chips items={suggestions} onPick={setQ} center />
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                {suggestions.length > 0 && (
                  <section className="mb-6">
                    <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted">Quick search</h3>
                    <Chips items={suggestions} onPick={setQ} />
                  </section>
                )}
                {featured.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Popular now</h3>
                    <ResultList items={featured} onPick={close} />
                  </section>
                )}
                <Link
                  href="/shop"
                  onClick={close}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                >
                  Browse all cakes <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chips({ items, onPick, center = false }) {
  return (
    <div className={`flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>
      {items.map((s) => (
        <button
          key={s.name}
          type="button"
          onClick={() => onPick(s.name)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink transition hover:border-brand hover:text-brand"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: s.color || "#E31C79" }} />
          {s.name}
        </button>
      ))}
    </div>
  );
}

function ResultList({ items, onPick }) {
  return (
    <ul className="grid gap-1 sm:grid-cols-2 sm:gap-2">
      {items.map((p) => (
        <li key={p.id}>
          <Link
            href={`/product/${p.slug}`}
            onClick={onPick}
            className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-cream"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
              {p.images?.[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-heading text-[15px] font-medium leading-snug text-ink">{p.name}</span>
              <span className="mt-0.5 flex items-center gap-2">
                <Price price={p.price} comparePrice={p.comparePrice} size="sm" />
                {!p.inStock && <span className="text-xs text-ink-muted">· Sold out</span>}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
