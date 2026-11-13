"use client";
import { useState } from "react";
import ProductGallery from "./ProductGallery";
import ProductOptions from "./ProductOptions";
/** Gallery + options side by side; picking a variant with its own photo shows that photo. */
export default function ProductDetail({ product, children }) {
  const [active, setActive] = useState(0);
  return (
    <section className="container mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery images={product.images} name={product.name} active={active} onActiveChange={setActive} />
      <div>
        {product.highlights?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {(product.highlights || []).map((h) => (
              <span
                key={h.id}
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: h.color }}
              >
                {h.name}
              </span>
            ))}
          </div>
        )}
        <h1 className="mb-5 text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <ProductOptions
          product={product}
          onVariantChange={(v) => {
            const i = v?.image ? product.images.indexOf(v.image) : -1;
            if (i >= 0) setActive(i);
          }}
        />
        {children}
      </div>
    </section>
  );
}
