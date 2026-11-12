import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, Wheat } from "lucide-react";
import { getProduct } from "@/lib/api";
import ProductGallery from "@/components/product/ProductGallery";
import ProductOptions from "@/components/product/ProductOptions";
import ProductInfoTabs from "@/components/product/ProductInfoTabs";
import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
export const revalidate = 60;
export async function generateMetadata({ params }) {
  const data = await getProduct(params.slug).catch(() => null);
  if (!data) return { title: "Cake not found" };
  const { product } = data;
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription, images: product.images.slice(0, 1) },
  };
}
export default async function ProductPage({ params }) {
  const data = await getProduct(params.slug);
  if (!data) notFound();
  const { product, related } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-cream">
        <nav aria-label="Breadcrumb" className="container py-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/shop" className="hover:text-brand">
                Shop
              </Link>
            </li>
            {product.category && (
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/category/${product.category.slug}`} className="hover:text-brand">
                  {product.category.name}
                </Link>
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-ink" aria-current="page">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <section className="container mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="mb-5 mt-2 text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <ProductOptions product={product} />
          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-brand" /> Baked fresh today
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" /> Book 24 hours ahead
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Secure Razorpay checkout
            </li>
          </ul>
        </div>
      </section>

      <ProductInfoTabs product={product} />

      {related.length > 0 && (
        <section className="container mt-10">
          <SectionHeading eyebrow="You may also like" title="Related Cakes" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-7">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
