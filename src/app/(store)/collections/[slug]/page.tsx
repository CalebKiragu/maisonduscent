import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCollectionBySlug, getProductsByCollection, getWishlistIds } from "@/lib/queries";
import { ProductListing, sortProducts } from "@/components/store/listing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: `${collection.title} — perfume collection`,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getProductsByCollection(slug);

  return (
    <ProductListing
      eyebrow={collection.subtitle}
      title={collection.title}
      description={collection.description}
      basePath={`/collections/${slug}`}
      breadcrumbs={[{ label: "Collections", href: "/collections" }, { label: collection.title }]}
      products={sortProducts(products, query.sort)}
      wishlistIds={wishlistIds}
      sort={query.sort}
      totalLabel={`${products.length} scents`}
      hero={
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow text-wine">{collection.subtitle}</p>
            <h1 className="display-xl mt-4 text-balance">{collection.title}</h1>
            <p className="mt-5 max-w-xl text-[0.9rem] leading-relaxed text-stone">{collection.description}</p>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden bg-cream-deep lg:block">
            <Image src={collection.image} alt={collection.title} fill priority sizes="45vw" className="object-cover" />
          </div>
        </div>
      }
    />
  );
}
