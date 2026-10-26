import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getNewArrivals, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "Just decanted at Maison du Scent — the newest designer and niche fragrances in the library.",
};

export default async function NewArrivalsPage({ searchParams }: { searchParams: Promise<{ family?: string; sort?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getNewArrivals(24);
  const filtered = params.family ? products.filter((p) => slugify(p.family) === params.family) : products;

  return (
    <ProductListing
      eyebrow="Just decanted"
      title="New arrivals"
      description="The newest additions to the library — sampled, worn and approved by the maison before they earn a place on the shelf."
      basePath="/new-arrivals"
      breadcrumbs={[{ label: "New arrivals" }]}
      products={sortProducts(filtered, params.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(products)}
      activeFilter={params.family}
      sort={params.sort}
      totalLabel={`${filtered.length} new scents`}
    />
  );
}
