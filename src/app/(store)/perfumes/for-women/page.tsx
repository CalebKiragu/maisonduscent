import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByGender, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Perfumes for her — authentic decants",
  description: "Floral, amber, woody and fresh designer and niche perfumes for her, hand-decanted in Mombasa.",
};

export default async function ForWomenPage({ searchParams }: { searchParams: Promise<{ family?: string; sort?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getProductsByGender("her");
  const filtered = params.family ? products.filter((p) => slugify(p.family) === params.family) : products;

  return (
    <ProductListing
      eyebrow="For her"
      title="Soft power, in a bottle"
      description="Rose in every mood, amber for the evening, clean musk for the everyday. Every decant is poured by hand from a sealed, authentic bottle."
      basePath="/perfumes/for-women"
      breadcrumbs={[{ label: "Perfumes", href: "/perfumes" }, { label: "For Her" }]}
      products={sortProducts(filtered, params.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(products)}
      activeFilter={params.family}
      sort={params.sort}
      totalLabel={`${filtered.length} scents`}
    />
  );
}
