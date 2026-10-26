import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBrandBySlug, getProductsByBrand, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: `${brand.name} perfumes — authentic decants`,
    description: `Shop ${brand.name} perfume decants at Maison du Scent. Authentic, hand-decanted in Mombasa.`,
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ family?: string; sort?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getProductsByBrand(slug);
  const filtered = query.family ? products.filter((p) => slugify(p.family) === query.family) : products;

  return (
    <ProductListing
      eyebrow="The house"
      title={brand.name}
      description={`${brand.count} authentic ${brand.count === 1 ? "fragrance" : "fragrances"} from ${brand.name}, hand-decanted in 2 ml, 5 ml, 8 ml and 30 ml.`}
      basePath={`/brands/${slug}`}
      breadcrumbs={[{ label: "Brands", href: "/brands" }, { label: brand.name }]}
      products={sortProducts(filtered, query.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(products)}
      activeFilter={query.family}
      sort={query.sort}
      totalLabel={`${filtered.length} scents`}
    />
  );
}
