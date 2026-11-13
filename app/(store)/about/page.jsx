import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import SectionHeading from "@/components/ui/SectionHeading";
import { Features } from "@/components/home/HomeSections";
import { u } from "@/lib/site";
export const metadata = { title: "About Us" };
const STATS = [
  { value: "8+", label: "Years baking" },
  { value: "25k", label: "Cakes delivered" },
  { value: "100%", label: "Fresh daily" },
  { value: "4.9★", label: "Customer rating" },
];
export default function AboutPage() {
  return (
    <>
      <PageBanner title="About Us" crumbs={[{ label: "About" }]} />
      <section className="container mt-20 grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src={u("1517433670267-08bbd4be890f", 900, 1100)}
              alt="Our bakery counter"
              fill
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden aspect-square w-48 overflow-hidden rounded-3xl border-8 border-white shadow-card sm:block">
            <Image src={u("1597528662465-55ece5734101", 400, 400)} alt="" fill sizes="200px" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mb-6 mt-3 text-4xl leading-tight md:text-5xl">Baking happiness, one cake at a time</h2>
          <p className="mb-4">
            Humuzz Desserts started in a tiny home kitchen with one oven and a lot of love for good cake. Today our team of
            bakers and decorators makes hundreds of celebration cakes every week — still by hand, still fresh every
            morning.
          </p>
          <p className="mb-8">
            We use real butter, Belgian chocolate, fresh cream and seasonal fruit, and we never use pre-mixes.
          </p>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-heading text-3xl font-medium text-brand">{s.value}</dd>
                <dd className="text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
          <Link href="/shop" className="btn-dark mt-10">
            Explore our cakes
          </Link>
        </div>
      </section>

      <section className="container mt-28">
        <SectionHeading eyebrow="What we believe" title="Made with care, delivered with love" />
      </section>
      <Features />
    </>
  );
}
