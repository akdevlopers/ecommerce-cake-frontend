import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import { BLOG_POSTS } from "@/lib/site";
import { formatDate } from "@/lib/format";
export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}
export function generateMetadata({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Blog" };
}
export default function BlogPostPage({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug);
  return (
    <>
      <PageBanner title={post.title} crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="container mt-14 max-w-3xl">
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(min-width:768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          {formatDate(post.date, { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="prose-cake mt-4 text-[17px]">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-14 border-t border-line pt-8">
          <h2 className="mb-4 text-xl">More from the blog</h2>
          <ul className="space-y-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="hover:text-brand">
                  {p.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </>
  );
}
