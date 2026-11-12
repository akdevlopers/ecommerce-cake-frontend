import Link from "next/link";
import { Plus } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import { FAQS } from "@/lib/site";
export const metadata = { title: "FAQs" };
export default function FaqPage() {
  return (
    <>
      <PageBanner title="Frequently Asked Questions" crumbs={[{ label: "FAQs" }]} />
      <section className="container mt-16 max-w-3xl">
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-white open:bg-cream">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-heading text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 transition group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center">
          Still have a question?{" "}
          <Link href="/contact" className="font-medium text-brand underline">
            Contact us
          </Link>
        </p>
      </section>
    </>
  );
}
