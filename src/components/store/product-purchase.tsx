"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag, Truck, MessageCircle, RotateCcw, BadgeCheck } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatMoney, getVariants, whatsappLink } from "@/lib/utils";
import { useCart, trackEvent } from "./cart-provider";
import { WishlistButton } from "./wishlist-button";

export function ProductPurchase({
  product,
  whatsappNumber,
  freeDeliveryThreshold,
  returnsDays,
  wishlisted,
}: {
  product: Product;
  whatsappNumber: string;
  freeDeliveryThreshold: number;
  returnsDays: number;
  wishlisted: boolean;
}) {
  const variants = getVariants(product);
  const defaultIndex = Math.min(2, Math.max(0, variants.length - 1));
  const [selected, setSelected] = useState(defaultIndex);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const variant = variants[selected];
  const blocked = product.status === "out_of_stock" || product.status === "pending" || product.status === "held" || product.status === "discontinued";

  const whatsappMessage = `Hello Maison du Scent, I'd like to order:\n\n${product.name} by ${product.brand}\nSize: ${variant.label}\nQuantity: ${qty}\nPrice: ${formatMoney(variant.price * qty)}\n\nIs it available?`;

  function addToBag() {
    add(
      {
        key: `${product.id}-${variant.key}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.image,
        size: variant.label,
        sizeKey: variant.key,
        price: variant.price,
        qty,
        kind: product.type,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-stone">{product.brand}</p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-[0.98] tracking-[-0.025em] sm:text-[3rem]">{product.name}</h1>
          <p className="mt-2 text-[0.72rem] text-stone">{product.family} · {product.concentration}</p>
        </div>
        <div className="pt-2">
          <WishlistButton productId={product.id} initial={wishlisted} className="p-1 text-stone hover:text-wine" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-gold" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
              </svg>
            ))}
          </span>
          <span className="text-[0.68rem] text-stone">{product.rating.toFixed(1)} · {product.review_count.toLocaleString("en-KE")} reviews</span>
        </div>
        <span className="h-3 w-px bg-line" />
        <span className={`text-[0.64rem] font-semibold uppercase tracking-[0.1em] ${blocked ? "text-rose-700" : product.status === "low_stock" ? "text-amber-700" : "text-moss"}`}>
          {blocked
            ? product.status === "pending"
              ? "Arriving soon"
              : product.status === "held"
                ? "Currently on hold"
                : "Sold out"
            : product.status === "low_stock"
              ? `Low stock · ${product.stock} left`
              : "In stock · ships today"}
        </span>
      </div>

      <p className="mt-5 text-[0.92rem] leading-relaxed text-ink-soft">{product.description}</p>

      {product.type === "bundle" && product.bundle_items.length > 0 && (
        <div className="mt-5 border border-line bg-parchment p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-stone">Inside this set</p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-soft">
            {product.bundle_items.map((slug) => slug.replace(/-/g, " ")).join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Size</p>
          <span className="text-[0.6rem] text-stone">{variant.ml ? `${variant.label} · approx. ${variant.sprays} sprays` : variant.label}</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {variants.map((option, index) => (
            <button
              key={option.key}
              onClick={() => setSelected(index)}
              className={`border px-3 py-3 text-left transition ${selected === index ? "border-ink bg-ink text-cream" : "border-line bg-parchment hover:border-ink/40"}`}
            >
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.08em]">{option.label}</span>
              <span className={`mt-0.5 block text-[0.7rem] ${selected === index ? "text-cream/70" : "text-stone"}`}>{formatMoney(option.price)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex items-center border border-line bg-parchment">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="px-3 text-stone hover:text-ink">
            <Minus size={14} />
          </button>
          <span className="min-w-8 text-center text-[0.8rem]">{qty}</span>
          <button onClick={() => setQty(Math.min(20, qty + 1))} aria-label="Increase quantity" className="px-3 text-stone hover:text-ink">
            <Plus size={14} />
          </button>
        </div>
        <button
          onClick={addToBag}
          disabled={blocked}
          className={`btn flex-1 ${blocked ? "cursor-not-allowed bg-mist text-cream" : "btn-wine"}`}
        >
          {blocked ? (
            "Join the waitlist on WhatsApp"
          ) : added ? (
            <><Check size={15} /> Added to bag</>
          ) : (
            <><ShoppingBag size={15} /> Add to bag · {formatMoney(variant.price * qty)}</>
          )}
        </button>
      </div>

      <a
        href={whatsappLink(whatsappMessage, whatsappNumber)}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("whatsapp_click", { placement: "product", product: product.slug, size: variant.label })}
        className="mt-2 flex w-full items-center justify-center gap-2 border border-line py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition hover:border-ink"
      >
        <MessageCircle size={14} /> Order on WhatsApp
      </a>

      <div className="mt-6 grid grid-cols-2 gap-2 border-y border-line py-4 text-[0.64rem] text-stone">
        <span className="flex items-center gap-2"><Truck size={14} className="text-wine" /> Free delivery over {formatMoney(freeDeliveryThreshold)}</span>
        <span className="flex items-center gap-2"><BadgeCheck size={14} className="text-wine" /> 100% authentic</span>
        <span className="flex items-center gap-2"><RotateCcw size={14} className="text-wine" /> {returnsDays}-day returns</span>
        <span className="flex items-center gap-2"><Check size={14} className="text-wine" /> Mystery 2 ml sample</span>
      </div>

      <p className="mt-4 text-[0.63rem] leading-relaxed text-stone">
        Hand-decanted to order. Orders before 2pm ship the same working day in Mombasa; countrywide delivery in 2–4 working days.
      </p>
    </div>
  );
}
