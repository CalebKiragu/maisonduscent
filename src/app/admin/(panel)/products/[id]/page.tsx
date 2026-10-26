import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Package, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCollections, getProductById } from "@/lib/queries";
import { archiveProductAction, deleteProductAction } from "@/lib/actions/admin";
import { formatDateTime } from "@/lib/utils";
import { ProductForm } from "@/components/admin/product-form";
import { ProductStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = getProductById(Number(id));
  if (!product) notFound();
  const collections = getCollections().map((collection) => ({ slug: collection.slug, title: collection.title }));

  return (
    <>
      <AdminPageHeader
        eyebrow={`${product.sku} · updated ${formatDateTime(product.updated_at)}`}
        title={product.name}
        description={`${product.brand} · ${product.concentration} · ${product.type}`}
      >
        <ProductStatusBadge status={product.status} />
        <Link href={`/perfumes/${product.slug}`} target="_blank" className="btn btn-outline btn-sm"><ExternalLink size={13} /> View</Link>
        <Link href="/admin/products" className="btn btn-outline btn-sm">Back to inventory</Link>
      </AdminPageHeader>

      {query.saved ? <p className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[0.74rem] text-emerald-800">Product saved. The storefront has been refreshed.</p> : null}

      <ProductForm product={product} collections={collections} />

      <section className="admin-card mt-4 border-rose-200 p-5">
        <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-rose-800">Danger zone</h2>
        <p className="mt-2 max-w-2xl text-[0.7rem] leading-relaxed text-stone">
          Archiving hides the product from the storefront while keeping it in order history. Permanent deletion removes the product, its reviews and wishlist saves — order line items are preserved for accounting.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <form action={archiveProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton
              message={`Archive ${product.name}? It will be hidden from the storefront.`}
              className="btn btn-sm border border-amber-300 bg-amber-50 text-amber-900"
            >
              <Package size={13} /> Archive product
            </ConfirmButton>
          </form>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton
              message={`Permanently delete ${product.name}, its reviews and wishlist saves? This cannot be undone.`}
              className="btn btn-sm border border-rose-300 bg-rose-50 text-rose-800"
            >
              <Trash2 size={13} /> Delete permanently
            </ConfirmButton>
          </form>
        </div>
      </section>
    </>
  );
}
