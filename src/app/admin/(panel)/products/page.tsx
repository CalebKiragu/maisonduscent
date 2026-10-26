import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink, Plus, Search, Upload } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/queries";
import { archiveProductAction, quickStatusAction, quickStockAction } from "@/lib/actions/admin";
import { formatMoney, startingPrice } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS, type ProductStatus } from "@/lib/types";
import { ProductStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_stock", label: "In stock" },
  { key: "low_stock", label: "Low stock" },
  { key: "out_of_stock", label: "Out of stock" },
  { key: "pending", label: "Pending" },
  { key: "held", label: "Held" },
  { key: "discontinued", label: "Archived" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; saved?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const q = (query.q ?? "").trim().toLowerCase();
  const status = STATUS_FILTERS.some((item) => item.key === query.status) ? (query.status as string) : "all";
  const type = ["perfume", "bundle", "atomizer"].includes(query.type ?? "") ? (query.type as string) : "all";

  const all = getAllProducts("admin");
  const products = all.filter((product) => {
    if (status !== "all" && product.status !== status) return false;
    if (type !== "all" && product.type !== type) return false;
    if (q && !`${product.name} ${product.brand} ${product.sku}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <AdminPageHeader
        eyebrow={`${all.length} products`}
        title="Inventory"
        description="Manage decant sizes, stock, media, visibility and product status. Archived products stay in order history but disappear from the storefront."
      >
        <Link href="/api/admin/export/products" className="btn btn-outline btn-sm"><Download size={13} /> Export CSV</Link>
        <Link href="/admin/products/import" className="btn btn-outline btn-sm"><Upload size={13} /> Import</Link>
        <Link href="/admin/products/new" className="btn btn-ink btn-sm"><Plus size={13} /> New product</Link>
      </AdminPageHeader>

      {query.saved ? <p className="mb-3 border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[0.74rem] text-emerald-800">Product saved successfully.</p> : null}
      {query.deleted ? <p className="mb-3 border border-rose-200 bg-rose-50 px-4 py-2.5 text-[0.74rem] text-rose-800">Product permanently deleted.</p> : null}

      <div className="mb-3 grid gap-px overflow-hidden border border-[#e4ddd0] bg-[#e4ddd0] sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total products", value: all.length },
          { label: "In stock", value: all.filter((product) => product.status === "in_stock").length },
          { label: "Low stock", value: all.filter((product) => product.status === "low_stock").length },
          { label: "Out / held / pending", value: all.filter((product) => ["out_of_stock", "held", "pending"].includes(product.status)).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#fffdf9] px-4 py-3">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-stone">{stat.label}</p>
            <p className="mt-1 font-display text-2xl leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Product catalogue"
        description="Search, filter and update stock inline"
        action={
          <form method="get" className="flex items-center gap-2">
            {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            <label className="flex items-center gap-1.5 border border-[#ddd4c4] bg-[#fffdf9] px-2.5 py-1.5">
              <Search size={13} className="text-stone" />
              <input name="q" defaultValue={query.q ?? ""} placeholder="Name, brand or SKU" className="w-32 bg-transparent text-[0.72rem] outline-none sm:w-44" />
            </label>
            <button type="submit" className="btn btn-outline btn-sm">Search</button>
          </form>
        }
      >
        <div className="flex flex-wrap items-center gap-1 border-b border-[#eee7db] px-3 py-2">
          {STATUS_FILTERS.map((filter) => {
            const href = `/admin/products?${new URLSearchParams({ ...(filter.key !== "all" ? { status: filter.key } : {}), ...(type !== "all" ? { type } : {}), ...(q ? { q } : {}) }).toString()}`;
            return (
              <Link key={filter.key} href={href} className={`px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${status === filter.key ? "bg-ink text-cream" : "text-stone hover:text-ink"}`}>
                {filter.label}
              </Link>
            );
          })}
          <span className="ml-auto text-[0.6rem] text-stone">{products.length} shown</span>
        </div>

        {products.length ? (
          <div className="table-scroll">
            <table className="admin-table w-full min-w-[62rem]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU / type</th>
                  <th>From</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Flags</th>
                  <th className="text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-[#eee7db]">
                          {product.image ? <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" /> : null}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-wine">{product.name}</Link>
                          <p className="text-[0.64rem] text-stone">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-mono text-[0.66rem]">{product.sku}</p>
                      <p className="text-[0.6rem] uppercase tracking-[0.08em] text-stone">{product.type}</p>
                    </td>
                    <td className="whitespace-nowrap">{formatMoney(startingPrice(product))}</td>
                    <td>
                      <form action={quickStockAction} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          defaultValue={product.stock}
                          className="w-16 border border-[#ddd4c4] bg-[#fffdf9] px-2 py-1 text-[0.72rem] outline-none focus:border-wine"
                          aria-label={`Stock for ${product.name}`}
                        />
                        <button type="submit" className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-wine hover:text-ink">Save</button>
                      </form>
                    </td>
                    <td>
                      <form action={quickStatusAction} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={product.id} />
                        <select name="status" defaultValue={product.status} className="border border-[#ddd4c4] bg-[#fffdf9] px-1.5 py-1 text-[0.66rem] outline-none focus:border-wine" aria-label={`Status for ${product.name}`}>
                          {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((value) => (
                            <option key={value} value={value}>{PRODUCT_STATUS_LABELS[value]}</option>
                          ))}
                        </select>
                        <button type="submit" className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-wine hover:text-ink">Set</button>
                      </form>
                      <div className="mt-1"><ProductStatusBadge status={product.status} /></div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {product.bestseller ? <span className="badge border-line bg-[#faf7f1] text-stone">Best</span> : null}
                        {product.new_arrival ? <span className="badge border-line bg-[#faf7f1] text-stone">New</span> : null}
                        {product.featured ? <span className="badge border-line bg-[#faf7f1] text-stone">Feature</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2.5">
                        <Link href={`/perfumes/${product.slug}`} target="_blank" className="text-stone hover:text-ink" aria-label="View on storefront"><ExternalLink size={14} /></Link>
                        <Link href={`/admin/products/${product.id}`} className="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-wine hover:text-ink">Edit</Link>
                        {product.status !== "discontinued" ? (
                          <form action={archiveProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <ConfirmButton message={`Archive ${product.name}? It will disappear from the storefront.`} className="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-stone hover:text-rose-700">
                              Archive
                            </ConfirmButton>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No products match"
            description="Try a different search or status filter, or add a new product to the catalogue."
            action={<Link href="/admin/products/new" className="btn btn-ink btn-sm"><Plus size={13} /> Add product</Link>}
          />
        )}
      </Panel>
    </>
  );
}
