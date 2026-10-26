import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, getWishlistIds } from "@/lib/queries";
import { ProductListing, familyFilters, sortProducts } from "@/components/store/listing";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All perfumes — designer & niche decants",
  description: "Browse every authentic perfume decant in the Maison du Scent collection. Filter by fragrance family and find your signature.",
};

export default async function PerfumesPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [user, all] = await Promise.all([getCurrentUser(), Promise.resolve(getAllProducts("store"))]);
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const perfumes = all.filter((p) => p.type === "perfume");
  const filtered = params.family ? perfumes.filter((p) => slugify(p.family) === params.family) : perfumes;

  return (
    <ProductListing
      eyebrow="The library"
      title="Every scent in the maison"
      description="Authentic designer and niche fragrances, hand-decanted in 2 ml, 5 ml, 8 ml and 30 ml. Filter by family, or let the quiz point you in the right direction."
      basePath="/perfumes"
      breadcrumbs={[{ label: "Perfumes" }]}
      products={sortProducts(filtered, params.sort)}
      wishlistIds={wishlistIds}
      filters={familyFilters(perfumes)}
      activeFilter={params.family}
      sort={params.sort}
      totalLabel={`${filtered.length} scents`}
    />
  );
}
