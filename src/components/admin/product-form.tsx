"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Save } from "lucide-react";
import type { Product } from "@/lib/types";
import { PRODUCT_STATUS_LABELS, type ProductStatus } from "@/lib/types";
import { saveProductAction, type AdminFormState } from "@/lib/actions/admin";
import { MediaUploader } from "./media-uploader";

const families = ["Floral", "Woody", "Amber", "Fresh", "Citrus", "Oriental", "Gourmand", "Musk", "Chypre", "Fougère"];
const concentrations = ["Eau de Parfum", "Eau de Toilette", "Extrait de Parfum", "Eau de Cologne", "Parfum"];

export function ProductForm({
  product,
  collections,
}: {
  product: Product | null;
  collections: { slug: string; title: string }[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveProductAction, {});
  const [image, setImage] = useState(product?.image ?? "");
  const [gallery, setGallery] = useState((product?.gallery ?? []).join("\n"));
  const galleryList = gallery.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

  return (
    <form action={action} className="space-y-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-4 py-3 text-[0.76rem] text-rose-800" role="alert">
          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Identity</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="name">Product name *</label>
                <input id="name" name="name" required defaultValue={product?.name ?? ""} className="admin-field" placeholder="Delina" />
              </div>
              <div>
                <label className="admin-label" htmlFor="brand">Brand *</label>
                <input id="brand" name="brand" required defaultValue={product?.brand ?? ""} className="admin-field" placeholder="Parfums de Marly" />
              </div>
              <div>
                <label className="admin-label" htmlFor="sku">SKU</label>
                <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className="admin-field font-mono" placeholder="Auto-generated if blank" />
              </div>
              <div>
                <label className="admin-label" htmlFor="slug">URL slug</label>
                <input id="slug" name="slug" defaultValue={product?.slug ?? ""} className="admin-field font-mono text-[0.72rem]" placeholder="delina-parfums-de-marly" />
              </div>
              <div>
                <label className="admin-label" htmlFor="type">Product type</label>
                <select id="type" name="type" defaultValue={product?.type ?? "perfume"} className="admin-field">
                  <option value="perfume">Perfume decant</option>
                  <option value="bundle">Bundle / discovery set</option>
                  <option value="atomizer">Travel atomizer</option>
                  <option value="giftcard">Gift card</option>
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="gender">Gender</label>
                <select id="gender" name="gender" defaultValue={product?.gender ?? "unisex"} className="admin-field">
                  <option value="her">For Her</option>
                  <option value="him">For Him</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="family">Scent family</label>
                <input id="family" name="family" list="family-options" defaultValue={product?.family ?? "Floral"} className="admin-field" />
                <datalist id="family-options">{families.map((family) => <option key={family} value={family} />)}</datalist>
              </div>
              <div>
                <label className="admin-label" htmlFor="concentration">Concentration</label>
                <input id="concentration" name="concentration" list="concentration-options" defaultValue={product?.concentration ?? "Eau de Parfum"} className="admin-field" />
                <datalist id="concentration-options">{concentrations.map((item) => <option key={item} value={item} />)}</datalist>
              </div>
              <div>
                <label className="admin-label" htmlFor="badge">Badge</label>
                <input id="badge" name="badge" defaultValue={product?.badge ?? ""} className="admin-field" placeholder="Best seller, Limited…" />
              </div>
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Pricing, stock & status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { name: "price_2", label: "2 ml price", value: product?.price_2 ?? 0 },
                { name: "price_5", label: "5 ml price", value: product?.price_5 ?? 0 },
                { name: "price_8", label: "8 ml price", value: product?.price_8 ?? 0 },
                { name: "price_30", label: "30 ml price", value: product?.price_30 ?? 0 },
              ].map((field) => (
                <div key={field.name}>
                  <label className="admin-label" htmlFor={field.name}>{field.label}</label>
                  <input id={field.name} name={field.name} type="number" min={0} defaultValue={field.value} className="admin-field" />
                </div>
              ))}
              <div>
                <label className="admin-label" htmlFor="cost_price">Cost price (KSh)</label>
                <input id="cost_price" name="cost_price" type="number" min={0} defaultValue={product?.cost_price ?? 0} className="admin-field" />
              </div>
              <div>
                <label className="admin-label" htmlFor="stock">Units in stock</label>
                <input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="admin-field" />
              </div>
              <div>
                <label className="admin-label" htmlFor="status">Availability status</label>
                <select id="status" name="status" defaultValue={product?.status ?? "in_stock"} className="admin-field">
                  {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((status) => (
                    <option key={status} value={status}>{PRODUCT_STATUS_LABELS[status]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="rating">Rating (0–5)</label>
                <input id="rating" name="rating" type="number" min={0} max={5} step={0.1} defaultValue={product?.rating ?? 4.5} className="admin-field" />
              </div>
              <div>
                <label className="admin-label" htmlFor="review_count">Review count</label>
                <input id="review_count" name="review_count" type="number" min={0} defaultValue={product?.review_count ?? 0} className="admin-field" />
              </div>
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Scent story</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="admin-label" htmlFor="description">Short description</label>
                <textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} className="admin-field" placeholder="A rose that behaves like a memory…" />
              </div>
              <div>
                <label className="admin-label" htmlFor="story">The story</label>
                <textarea id="story" name="story" rows={4} defaultValue={product?.story ?? ""} className="admin-field" placeholder="Longer editorial copy for the product page…" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="admin-label" htmlFor="top_notes">Top notes</label>
                  <textarea id="top_notes" name="top_notes" rows={2} defaultValue={(product?.top_notes ?? []).join(", ")} className="admin-field" placeholder="Lychee, bergamot" />
                </div>
                <div>
                  <label className="admin-label" htmlFor="heart_notes">Heart notes</label>
                  <textarea id="heart_notes" name="heart_notes" rows={2} defaultValue={(product?.heart_notes ?? []).join(", ")} className="admin-field" placeholder="Rose, peony" />
                </div>
                <div>
                  <label className="admin-label" htmlFor="base_notes">Base notes</label>
                  <textarea id="base_notes" name="base_notes" rows={2} defaultValue={(product?.base_notes ?? []).join(", ")} className="admin-field" placeholder="Vanilla, cashmeran" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Media</h2>
            <div className="mt-4 space-y-4">
              <MediaUploader value={image} onChange={setImage} />
              <input type="hidden" name="image" value={image} />
              <div>
                <label className="admin-label" htmlFor="gallery">Gallery images</label>
                <textarea
                  id="gallery"
                  name="gallery"
                  rows={3}
                  value={gallery}
                  onChange={(event) => setGallery(event.target.value)}
                  className="admin-field font-mono text-[0.7rem]"
                  placeholder="One image path per line"
                />
                <p className="mt-1 text-[0.6rem] text-stone">One path per line. The first image is used as a thumbnail.</p>
                {galleryList.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {galleryList.slice(0, 8).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="h-14 w-11 border border-[#ddd4c4] object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Merchandising</h2>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-2">
                {[
                  { name: "bestseller", label: "Best seller", checked: Boolean(product?.bestseller) },
                  { name: "new_arrival", label: "New arrival", checked: Boolean(product?.new_arrival) },
                  { name: "featured", label: "Featured on homepage", checked: Boolean(product?.featured) },
                ].map((flag) => (
                  <label key={flag.name} className="flex items-center gap-2 text-[0.75rem]">
                    <input type="checkbox" name={flag.name} defaultChecked={flag.checked} className="h-3.5 w-3.5 accent-wine" /> {flag.label}
                  </label>
                ))}
              </div>

              <div className="border-t border-[#eee7db] pt-3">
                <p className="admin-label">Collections</p>
                <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                  {collections.map((collection) => (
                    <label key={collection.slug} className="flex items-center gap-2 text-[0.72rem]">
                      <input
                        type="checkbox"
                        name="collections"
                        value={collection.slug}
                        defaultChecked={product?.collections.includes(collection.slug)}
                        className="h-3.5 w-3.5 accent-wine"
                      />
                      {collection.title}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#eee7db] pt-3">
                <label className="admin-label" htmlFor="bundle_items">Bundle contents (slugs)</label>
                <textarea
                  id="bundle_items"
                  name="bundle_items"
                  rows={3}
                  defaultValue={(product?.bundle_items ?? []).join(", ")}
                  className="admin-field font-mono text-[0.7rem]"
                  placeholder="delina-parfums-de-marly, bitter-peach-tom-ford"
                />
                <p className="mt-1 text-[0.6rem] text-stone">Only for bundles. Comma-separated perfume slugs.</p>
              </div>
            </div>
          </section>

          <section className="admin-card p-4 sm:p-5">
            <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Save</h2>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-stone">
              Saving updates the storefront immediately. Products marked out of stock, pending or held cannot be added to a bag.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">
                <Save size={13} /> {pending ? "Saving…" : "Save product"}
              </button>
              <Link href="/admin/products" className="btn btn-outline btn-sm">Cancel</Link>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
