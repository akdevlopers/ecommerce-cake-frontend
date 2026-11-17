"use client";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { discountPercent } from "@/lib/format";
import Price from "@/components/ui/Price";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
function Badge({ children, className = "", style, title }) {
  return (
    <span
      title={title}
      style={style}
      className={`max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 text-white shadow-sm sm:px-2.5 sm:text-[11px] ${className}`}
    >
      {children}
    </span>
  );
}
export default function ProductCard({ product, priority = false }) {
  const add = useCart((s) => s.add);
  const openQuickView = useUi((s) => s.openQuickView);
  const [img1, img2] = product.images;
  const off = discountPercent(product.price, product.comparePrice);
  const href = `/product/${product.slug}`;
  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
        <Link href={href} aria-label={product.name} className="block h-full w-full">
          {img1 && (
            <Image
              src={img1}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          )}
          {img2 && (
            <Image
              src={img2}
              alt=""
              fill
              sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw"
              className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badges: one compact row — sold out / discount / first highlight, then "+N" for the rest. */}
        {(() => {
          const highlights = product.highlights || [];
          const extra = highlights.slice(1);
          if (product.inStock && !(off > 0) && !highlights.length) return null;
          return (
            <div className="pointer-events-none absolute left-2 right-2 top-2 flex flex-wrap items-start gap-1 sm:left-3 sm:right-3 sm:top-3 sm:gap-1.5">
              {!product.inStock && <Badge className="bg-ink">Sold out</Badge>}
              {off > 0 && <Badge className="bg-brand">-{off}%</Badge>}
              {highlights[0] && <Badge style={{ background: highlights[0].color }}>{highlights[0].name}</Badge>}
              {extra.length > 0 && (
                <Badge className="pointer-events-auto cursor-default bg-white/90 !text-ink backdrop-blur" title={extra.map((h) => h.name).join(", ")}>
                  +{extra.length}
                </Badge>
              )}
            </div>
          );
        })()}

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 transition duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            onClick={() => openQuickView(product)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-soft transition hover:bg-brand hover:text-white"
            aria-label={`Quick view ${product.name}`}
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            disabled={!product.inStock}
            onClick={() => {
              // Products with choices (colour, size…) open the quick view so the shopper can pick.
              const variants = product.variants || [];
              const buyable = variants.filter((v) => v.inStock);
              if (variants.length === 1 && buyable.length === 1) {
                add(product, { variantId: buyable[0].id, message: "", qty: 1 });
              } else openQuickView(product);
            }}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-medium uppercase tracking-wider text-ink shadow-soft transition hover:bg-brand hover:text-white disabled:opacity-50"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="mt-1 text-[17px] leading-snug">
          <Link href={href} className="transition hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex justify-center">
          <Price price={product.price} comparePrice={product.comparePrice} />
        </div>
      </div>
    </article>
  );
}
