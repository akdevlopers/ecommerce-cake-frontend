import Link from "next/link";
import { ChevronRight } from "lucide-react";
export default function PageBanner({ title, crumbs = [] }) {
  return (
    <section className="relative overflow-hidden bg-blush">
      <svg className="absolute -left-10 -top-10 h-48 w-48 text-white/60" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="currentColor" />
      </svg>
      <svg className="absolute -bottom-16 right-10 h-56 w-56 text-peach" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="currentColor" />
      </svg>
      <div className="container relative py-14 text-center md:py-20">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        <nav aria-label="Breadcrumb" className="mt-4">
          <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-brand">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current="page">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
