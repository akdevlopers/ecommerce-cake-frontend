import Image from "next/image";
import Link from "next/link";
import { PROMOS } from "@/lib/site";
import { cn } from "@/lib/format";
export default function PromoBanners() {
  return (
    <section className="container mt-20 grid gap-6 md:grid-cols-3">
      {PROMOS.map((p) => (
        <Link
          key={p.title}
          href={p.href}
          className={cn("group relative flex min-h-[220px] items-center overflow-hidden rounded-3xl p-7", p.bg)}
        >
          <div className="relative z-10 max-w-[55%]">
            <p className="font-accent text-xs uppercase tracking-[0.2em] text-brand">{p.eyebrow}</p>
            <h3 className="mb-5 mt-2 text-2xl leading-tight">{p.title}</h3>
            <span className="link-underline">All products</span>
          </div>
          <div className="absolute -right-6 bottom-0 top-0 my-auto aspect-square h-[85%] overflow-hidden rounded-full shadow-card transition duration-500 group-hover:-translate-x-2 group-hover:scale-105">
            <Image src={p.image} alt="" fill sizes="220px" className="object-cover" />
          </div>
        </Link>
      ))}
    </section>
  );
}
