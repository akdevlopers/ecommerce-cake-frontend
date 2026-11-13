"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import VariantTypeForm from "@/components/admin/VariantTypeForm";

export default function NewVariantPage() {
  return (
    <>
      <AdminPageHeader title="Add variant" subtitle="Give it a name and add its values" />
      <VariantTypeForm />
    </>
  );
}
