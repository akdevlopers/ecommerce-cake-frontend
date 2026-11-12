import { getCategories, getProducts } from "@/lib/api";
import PageBanner from "@/components/ui/PageBanner";
import ShopView from "@/components/product/ShopView";
export const revalidate = 60;
export const metadata = { title: "Shop All Cakes" };
export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageBanner title="Shop" crumbs={[{ label: "Shop" }]} />
      <ShopView products={products} categories={categories} />
    </>
  );
}
