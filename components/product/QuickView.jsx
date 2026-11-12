"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUi } from "@/store/ui";
import ProductOptions from "./ProductOptions";
import { cn } from "@/lib/format";
export default function QuickView() {
  const product = useUi((s) => s.quickView);
  const close = useUi((s) => s.closeQuickView);
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
    if (!product) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [product, close]);
  if (!product) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="absolute inset-0 animate-fade-in bg-ink/50" onClick={close} />
      <div className="relative grid max-h-[90vh] w-full max-w-4xl animate-fade-up overflow-y-auto rounded-3xl bg-white md:grid-cols-2">
        <button
          onClick={close}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-soft hover:bg-mist"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="bg-cream p-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={product.images[active] || product.images[0]}
              alt={product.name}
              fill
              sizes="450px"
              className="object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg border-2",
                    i === active ? "border-brand" : "border-transparent",
                  )}
                  aria-label={`Image ${i + 1}`}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 md:p-8">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h2 className="mb-4 mt-2 text-3xl">{product.name}</h2>
          <ProductOptions product={product} compact onAdded={close} />
          <Link href={`/product/${product.slug}`} onClick={close} className="link-underline mt-6">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
