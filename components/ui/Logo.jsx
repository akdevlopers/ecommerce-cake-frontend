"use client";
import Link from "next/link";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cn } from "@/lib/format";

/** Default mark, used until a logo is uploaded in Admin > Settings. */
export function CakeMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#E31C79" />
      <path d="M11 27h18v3H11z" fill="#fff" />
      <path d="M12 20h16v7H12z" fill="#FCE4EF" />
      <path d="M12 20c2 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0v-2H12z" fill="#fff" />
      <path d="M19.2 11h1.6v6h-1.6z" fill="#fff" />
      <path d="M20 7c1.4 1.6 1.4 3 0 3.6-1.4-.6-1.4-2 0-3.6z" fill="#FFD27A" />
    </svg>
  );
}

/** The store's logo image if one is uploaded, otherwise the default mark. */
export function BrandMark({ logoUrl, className }) {
  if (!logoUrl) return <CakeMark className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logoUrl} alt="" className={cn("object-contain", className)} />;
}

/** Logo + store name + tagline, all from Admin > Settings. */
export default function Logo({ light = false, className, settings }) {
  const fromContext = useSettings();
  const { storeName, tagline, logoUrl } = settings || fromContext;
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5", className)} aria-label={`${storeName} home`}>
      <BrandMark logoUrl={logoUrl} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="min-w-0 whitespace-nowrap leading-none">
        <span
          className={cn(
            "block truncate font-heading text-lg font-semibold tracking-tight min-[400px]:text-xl sm:text-2xl",
            light ? "text-white" : "text-ink",
          )}
        >
          {storeName}
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-0.5 block truncate font-accent text-[8px] uppercase tracking-[0.2em] min-[400px]:text-[9px] sm:text-[10px] sm:tracking-[0.3em]",
              light ? "text-white/70" : "text-ink-muted",
            )}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
