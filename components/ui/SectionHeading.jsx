import { cn } from "@/lib/format";
export default function SectionHeading({ eyebrow, title, text, className }) {
  return (
    <div className={cn("mx-auto mb-10 max-w-2xl text-center md:mb-14", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl leading-tight md:text-[42px]">{title}</h2>
      <svg viewBox="0 0 120 12" className="mx-auto mt-4 h-3 w-24 text-brand" aria-hidden="true">
        <path
          d="M2 6c10-6 18 6 28 0s18 6 28 0 18 6 28 0 18 6 28 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {text && <p className="mt-4">{text}</p>}
    </div>
  );
}
