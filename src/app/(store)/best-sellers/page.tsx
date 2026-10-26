import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getBestsellers, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Best selling perfumes",
  description: "The authentic designer and niche fragrances our clients return to again and again.",
};

export default async function BestSellersPage({ searchParams }: { searchParams: Promise<{ family?: string; sort?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getBestsellers(24);
  const filtered = params.family ? products.filter((p) => slugify(p.family) === params.family) : products;

  return (
    <ProductListing
      eyebrow="The most loved"
      title="Best sellers"
      description="Eight fragrances our clients return to, bottle after bottle. Start with a decant; fall in love with the dry-down."
      basePath="/best-sellers"
      breadcrumbs={[{ label: "Best sellers" }]}
      products={sortProducts(filtered, params.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(products)}
      activeFilter={params.family}
      sort={params.sort}
      totalLabel={`${filtered.length} best sellers`}
    />
  );
}
