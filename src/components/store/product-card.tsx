import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatMoney, startingPrice } from "@/lib/utils";
import { Stars } from "@/components/ui/stars";
import { QuickAdd } from "./quick-add";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  priority = false,
  wishlisted = false,
  compact = false,
  refreshWishlist = false,
}: {
  product: Product;
  priority?: boolean;
  wishlisted?: boolean;
  compact?: boolean;
  refreshWishlist?: boolean;
}) {
  const price = startingPrice(product);
  const notes = [...product.top_notes.slice(0, 2), ...product.heart_notes.slice(0, 1)].join(" · ");
  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link
          href={`/perfumes/${product.slug}`}
          className="img-zoom relative block aspect-[4/5] overflow-hidden bg-cream-deep"
        >
          <Image
            src={product.image}
            alt={`${product.name} by ${product.brand}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1 p-2.5">
          {product.badge && (
            <span className="bg-parchment/95 px-2 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-wine backdrop-blur">
              {product.badge}
            </span>
          )}
          {product.new_arrival && !product.badge && (
            <span className="bg-parchment/95 px-2 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
              New
            </span>
          )}
          {product.status === "low_stock" && (
            <span className="bg-amber-50/95 px-2 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-amber-800 backdrop-blur">
              Almost gone
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-parchment/90 text-ink backdrop-blur">
            <WishlistButton productId={product.id} initial={wishlisted} refreshOnChange={refreshWishlist} />
          </span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 translate-y-0 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <QuickAdd product={product} compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-stone">{product.brand}</p>
        <h3 className="mt-1.5 font-display text-[1.32rem] leading-[1.08] tracking-[-0.01em]">
          <Link href={`/perfumes/${product.slug}`} className="transition-colors hover:text-wine">
            {product.name}
          </Link>
        </h3>
        {!compact && <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-stone">{notes}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[0.78rem] text-ink">
            <span className="text-[0.56rem] uppercase tracking-[0.12em] text-stone">From </span>
            {formatMoney(price)}
          </p>
          <Stars rating={product.rating} size={10} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  wishlistIds = [],
  compact = false,
  refreshWishlist = false,
}: {
  products: Product[];
  wishlistIds?: number[];
  compact?: boolean;
  refreshWishlist?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          wishlisted={wishlistIds.includes(product.id)}
          compact={compact}
          refreshWishlist={refreshWishlist}
        />
      ))}
    </div>
  );
}
