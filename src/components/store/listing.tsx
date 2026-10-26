import Link from "next/link";
import { Suspense } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./product-card";
import { SortSelect } from "./sort-select";
import { Breadcrumbs } from "./page-hero";

export interface FilterOption {
  label: string;
  value: string;
}

export function ProductListing({
  eyebrow,
  title,
  description,
  products,
  wishlistIds,
  basePath,
  breadcrumbs,
  filterLabel = "Family",
  filters = [],
  activeFilter,
  sort,
  totalLabel,
  emptyMessage = "No scents match this edit yet.",
  hero,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  wishlistIds?: number[];
  basePath: string;
  breadcrumbs?: { label: string; href?: string }[];
  filterLabel?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  sort?: string;
  totalLabel?: string;
  emptyMessage?: string;
  hero?: React.ReactNode;
}) {
  function filterHref(value: string) {
    const params = new URLSearchParams();
    if (value) params.set("family", value);
    if (sort && sort !== "featured") params.set("sort", sort);
    const q = params.toString();
    return `${basePath}${q ? `?${q}` : ""}`;
  }

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="shell pt-5">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        </div>
        <div className="shell pb-9 pt-8 sm:pb-12 sm:pt-10">
          {hero ?? (
            <div className="max-w-3xl">
              {eyebrow && <p className="eyebrow text-wine">{eyebrow}</p>}
              <h1 className="display-xl mt-3 text-balance">{title}</h1>
              {description && <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-stone">{description}</p>}
            </div>
          )}
        </div>
      </section>

      <section className="shell py-7">
        <div className="flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {filters.length > 0 && (
              <>
                <Link href={filterHref("")} data-active={!activeFilter} className="chip shrink-0">
                  All
                </Link>
                {filters.map((filter) => (
                  <Link key={filter.value} href={filterHref(filter.value)} data-active={activeFilter === filter.value} className="chip shrink-0">
                    {filter.label}
                  </Link>
                ))}
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-stone">
              {totalLabel ?? `${products.length} ${products.length === 1 ? "scent" : "scents"}`}
            </p>
            <Suspense fallback={<span className="text-[0.62rem] uppercase tracking-[0.12em] text-stone">{filterLabel} · Sort</span>}>
              <SortSelect basePath={basePath} />
            </Suspense>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl">{emptyMessage}</p>
            <p className="mt-2 text-sm text-stone">Try a different filter, or explore the full collection.</p>
            <Link href={basePath} className="btn btn-outline mt-6">Clear filters</Link>
          </div>
        ) : (
          <div className="mt-8">
            <ProductGrid products={products} wishlistIds={wishlistIds} />
          </div>
        )}
      </section>
    </>
  );
}

export function sortProducts(products: Product[], sort?: string): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-low":
      return list.sort((a, b) => (a.price_2 || a.price_30) - (b.price_2 || b.price_30));
    case "price-high":
      return list.sort((a, b) => (b.price_2 || b.price_30) - (a.price_2 || a.price_30));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
    case "newest":
      return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    default:
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          b.rating - a.rating,
      );
  }
}

export function familyFilters(products: Product[]): FilterOption[] {
  const families = Array.from(new Set(products.map((p) => p.family))).sort((a, b) => a.localeCompare(b));
  return families.map((family) => ({ label: family, value: family.toLowerCase().replace(/[^a-z0-9]+/g, "-") }));
}
