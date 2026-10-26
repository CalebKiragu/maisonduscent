"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Lock, MessageCircle, Smartphone, Truck, Wallet } from "lucide-react";
import type { Address, User } from "@/lib/types";
import { useCart } from "./cart-provider";
import { formatMoney, whatsappLink } from "@/lib/utils";

type PaymentMethod = "mpesa" | "card" | "cod" | "whatsapp";

export function CheckoutForm({
  user,
  addresses,
  freeDeliveryThreshold,
  deliveryFee,
  whatsappNumber,
}: {
  user: User | null;
  addresses: Address[];
  freeDeliveryThreshold: number;
  deliveryFee: number;
  whatsappNumber: string;
}) {
  const router = useRouter();
  const { items, subtotal, clear, ready } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? addresses[0]?.phone ?? "",
    address: addresses[0]?.line1 ?? "",
    apartment: addresses[0]?.line2 ?? "",
    city: addresses[0]?.city ?? "Mombasa",
    notes: "",
  });

  const member = user?.membership_tier === "Circle" || user?.membership_tier === "Maison+";
  const discount = member ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : deliveryFee;
  const total = subtotal - discount + shipping;

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!items.length) return;
    setError("");
    setLoading(true);
    try {
      let attribution: Record<string, string | null> = {};
      try {
        const raw = window.sessionStorage.getItem("mds_attr");
        if (raw) attribution = JSON.parse(raw);
      } catch {
        attribution = {};
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, sizeKey: item.sizeKey, qty: item.qty })),
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: [form.address, form.apartment].filter(Boolean).join(", "),
            city: form.city,
            notes: form.notes,
          },
          paymentMethod: payment,
          attribution,
        }),
      });
      const data = (await res.json()) as { orderNumber?: string; error?: string };
      if (!res.ok || !data.orderNumber) throw new Error(data.error ?? "We could not place your order. Please try again.");
      clear();
      router.push(`/order/${data.orderNumber}?new=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (!ready) return <div className="shell py-24 text-center text-sm text-stone">Preparing checkout…</div>;

  if (items.length === 0) {
    return (
      <section className="shell py-20 text-center">
        <h1 className="display-lg">Your bag is empty</h1>
        <p className="mt-2 text-sm text-stone">Add a scent before checking out.</p>
        <Link href="/best-sellers" className="btn btn-ink mt-6">Shop best sellers</Link>
      </section>
    );
  }

  const payments: { id: PaymentMethod; label: string; note: string; icon: typeof Smartphone }[] = [
    { id: "mpesa", label: "M-PESA", note: "Pay via STK push", icon: Smartphone },
    { id: "card", label: "Card", note: "Visa or Mastercard", icon: CreditCard },
    { id: "cod", label: "Cash on delivery", note: "Mombasa only", icon: Wallet },
    { id: "whatsapp", label: "WhatsApp", note: "Arrange payment with us", icon: MessageCircle },
  ];

  return (
    <section className="shell py-10 sm:py-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-wine">Secure checkout</p>
          <h1 className="display-lg mt-2">Almost yours.</h1>
        </div>
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">
          <ArrowLeft size={13} /> Back to bag
        </Link>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
        <div className="space-y-8">
          {!user && (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-parchment p-4">
              <p className="text-[0.8rem] text-stone">Already a member? Sign in for member pricing and saved addresses.</p>
              <Link href="/login?next=/checkout" className="btn btn-outline btn-sm">Sign in</Link>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[0.6rem] font-semibold text-cream">1</span>
              <h2 className="font-display text-2xl">Contact</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="label">Full name</label>
                <input id="co-name" required value={form.name} onChange={(e) => update("name", e.target.value)} className="field" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="co-phone" className="label">Phone (WhatsApp)</label>
                <input id="co-phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="field" autoComplete="tel" placeholder="+254 7…" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-email" className="label">Email</label>
                <input id="co-email" required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="field" autoComplete="email" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[0.6rem] font-semibold text-cream">2</span>
              <h2 className="font-display text-2xl">Delivery</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="label">Street address</label>
                <input id="co-address" required value={form.address} onChange={(e) => update("address", e.target.value)} className="field" autoComplete="address-line1" placeholder="Building, street, area" />
              </div>
              <div>
                <label htmlFor="co-apartment" className="label">Apartment / floor (optional)</label>
                <input id="co-apartment" value={form.apartment} onChange={(e) => update("apartment", e.target.value)} className="field" autoComplete="address-line2" />
              </div>
              <div>
                <label htmlFor="co-city" className="label">City / town</label>
                <input id="co-city" required value={form.city} onChange={(e) => update("city", e.target.value)} className="field" autoComplete="address-level2" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-notes" className="label">Order notes / gift message (optional)</label>
                <textarea id="co-notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="field resize-y" placeholder="Gift note, delivery instructions, gate code…" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 border-b border-line pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[0.6rem] font-semibold text-cream">3</span>
              <h2 className="font-display text-2xl">Payment</h2>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {payments.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 border p-4 transition ${payment === option.id ? "border-wine bg-wine/5" : "border-line bg-parchment hover:border-ink/30"}`}
                >
                  <input type="radio" name="payment" value={option.id} checked={payment === option.id} onChange={() => setPayment(option.id)} className="sr-only" />
                  <option.icon size={18} strokeWidth={1.4} className={payment === option.id ? "text-wine" : "text-stone"} />
                  <span className="flex-1">
                    <span className="block text-[0.78rem] font-semibold">{option.label}</span>
                    <span className="block text-[0.62rem] text-stone">{option.note}</span>
                  </span>
                  {payment === option.id && <Check size={15} className="text-wine" />}
                </label>
              ))}
            </div>
            <p className="mt-3 text-[0.66rem] leading-relaxed text-stone">
              {payment === "mpesa" && "After placing your order, you will receive an M-PESA payment prompt on your phone. Your order is confirmed once payment is received."}
              {payment === "card" && "You will receive a secure payment link by email after placing your order."}
              {payment === "cod" && "Cash on delivery is available in Mombasa on orders under KSh 15,000. Our team will confirm by phone."}
              {payment === "whatsapp" && "We will open WhatsApp with your order details so you can arrange payment and delivery with the maison."}
            </p>
          </div>
        </div>

        <aside className="h-fit bg-parchment p-5 sm:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Your order</h2>
          <div className="mt-4 max-h-[20rem] space-y-3 overflow-y-auto border-y border-line py-4">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-deep">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[0.98rem] leading-tight">{item.name}</p>
                  <p className="text-[0.62rem] text-stone">{item.size} × {item.qty}</p>
                </div>
                <p className="text-[0.72rem]">{formatMoney(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-[0.78rem]">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            {member && <div className="flex justify-between text-moss"><span>Member pricing (−10%)</span><span>−{formatMoney(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{shipping === 0 ? "Free" : formatMoney(shipping)}</span></div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[0.68rem] uppercase tracking-[0.13em] text-stone">Total</span>
            <span className="font-display text-3xl">{formatMoney(total)}</span>
          </div>
          {error && <p className="mt-4 border border-rose-200 bg-rose-50 p-2.5 text-[0.72rem] text-rose-800">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-wine mt-5 w-full disabled:opacity-60">
            {loading ? "Placing order…" : <><Lock size={14} /> Place order · {formatMoney(total)}</>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.58rem] text-stone">
            <Lock size={11} /> Secure checkout · Your details are safe
          </p>
          <div className="mt-4 border-t border-line pt-4 text-[0.62rem] leading-relaxed text-stone">
            <p className="flex items-center gap-1.5"><Truck size={12} /> Free delivery over {formatMoney(freeDeliveryThreshold)}</p>
            <p className="mt-1.5">By placing an order you agree to our <Link href="/terms" className="underline underline-offset-2">terms</Link> and <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.</p>
          </div>
        </aside>
      </form>

      <div className="mt-8 border-t border-line pt-6 text-center">
        <p className="text-[0.68rem] text-stone">Prefer to order with a person?</p>
        <a
          href={whatsappLink(
            `Hello Maison du Scent, I'd like to complete my order on WhatsApp:\n${items.map((i) => `• ${i.name} — ${i.size} × ${i.qty}`).join("\n")}`,
            whatsappNumber,
          )}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-wine"
        >
          <MessageCircle size={13} /> Order on WhatsApp instead
        </a>
      </div>
    </section>
  );
}
