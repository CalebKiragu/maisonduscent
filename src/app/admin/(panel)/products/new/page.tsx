import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getCollections } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const collections = getCollections().map((collection) => ({ slug: collection.slug, title: collection.title }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Add a product"
        description="Create a new decant, bundle, atomizer or gift card. Prices are in Kenyan shillings."
      />
      <ProductForm product={null} collections={collections} />
    </>
  );
}
