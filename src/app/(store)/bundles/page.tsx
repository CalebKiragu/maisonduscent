import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, getWishlistIds } from "@/lib/queries";
import { ProductListing, sortProducts } from "@/components/store/listing";

export const metadata: Metadata = {
  title: "Perfume bundles & discovery sets",
  description: "Curated five-piece discovery sets, packed by hand in a keepsake box. Five scents for the price of one full bottle.",
};

export default async function BundlesPage() {
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getAllProducts("store").filter((p) => p.type === "bundle");

  return (
    <ProductListing
      eyebrow="Build your own"
      title="Discovery sets & bundles"
      description="Five 8 ml decants, packed by hand in a keepsake box with a complimentary mystery sample. The easiest way to build a fragrance wardrobe."
      basePath="/bundles"
      breadcrumbs={[{ label: "Bundles" }]}
      products={sortProducts(products)}
      wishlistIds={wishlistIds}
      totalLabel={`${products.length} sets`}
      filterLabel="Set"
    />
  );
}
