import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/ui/PageBanner";
import { POLICIES } from "@/lib/policies";
import { getSettings } from "@/lib/api";
import { BUSINESS } from "@/lib/site";
export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}
export function generateMetadata({ params }) {
  return { title: POLICIES[params.slug]?.title || "Policy" };
}
export default async function PolicyPage({ params }) {
  const policy = POLICIES[params.slug];
  if (!policy) notFound();
  const s = await getSettings();
  return (
    <>
      <PageBanner title={policy.title} crumbs={[{ label: policy.title }]} />
      <article className="prose-cake container mt-14 max-w-3xl">
        {policy.intro && <p>{policy.intro}</p>}
        {policy.sections.map((sec) => (
          <section key={sec.heading}>
            <h2>{sec.heading}</h2>
            {sec.body?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {sec.list && (
              <ul>
                {sec.list.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <section>
          <h2>Contact us</h2>
          <p>
            For any questions about this policy or your order, contact us using the details below or through our{" "}
            <Link href="/contact" className="text-brand underline">
              Contact Us
            </Link>{" "}
            page.
          </p>
          <address className="rounded-2xl bg-cream p-5 text-sm not-italic leading-relaxed">
            <strong className="text-ink">{s.storeName || BUSINESS.name}</strong>
            <br />
            {BUSINESS.addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            Phone:{" "}
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-brand">
              {s.phone}
            </a>
            {s.email && (
              <>
                <br />
                Email:{" "}
                <a href={`mailto:${s.email}`} className="hover:text-brand">
                  {s.email}
                </a>
              </>
            )}
          </address>
        </section>
        <p className="mt-10 text-sm text-ink-muted">Last updated: November 2026</p>
      </article>
    </>
  );
}
