import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, getWishlistIds } from "@/lib/queries";
import { ProductListing, sortProducts } from "@/components/store/listing";

export const metadata: Metadata = {
  title: "Travel atomizers",
  description: "Refillable 8 ml travel cases in amber aluminium and vegan leather. Carry your favourite decant anywhere.",
};

export default async function TravelAtomizersPage() {
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const products = getAllProducts("store").filter((p) => p.type === "atomizer");

  return (
    <ProductListing
      eyebrow="Carry your scent"
      title="Travel atomizers"
      description="Refillable 8 ml cases, made to hold a Maison du Scent decant. Machined aluminium or supple vegan leather — both slip into a pocket or evening bag."
      basePath="/travel-atomizers"
      breadcrumbs={[{ label: "Travel atomizers" }]}
      products={sortProducts(products)}
      wishlistIds={wishlistIds}
      totalLabel={`${products.length} cases`}
    />
  );
}
