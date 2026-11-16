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

/**
 * Store logo only (no name/tagline text), uploaded in Admin > Settings.
 * The image keeps its own aspect ratio, so wide logos display fully.
 * `size` = "md" (header) | "lg" (footer).
 */
export default function Logo({ className, settings, size = "md" }) {
  const fromContext = useSettings();
  const { storeName, logoUrl } = settings || fromContext;
  const height = size === "lg" ? "h-16 sm:h-20" : "h-12 sm:h-14";
  return (
    <Link href="/" className={cn("flex shrink-0 items-center", className)} aria-label={`${storeName || "Store"} home`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={storeName || "Logo"} className={cn("w-auto max-w-[200px] object-contain sm:max-w-[240px]", height)} />
      ) : (
        <CakeMark className={cn("aspect-square w-auto", height)} />
      )}
    </Link>
  );
}
