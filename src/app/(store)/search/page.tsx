import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProductsByGender, getWishlistIds, searchProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/page-hero";

export const metadata: Metadata = { title: "Search", description: "Search the Maison du Scent library by name, brand, note or mood." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const query = q.trim();
  const products = query.length > 0 ? searchProducts(query, 24) : [];
  const suggestions = getProductsByGender("unisex").slice(0, 4);

  return (
    <section className="shell py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <div className="mt-8 max-w-3xl">
        <p className="eyebrow text-wine">Search the maison</p>
        <h1 className="display-xl mt-3">{query ? <>Results for <span className="italic text-wine">“{query}”</span></> : "What are you looking for?"}</h1>
        <form action="/search" method="get" className="mt-6 flex items-center gap-3 border-b border-ink pb-2">
          <SearchIcon size={19} strokeWidth={1.4} className="text-stone" />
          <input name="q" defaultValue={query} placeholder="Try “Delina”, “oud”, “vanilla”, “gift”…" className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-mist" />
          <button type="submit" className="text-[0.62rem] font-semibold uppercase tracking-[0.15em]">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.14em] text-stone">Popular</span>
          {["Delina", "Baccarat", "Oud", "Vanilla", "Rose", "Gift sets"].map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="chip">{term}</Link>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8">
        {query && (
          <p className="mb-6 text-[0.68rem] uppercase tracking-[0.12em] text-stone">
            {products.length} {products.length === 1 ? "result" : "results"} for “{query}”
          </p>
        )}
        {query && products.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-3xl">Nothing in the library by that name.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone">
              Try a brand, a note like “oud” or “vanilla”, or a mood like “date night”. Or let the scent quiz narrow it down.
            </p>
            <Link href="/find-my-scent" className="btn btn-ink mt-6">Find my scent <ArrowRight size={14} /></Link>
          </div>
        )}
        {products.length > 0 && <ProductGrid products={products} wishlistIds={wishlistIds} />}
        {!query && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl">A good place to start</h2>
              <Link href="/best-sellers" className="link-underline text-[0.62rem] font-semibold uppercase tracking-[0.13em]">Best sellers</Link>
            </div>
            <ProductGrid products={suggestions} wishlistIds={wishlistIds} />
          </>
        )}
      </div>
    </section>
  );
}
