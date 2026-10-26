import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, MessageCircle, Package, Truck } from "lucide-react";
import { getOrderDetail } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatDateTime, formatMoney, whatsappLink } from "@/lib/utils";
import { ORDER_PIPELINE, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import { Breadcrumbs } from "@/components/store/page-hero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", description: "Order confirmation and tracking." };

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const detail = getOrderDetail(orderNumber);
  if (!detail) notFound();
  const { order, items, events } = detail;
  const settings = getSettings();
  const isNew = query.new === "1";
  const currentIndex = ORDER_PIPELINE.indexOf(order.status);
  const cancelled = ["cancelled", "returned", "on_hold"].includes(order.status);

  const whatsappMessage = `Hello Maison du Scent, I've just placed order ${order.order_number} (${formatMoney(order.total)}). I'd like to confirm delivery details.`;

  return (
    <section className="shell py-10 sm:py-14">
      <Breadcrumbs items={[{ label: "Order", href: "/account/orders" }, { label: order.order_number }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <div>
          <div className="border border-line bg-parchment p-6 sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss">
              <Check size={22} strokeWidth={1.6} />
            </span>
            <p className="eyebrow mt-4 text-wine">{isNew ? "Thank you" : "Your order"}</p>
            <h1 className="display-lg mt-2">{isNew ? "Your order is in." : `Order ${order.order_number}`}</h1>
            <p className="mt-3 max-w-lg text-[0.88rem] leading-relaxed text-stone">
              {isNew
                ? "We have received your order and sent a confirmation to your email. Our team will confirm availability and payment details shortly — usually within the hour during working hours."
                : `Placed ${formatDateTime(order.created_at)}. We will keep this page updated as your order moves through the atelier.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={whatsappLink(whatsappMessage, settings.whatsappNumber)} target="_blank" rel="noreferrer" className="btn btn-wine">
                <MessageCircle size={14} /> Confirm on WhatsApp
              </a>
              <Link href="/account/orders" className="btn btn-outline">Your orders</Link>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8 border border-line bg-parchment p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Order status</h2>
              <span className="badge border-wine/20 bg-wine/5 text-wine">{ORDER_STATUS_LABELS[order.status]}</span>
            </div>
            {cancelled ? (
              <div className="mt-4 border border-rose-200 bg-rose-50 p-4 text-[0.8rem] text-rose-800">
                This order is marked <strong>{ORDER_STATUS_LABELS[order.status].toLowerCase()}</strong>. Message us on WhatsApp if you need help.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-6 gap-1">
                {ORDER_PIPELINE.map((step, index) => {
                  const complete = index <= currentIndex;
                  return (
                    <div key={step} className="relative">
                      <div className={`h-1 ${complete ? "bg-wine" : "bg-line"}`} />
                      <span className={`mt-2 flex h-5 w-5 items-center justify-center rounded-full border text-[0.5rem] ${complete ? "border-wine bg-wine text-cream" : "border-line bg-cream text-stone"}`}>
                        {complete ? <Check size={10} /> : index + 1}
                      </span>
                      <p className={`mt-1.5 text-[0.54rem] leading-tight ${complete ? "text-ink" : "text-stone"}`}>{ORDER_STATUS_LABELS[step]}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 space-y-4 border-t border-line pt-5">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-stone">
                    {event.status === "delivered" ? <Check size={12} /> : event.status.includes("delivery") ? <Truck size={12} /> : event.status === "payment_collected" ? <Package size={12} /> : <Clock size={12} />}
                  </span>
                  <div>
                    <p className="text-[0.78rem] font-medium capitalize">{event.status.replace(/_/g, " ")}</p>
                    <p className="text-[0.72rem] text-stone">{event.note}</p>
                    <p className="mt-0.5 text-[0.58rem] text-mist">{formatDateTime(event.created_at)} · {event.created_by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="mt-8 border border-line bg-parchment">
            <div className="border-b border-line p-5">
              <h2 className="font-display text-2xl">Your selection</h2>
            </div>
            <div className="divide-y divide-line">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream-deep">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.52rem] font-semibold uppercase tracking-[0.15em] text-stone">{item.brand}</p>
                    <p className="font-display text-lg leading-tight">{item.name}</p>
                    <p className="text-[0.7rem] text-stone">{item.size} · Qty {item.qty}</p>
                  </div>
                  <p className="text-[0.8rem]">{formatMoney(item.unit_price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-line p-5 text-[0.8rem]">
              <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-moss"><span>Member discount</span><span>−{formatMoney(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{order.delivery_fee === 0 ? "Free" : formatMoney(order.delivery_fee)}</span></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-[0.68rem] uppercase tracking-[0.13em] text-stone">Total</span>
                <span className="font-display text-2xl">{formatMoney(order.total)}</span>
              </div>
              <p className="pt-1 text-[0.66rem] text-stone">Payment: {order.payment_method.toUpperCase()} · {PAYMENT_STATUS_LABELS[order.payment_status]}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="border border-line bg-parchment p-5">
            <h2 className="font-display text-xl">Delivery to</h2>
            <p className="mt-2 text-[0.8rem] font-medium">{order.customer_name}</p>
            <p className="mt-1 text-[0.78rem] leading-relaxed text-stone">{order.address}<br />{order.city}</p>
            <p className="mt-2 text-[0.78rem] text-stone">{order.phone}</p>
            <p className="text-[0.78rem] text-stone">{order.email}</p>
            {order.notes && <p className="mt-3 border-t border-line pt-3 text-[0.72rem] italic text-stone">“{order.notes}”</p>}
          </div>
          <div className="border border-line bg-parchment p-5">
            <h2 className="font-display text-xl">Need help?</h2>
            <p className="mt-1.5 text-[0.76rem] leading-relaxed text-stone">Quote order {order.order_number}. We reply within the hour during opening times.</p>
            <a
              href={whatsappLink(`Hello Maison du Scent, I need help with order ${order.order_number}.`, settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-wine"
            >
              <MessageCircle size={13} /> WhatsApp us
            </a>
          </div>
          <div className="border border-line bg-cream-deep/50 p-5">
            <p className="font-display text-xl">Keep exploring</p>
            <div className="mt-3 space-y-2">
              <Link href="/new-arrivals" className="block text-[0.78rem] text-stone hover:text-ink">New arrivals →</Link>
              <Link href="/bundles" className="block text-[0.78rem] text-stone hover:text-ink">Discovery sets →</Link>
              <Link href="/journal" className="block text-[0.78rem] text-stone hover:text-ink">Read the Journal →</Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
