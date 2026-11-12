import Link from "next/link";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/format";
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
export default function Logo({ light = false, className }) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5", className)} aria-label={`${SITE.name} home`}>
      <CakeMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="min-w-0 whitespace-nowrap leading-none">
        <span
          className={cn("block font-heading text-lg font-semibold tracking-tight min-[400px]:text-xl sm:text-2xl", light ? "text-white" : "text-ink")}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            "mt-0.5 block font-accent text-[8px] uppercase tracking-[0.2em] min-[400px]:text-[9px] sm:text-[10px] sm:tracking-[0.3em]",
            light ? "text-white/70" : "text-ink-muted",
          )}
        >
          {SITE.tagline}
        </span>
      </span>
    </Link>
  );
}
