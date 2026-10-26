import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBestsellers, getWishlistProducts } from "@/lib/queries";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = { title: "My wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser();
  const wishlist = getWishlistProducts(user.id);
  const ids = wishlist.map((product) => product.id);
  const suggestions = getBestsellers(8).filter((product) => !ids.includes(product.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Saved scents</h2>
        <p className="mt-1 text-[0.74rem] text-stone">
          {wishlist.length ? `${wishlist.length} ${wishlist.length === 1 ? "fragrance" : "fragrances"} you're keeping close.` : "A place for the ones that caught your attention."}
        </p>
      </div>

      {wishlist.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 lg:gap-x-6 lg:gap-y-12">
          {wishlist.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} wishlisted refreshWishlist />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-line bg-parchment/60 px-6 py-14 text-center">
          <Heart size={24} strokeWidth={1.2} className="mx-auto text-mist" />
          <p className="mt-3 font-display text-xl">Nothing saved yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[0.74rem] leading-relaxed text-stone">
            Tap the heart on any perfume and it will wait for you here — no pressure, no sold-out sizes.
          </p>
          <Link href="/perfumes" className="btn btn-ink btn-sm mt-4">Explore the collection</Link>
        </div>
      )}

      {suggestions.length ? (
        <section className="border-t border-line pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-wine">Most loved</p>
              <h3 className="mt-2 font-display text-2xl">Start here</h3>
            </div>
            <Link href="/best-sellers" className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">Best sellers</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
