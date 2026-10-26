"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { formatMoney, whatsappLink } from "@/lib/utils";

export function CartPage({
  freeDeliveryThreshold,
  deliveryFee,
  whatsappNumber,
}: {
  freeDeliveryThreshold: number;
  deliveryFee: number;
  whatsappNumber: string;
}) {
  const { items, subtotal, setQty, remove, count, ready } = useCart();
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const delivery = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : deliveryFee;

  if (!ready) {
    return <div className="shell py-24 text-center text-sm text-stone">Loading your bag…</div>;
  }

  if (items.length === 0) {
    return (
      <section className="shell py-20 text-center sm:py-28">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line">
          <ShoppingBag size={22} strokeWidth={1.2} className="text-stone" />
        </span>
        <h1 className="display-lg mt-5">Your bag is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.86rem] leading-relaxed text-stone">
          Start with a discovery set, or find your signature in 8 ml. Every order includes a mystery 2 ml sample.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/best-sellers" className="btn btn-ink">Shop best sellers</Link>
          <Link href="/find-my-scent" className="btn btn-outline">Find my scent</Link>
        </div>
      </section>
    );
  }

  const whatsappMessage = `Hello Maison du Scent, I'd like to order:\n${items
    .map((item) => `• ${item.name} — ${item.size} × ${item.qty} — ${formatMoney(item.price * item.qty)}`)
    .join("\n")}\n\nSubtotal: ${formatMoney(subtotal)}`;

  return (
    <section className="shell py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-wine">Almost yours</p>
          <h1 className="display-lg mt-2">Your bag <span className="font-sans text-base text-stone">({count})</span></h1>
        </div>
        <Link href="/perfumes" className="link-underline hidden text-[0.62rem] font-semibold uppercase tracking-[0.13em] sm:inline">
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:gap-14">
        <div>
          <div className="border-t border-line">
            {items.map((item) => (
              <div key={item.key} className="flex gap-4 border-b border-line py-5">
                <Link href={`/perfumes/${item.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden bg-cream-deep">
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone">{item.brand}</p>
                      <Link href={`/perfumes/${item.slug}`} className="mt-1 block font-display text-xl leading-tight hover:text-wine">{item.name}</Link>
                      <p className="mt-1 text-[0.72rem] text-stone">{item.size} · {formatMoney(item.price)} each</p>
                      {item.kind === "bundle" && <p className="mt-1 text-[0.62rem] text-moss">Includes 5 × 8 ml decants</p>}
                    </div>
                    <button onClick={() => remove(item.key)} aria-label={`Remove ${item.name}`} className="p-1 text-mist transition hover:text-wine">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="flex items-center border border-line bg-parchment">
                      <button onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease quantity" className="px-3 py-1.5 text-stone hover:text-ink"><Minus size={12} /></button>
                      <span className="min-w-7 text-center text-[0.74rem]">{item.qty}</span>
                      <button onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase quantity" className="px-3 py-1.5 text-stone hover:text-ink"><Plus size={12} /></button>
                    </div>
                    <p className="font-display text-xl">{formatMoney(item.price * item.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/perfumes" className="mt-5 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink sm:hidden">
            Continue shopping <ArrowRight size={12} />
          </Link>
        </div>

        <aside className="h-fit bg-parchment p-5 sm:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-4 space-y-2.5 border-y border-line py-4 text-[0.8rem]">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{delivery === 0 ? "Free" : formatMoney(delivery)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Membership</span><span className="text-stone">Applied at checkout</span></div>
          </div>
          <div className="flex items-baseline justify-between py-4">
            <span className="text-[0.68rem] uppercase tracking-[0.13em] text-stone">Total</span>
            <span className="font-display text-3xl">{formatMoney(subtotal + delivery)}</span>
          </div>

          <div className="mb-4 border border-line bg-cream p-3">
            <div className="flex items-center gap-2 text-[0.66rem] text-stone">
              <Truck size={13} className="text-wine" />
              {remaining > 0 ? (
                <span>Add <strong className="text-ink">{formatMoney(remaining)}</strong> for free delivery</span>
              ) : (
                <span className="text-moss">Free delivery unlocked</span>
              )}
            </div>
            <div className="mt-2 h-[3px] bg-line"><div className="h-full bg-wine" style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }} /></div>
          </div>

          <Link href="/checkout" className="btn btn-wine w-full">Proceed to checkout <ArrowRight size={14} /></Link>
          <a
            href={whatsappLink(whatsappMessage, whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block w-full border border-line py-3 text-center text-[0.62rem] font-semibold uppercase tracking-[0.13em] transition hover:border-ink"
          >
            Order on WhatsApp
          </a>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.6rem] text-stone">
            <ShieldCheck size={12} /> Secure checkout · M-PESA, Visa, Mastercard
          </p>
        </aside>
      </div>
    </section>
  );
}
