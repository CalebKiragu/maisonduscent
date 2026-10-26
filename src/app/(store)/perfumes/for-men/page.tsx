import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByGender, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Perfumes for him — authentic decants",
  description: "Woody, fresh, amber and niche fragrances for him, hand-decanted in Mombasa. Try before you commit.",
};

export default async function ForMenPage({ searchParams }: { searchParams: Promise<{ family?: string; sort?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getProductsByGender("him");
  const filtered = params.family ? products.filter((p) => slugify(p.family) === params.family) : products;

  return (
    <ProductListing
      eyebrow="For him"
      title="Quiet confidence, distilled"
      description="From bright citrus to deep oud and amber. Designer signatures and niche heavyweights, decanted so you can live with them before you commit."
      basePath="/perfumes/for-men"
      breadcrumbs={[{ label: "Perfumes", href: "/perfumes" }, { label: "For Him" }]}
      products={sortProducts(filtered, params.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(products)}
      activeFilter={params.family}
      sort={params.sort}
      totalLabel={`${filtered.length} scents`}
    />
  );
}
