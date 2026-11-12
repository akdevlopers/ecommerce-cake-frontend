import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import { POLICIES } from "@/lib/policies";
export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}
export function generateMetadata({ params }) {
  return { title: POLICIES[params.slug]?.title || "Policy" };
}
export default function PolicyPage({ params }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();
  return (
    <>
      <PageBanner title={policy.title} crumbs={[{ label: policy.title }]} />
      <article className="prose-cake container mt-14 max-w-3xl">
        {policy.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
        <p className="mt-10 text-sm text-ink-muted">Last updated: November 2026</p>
      </article>
    </>
  );
}
