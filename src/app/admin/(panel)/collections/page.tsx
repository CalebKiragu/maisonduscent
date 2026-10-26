import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Sparkles, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts, getCollections } from "@/lib/queries";
import { deleteCollectionAction } from "@/lib/actions/admin";
import { CollectionForm } from "@/components/admin/collection-form";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminPageHeader, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  await requireAdmin();
  const collections = getCollections();
  const products = getAllProducts("admin");

  return (
    <>
      <AdminPageHeader
        eyebrow="Merchandising"
        title="Collections"
        description="Curate the edits that guide shoppers — by mood, family, occasion or rarity. Products are assigned to collections from the product editor."
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {collections.map((collection) => {
            const count = products.filter((product) => product.collections.includes(collection.slug)).length;
            return (
              <article key={collection.id} className="admin-card">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <span className="relative h-24 w-full shrink-0 overflow-hidden bg-[#eee7db] sm:h-20 sm:w-28">
                    {collection.image ? <Image src={collection.image} alt={collection.title} fill sizes="112px" className="object-cover" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl leading-none">{collection.title}</h2>
                      <span className="h-3 w-3 rounded-full border border-[#ddd4c4]" style={{ background: collection.theme }} />
                    </div>
                    <p className="mt-1 text-[0.7rem] text-stone">{collection.subtitle}</p>
                    <p className="mt-1.5 text-[0.62rem] text-stone">
                      <code className="text-wine">/{collection.slug}</code> · {count} products · sort {collection.sort}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/collections/${collection.slug}`} target="_blank" className="text-stone hover:text-ink" aria-label="View collection"><ExternalLink size={15} /></Link>
                    <form action={deleteCollectionAction}>
                      <input type="hidden" name="id" value={collection.id} />
                      <ConfirmButton
                        message={`Delete the ${collection.title} collection? Products will remain, but will no longer appear in this edit.`}
                        className="text-stone hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
                <details className="border-t border-[#eee7db] px-4 py-3">
                  <summary className="cursor-pointer text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-wine">Edit collection</summary>
                  <div className="mt-4"><CollectionForm collection={collection} compact /></div>
                </details>
              </article>
            );
          })}

          {!collections.length ? (
            <div className="admin-card px-6 py-12 text-center">
              <Sparkles size={22} className="mx-auto text-mist" />
              <p className="mt-3 font-display text-xl">No collections yet</p>
              <p className="mt-1 text-[0.74rem] text-stone">Create your first edit using the form beside this panel.</p>
            </div>
          ) : null}
        </div>

        <Panel title="Create a collection" description="Appears across the storefront immediately" className="h-fit">
          <div className="p-4 sm:p-5">
            <CollectionForm />
          </div>
        </Panel>
      </div>
    </>
  );
}
