"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import VariantTypeForm from "@/components/admin/VariantTypeForm";
import { adminApi } from "@/lib/admin";

export default function EditVariantPage({ params }) {
  const [type, setType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi(`/variant-types/${params.id}`)
      .then(setType)
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!type) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  return (
    <>
      <AdminPageHeader
        title={`Edit ${type.name}`}
        subtitle={type.productCount ? `Used in ${type.productCount} product(s)` : "Not used by any product yet"}
      />
      <VariantTypeForm type={type} />
    </>
  );
}
