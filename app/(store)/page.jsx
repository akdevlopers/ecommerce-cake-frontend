import { getHomeTabs, getProducts } from "@/lib/api";
import HeroSlider from "@/components/home/HeroSlider";
import PromoBanners from "@/components/home/PromoBanners";
import ProductTabs from "@/components/home/ProductTabs";
import { CtaBanner, Features, InstagramStrip } from "@/components/home/HomeSections";
import SectionHeading from "@/components/ui/SectionHeading";
export const revalidate = 60;
export default async function HomePage() {
  const [products, homeTabs] = await Promise.all([getProducts(), getHomeTabs()]);
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
          <ProductTabs products={products} extraTabs={homeTabs} />
        ) : (
          <p className="text-center">Our menu is being updated — please check back shortly.</p>
        )}
      </section>

      <Features />
      <CtaBanner />

      <InstagramStrip />
    </>
  );
}
