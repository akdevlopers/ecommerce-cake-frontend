import { getProducts } from "@/lib/api";
import HeroSlider from "@/components/home/HeroSlider";
import PromoBanners from "@/components/home/PromoBanners";
import ProductTabs from "@/components/home/ProductTabs";
import { BlogTeaser, CtaBanner, Features, InstagramStrip } from "@/components/home/HomeSections";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
export const revalidate = 60;
export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <>
      <HeroSlider />
      <PromoBanners />

      <section className="container mt-24">
        <SectionHeading
          eyebrow="Fresh from the oven"
          title="Our Signature Cakes"
          text="Baked every morning with real butter, Belgian chocolate and seasonal fruit."
        />
        {products.length ? (
          <ProductTabs products={products} />
        ) : (
          <p className="text-center">Our menu is being updated — please check back shortly.</p>
        )}
      </section>

      <Features />
      <CtaBanner />

      {featured.length > 0 && (
        <section className="container mt-24">
          <SectionHeading eyebrow="Chef's picks" title="Trending This Week" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-7">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <BlogTeaser />
      <InstagramStrip />
    </>
  );
}
