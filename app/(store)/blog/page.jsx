import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import { BLOG_POSTS } from "@/lib/site";
import { formatDate } from "@/lib/format";
export const metadata = { title: "Blog" };
export default function BlogPage() {
  return (
    <>
      <PageBanner title="Blog" crumbs={[{ label: "Blog" }]} />
      <section className="container mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((p) => (
          <article key={p.slug} className="group">
            <Link href={`/blog/${p.slug}`} className="relative block aspect-[3/2] overflow-hidden rounded-2xl">
              <Image
                src={p.image}
                alt=""
                fill
                sizes="(min-width:1024px) 400px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </Link>
            <p className="mt-5 text-sm text-ink-muted">{formatDate(p.date)} · 0 comments</p>
            <h2 className="mt-1 text-2xl leading-snug">
              <Link href={`/blog/${p.slug}`} className="hover:text-brand">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="link-underline mt-4">
              Read more
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
