"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { adminApi } from "@/lib/admin";

export default function EditProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi(`/products/${params.id}`)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!product) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <>
      <AdminPageHeader title={`Edit ${product.name}`}>
        {product.active && (
          <Link href={`/product/${product.slug}`} target="_blank" className="btn-outline btn-sm">
            <ExternalLink className="h-4 w-4" /> View in store
          </Link>
        )}
      </AdminPageHeader>
      <ProductForm product={product} />
    </>
  );
}
