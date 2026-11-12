import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/api";
import PageBanner from "@/components/ui/PageBanner";
import ShopView from "@/components/product/ShopView";
export const revalidate = 60;
export async function generateMetadata({ params }) {
  const categories = await getCategories();
  const c = categories.find((x) => x.slug === params.slug);
  return { title: c?.name || "Category" };
}
export default async function CategoryPage({ params }) {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ category: params.slug })]);
  const category = categories.find((c) => c.slug === params.slug);
  if (!category && categories.length) notFound();
  const title = category?.name || "Cakes";
  return (
    <>
      <PageBanner title={title} crumbs={[{ label: "Shop", href: "/shop" }, { label: title }]} />
      <ShopView products={products} categories={categories} activeCategory={params.slug} />
    </>
  );
}
