"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatMoney, whatsappLink } from "@/lib/utils";

export function CartDrawer({
  freeDeliveryThreshold,
  whatsappNumber,
}: {
  freeDeliveryThreshold: number;
  whatsappNumber: string;
}) {
  const { isOpen, close, items, subtotal, setQty, remove, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const whatsappMessage = `Hello Maison du Scent, I'd like to order:\n${items
    .map((item) => `• ${item.name} — ${item.size} × ${item.qty} — ${formatMoney(item.price * item.qty)}`)
    .join("\n")}\n\nSubtotal: ${formatMoney(subtotal)}`;

  return (
    <div className={`fixed inset-0 z-[120] ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col bg-cream shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} strokeWidth={1.5} />
            <h2 className="font-display text-xl">Your bag</h2>
            <span className="text-[0.65rem] text-stone">({count})</span>
          </div>
          <button onClick={close} aria-label="Close bag" className="p-1.5 text-stone transition hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line">
              <ShoppingBag size={22} strokeWidth={1.2} className="text-stone" />
            </span>
            <h3 className="mt-5 font-display text-2xl">Your bag is empty</h3>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-stone">
              Begin with a discovery set, or find your signature in 8 ml.
            </p>
            <Link href="/best-sellers" onClick={close} className="btn btn-ink mt-6">
              Shop best sellers
            </Link>
            <Link href="/find-my-scent" onClick={close} className="link-underline mt-4 text-[0.68rem] uppercase tracking-[0.13em] text-stone">
              Take the scent quiz
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3">
              <div className="flex items-center gap-2 text-[0.66rem] text-stone">
                <Truck size={13} />
                {remaining > 0 ? (
                  <span>
                    You are <strong className="font-semibold text-ink">{formatMoney(remaining)}</strong> from free delivery
                  </span>
                ) : (
                  <span className="text-moss">Complimentary delivery unlocked</span>
                )}
              </div>
              <div className="mt-2 h-[3px] w-full bg-line">
                <div className="h-full bg-wine transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3.5 border-b border-line py-4 last:border-0">
                  <Link href={`/perfumes/${item.slug}`} onClick={close} className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden bg-cream-deep">
                    <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone">{item.brand}</p>
                        <Link href={`/perfumes/${item.slug}`} onClick={close} className="mt-0.5 block truncate font-display text-[1.02rem] leading-tight hover:text-wine">
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-[0.66rem] text-stone">{item.size}</p>
                      </div>
                      <button onClick={() => remove(item.key)} aria-label={`Remove ${item.name}`} className="text-mist transition hover:text-wine">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease quantity" className="px-2 py-1 text-stone hover:text-ink">
                          <Minus size={11} />
                        </button>
                        <span className="min-w-6 text-center text-[0.72rem]">{item.qty}</span>
                        <button onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase quantity" className="px-2 py-1 text-stone hover:text-ink">
                          <Plus size={11} />
                        </button>
                      </div>
                      <p className="text-[0.78rem]">{formatMoney(item.price * item.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line bg-parchment px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] uppercase tracking-[0.13em] text-stone">Subtotal</span>
                <span className="font-display text-xl">{formatMoney(subtotal)}</span>
              </div>
              <p className="mt-1 text-[0.62rem] text-stone">Delivery calculated at checkout · Free over {formatMoney(freeDeliveryThreshold)}</p>
              <Link href="/checkout" onClick={close} className="btn btn-ink mt-3 w-full">
                Checkout
              </Link>
              <a
                href={whatsappLink(whatsappMessage, whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                onClick={close}
                className="mt-2 flex w-full items-center justify-center gap-2 border border-line bg-transparent py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-ink transition hover:border-ink"
              >
                Order on WhatsApp
              </a>
              <Link href="/cart" onClick={close} className="mt-2 block text-center text-[0.62rem] uppercase tracking-[0.12em] text-stone underline underline-offset-4">
                View full bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
