import Link from "next/link";
import { getProducts } from "@/lib/api";
import PageBanner from "@/components/ui/PageBanner";
import ProductCard from "@/components/product/ProductCard";
export const metadata = { title: "Search" };
export default async function SearchPage({ searchParams }) {
  const q = (searchParams.q || "").trim();
  const results = q ? await getProducts({ q }) : [];
  return (
    <>
      <PageBanner title={q ? `Results for “${q}”` : "Search"} crumbs={[{ label: "Search" }]} />
      <div className="container mt-14">
        <form action="/search" className="mx-auto mb-12 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <input id="q" name="q" defaultValue={q} className="input rounded-full" placeholder="Search for cakes…" />
          <button className="btn-dark">Search</button>
        </form>
        {q && !results.length ? (
          <div className="text-center">
            <p>No cakes found. Try “chocolate” or “cheesecake”.</p>
            <Link href="/shop" className="btn-outline mt-6">
              Browse all cakes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
