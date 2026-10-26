"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-provider";
import { getVariants } from "@/lib/utils";

export function QuickAdd({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const variants = getVariants(product);
  const blocked = product.status === "out_of_stock" || product.status === "pending" || product.status === "held" || product.status === "discontinued";

  if (blocked) {
    return (
      <span className="pointer-events-none inline-flex items-center gap-1.5 bg-ink/80 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
        {product.status === "pending" ? "Coming soon" : product.status === "held" ? "On hold" : "Sold out"}
      </span>
    );
  }

  if (product.type !== "perfume") {
    const variant = variants[0];
    return (
      <button
        type="button"
        onClick={() => {
          add({
            key: `${product.id}-${variant.key}`,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.image,
            size: variant.label,
            sizeKey: variant.key,
            price: variant.price,
            qty: 1,
            kind: product.type,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
        className="inline-flex items-center gap-1.5 bg-cream/95 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm backdrop-blur transition hover:bg-ink hover:text-cream"
      >
        {added ? <Check size={12} /> : <Plus size={12} />}
        {added ? "Added" : compact ? "Add" : "Quick add"}
      </button>
    );
  }

  return (
    <div className="relative">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-cream/95 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm backdrop-blur transition hover:bg-ink hover:text-cream"
        >
          <Plus size={12} />
          {added ? "Added" : compact ? "Add" : "Quick add"}
        </button>
      ) : (
        <div className="animate-slide-up absolute bottom-0 right-0 w-44 bg-parchment p-2 shadow-lift">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone">Choose size</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close size picker" className="text-stone hover:text-ink">
              <X size={12} />
            </button>
          </div>
          <div className="space-y-0.5">
            {variants.map((variant) => (
              <button
                key={variant.key}
                type="button"
                onClick={() => {
                  add({
                    key: `${product.id}-${variant.key}`,
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    image: product.image,
                    size: variant.label,
                    sizeKey: variant.key,
                    price: variant.price,
                    qty: 1,
                    kind: product.type,
                  });
                  setOpen(false);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1800);
                }}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left text-[0.68rem] transition hover:bg-cream-deep"
              >
                <span>{variant.label}</span>
                <span className="text-stone">KSh {variant.price.toLocaleString("en-KE")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
