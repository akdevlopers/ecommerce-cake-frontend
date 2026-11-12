"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "@/lib/site";
import { cn } from "@/lib/format";
export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HERO_SLIDES.length;
  const go = useCallback((i) => setIndex((i + count) % count), [count]);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);
  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.title}
          className={cn(
            "transition-opacity duration-700",
            s.bg,
            i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
          aria-hidden={i !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          <Decorations />
          <div className="container relative grid min-h-[560px] items-center gap-8 py-14 md:grid-cols-2 lg:min-h-[640px]">
            <div className={cn("text-center md:text-left", i === index && "animate-fade-up")}>
              <p className="eyebrow mb-4">{s.eyebrow}</p>
              <h1 className="text-[42px] font-medium leading-[1.05] sm:text-6xl lg:text-7xl">{s.title}</h1>
              <p className="mx-auto mt-6 max-w-md text-base md:mx-0 md:text-lg">{s.text}</p>
              <Link href={s.cta.href} className="btn-dark mt-8">
                {s.cta.label}
              </Link>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[520px]">
              <div className="absolute inset-[6%] rounded-full bg-white/70" />
              <div className="absolute inset-[10%] overflow-hidden rounded-full shadow-card">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width:768px) 480px, 90vw"
                  className="object-cover"
                />
              </div>
              <span className="absolute right-[4%] top-[12%] flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-brand text-center text-white shadow-card">
                <span className="font-accent text-[10px] uppercase tracking-widest">Baked</span>
                <span className="font-heading text-xl font-semibold leading-none">Fresh</span>
                <span className="font-accent text-[10px] uppercase tracking-widest">Daily</span>
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
        <button
          onClick={() => go(index - 1)}
          className="rounded-full bg-white/80 p-2 hover:bg-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-ink" : "w-2.5 bg-ink/25")}
          />
        ))}
        <button
          onClick={() => go(index + 1)}
          className="rounded-full bg-white/80 p-2 hover:bg-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
function Decorations() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className="absolute left-[4%] top-[12%] h-10 w-10 text-brand/30" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.6h7.6z" />
      </svg>
      <svg className="absolute bottom-[18%] left-[42%] h-6 w-6 text-mint/50" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
      </svg>
      <svg className="absolute right-[8%] top-[70%] h-8 w-8 text-coral/40" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z" />
      </svg>
    </div>
  );
}
