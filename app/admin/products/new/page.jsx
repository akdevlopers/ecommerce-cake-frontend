"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <AdminPageHeader title="Add product" subtitle="Fill in the details and upload photos" />
      <ProductForm />
    </>
  );
}
