import Link from "next/link";
import { Search } from "lucide-react";
import { getProducts } from "@/lib/api";
import { searchProducts, searchSuggestions } from "@/lib/search";
import PageBanner from "@/components/ui/PageBanner";
import ProductCard from "@/components/product/ProductCard";
export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };
export default async function SearchPage({ searchParams }) {
  const q = (searchParams.q || "").trim().slice(0, 60);
  const products = await getProducts();
  const results = q ? searchProducts(products, q) : [];
  const suggestions = searchSuggestions(products);
  return (
    <>
      <PageBanner title={q ? `Results for “${q}”` : "Search"} crumbs={[{ label: "Search" }]} />
      <div className="container mt-8 sm:mt-12">
        <form action="/search" className="mx-auto flex max-w-xl items-center gap-2 rounded-full bg-cream p-1.5 pl-4">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" />
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            enterKeyHint="search"
            defaultValue={q}
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-muted"
            placeholder="Search cakes, combos…"
          />
          <button className="btn-dark btn-sm shrink-0 !py-2.5">Search</button>
        </form>

        {suggestions.length > 0 && (
          <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.name}
                href={`/search?q=${encodeURIComponent(s.name)}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm text-ink transition hover:border-brand hover:text-brand"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.color || "#E31C79" }} />
                {s.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 sm:mt-12">
          {q && !results.length ? (
            <div className="py-6 text-center">
              <p className="font-heading text-xl text-ink">No results for “{q}”</p>
              <p className="mt-1">Check the spelling or try another word.</p>
              <Link href="/shop" className="btn-outline mt-6">
                Browse all cakes
              </Link>
            </div>
          ) : q ? (
            <>
              <p className="mb-6 text-sm">
                <strong className="text-ink">{results.length}</strong> {results.length === 1 ? "result" : "results"}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-ink-muted">Type a cake or combo name above to search.</p>
          )}
        </div>
      </div>
    </>
  );
}
