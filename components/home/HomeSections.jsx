import Image from "next/image";
import Link from "next/link";
import { Egg, Instagram, ShieldCheck, Truck, Wheat } from "lucide-react";
import { BLOG_POSTS, FEATURES, INSTAGRAM, SITE, u } from "@/lib/site";
import { formatDate } from "@/lib/format";
import SectionHeading from "@/components/ui/SectionHeading";
const ICONS = { wheat: Wheat, egg: Egg, truck: Truck, shield: ShieldCheck };
export function Features() {
  return (
    <section className="container mt-20">
      <div className="grid grid-cols-2 gap-6 rounded-3xl bg-cream p-6 md:p-10 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div key={f.title} className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-soft">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-base">{f.title}</h3>
                <p className="text-sm">{f.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export function CtaBanner() {
  return (
    <section className="container mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink">
        <Image
          src={u("1587668178277-295251f900ce", 1600, 700)}
          alt=""
          fill
          sizes="(min-width:1320px) 1280px, 100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        <div className="relative max-w-xl px-8 py-16 md:px-16 md:py-24">
          <p className="font-accent text-xs uppercase tracking-[0.25em] text-brand-light">Cake & Bakery</p>
          <h2 className="mt-3 text-4xl leading-tight text-white md:text-5xl">Celebrate with a custom cake</h2>
          <p className="mt-4 text-white/80">
            Weddings, birthdays, anniversaries — tell us your idea and our decorators will design a cake that&apos;s
            uniquely yours.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-brand">
              Enquire now
            </Link>
            <Link href="/shop" className="btn-light">
              View menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function BlogTeaser() {
  return (
    <section className="container mt-24">
      <SectionHeading eyebrow="From our kitchen" title="Latest from the Blog" />
      <div className="grid gap-8 md:grid-cols-3">
        {BLOG_POSTS.map((p) => (
          <article key={p.slug} className="group">
            <Link href={`/blog/${p.slug}`} className="relative block aspect-[3/2] overflow-hidden rounded-2xl">
              <Image
                src={p.image}
                alt=""
                fill
                sizes="(min-width:768px) 400px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-ink">
                {formatDate(p.date)}
              </span>
            </Link>
            <h3 className="mt-5 text-xl leading-snug">
              <Link href={`/blog/${p.slug}`} className="hover:text-brand">
                {p.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="link-underline mt-4">
              Read more
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
export function InstagramStrip() {
  return (
    <section className="mt-24">
      <div className="container mb-8 text-center">
        <p className="eyebrow mb-2">@sweetcrumbs</p>
        <h2 className="text-3xl">Follow us on Instagram</h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6">
        {INSTAGRAM.map((src, i) => (
          <a
            key={src}
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden"
            aria-label={`Instagram photo ${i + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width:768px) 17vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-brand/0 text-white opacity-0 transition group-hover:bg-brand/60 group-hover:opacity-100">
              <Instagram className="h-7 w-7" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
