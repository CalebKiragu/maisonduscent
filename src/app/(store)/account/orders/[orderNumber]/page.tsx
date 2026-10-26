import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, CircleDot, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrderDetail } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { cancelOrderAction } from "@/lib/actions/account";
import { formatDateTime, formatMoney, whatsappLink } from "@/lib/utils";
import { ORDER_PIPELINE, ORDER_STATUS_LABELS } from "@/lib/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const metadata: Metadata = { title: "Order details" };
export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const [{ orderNumber }, user] = await Promise.all([params, requireUser()]);
  const detail = getOrderDetail(orderNumber);
  if (!detail) notFound();
  const { order, items, events } = detail;
  const owns = order.user_id === user.id || order.email.toLowerCase() === user.email.toLowerCase();
  if (!owns) redirect("/account/orders");

  const settings = getSettings();
  const pipelineIndex = ORDER_PIPELINE.indexOf(order.status);
  const exceptional = ["cancelled", "returned", "on_hold"].includes(order.status);
  const cancellable = order.status === "pending" || order.status === "confirmed";

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">
        <ArrowLeft size={13} /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border border-line bg-parchment p-5">
        <div>
          <p className="eyebrow text-wine">Order {order.order_number}</p>
          <h2 className="mt-2 font-display text-3xl">
            {order.status === "delivered" ? "Delivered with care." : exceptional ? ORDER_STATUS_LABELS[order.status] : "On its way to you."}
          </h2>
          <p className="mt-2 text-[0.72rem] text-stone">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <p className="font-display text-3xl">{formatMoney(order.total)}</p>
        </div>
      </div>

      <section className="border border-line bg-parchment p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Delivery progress</h3>
          {order.status === "out_for_delivery" && (order.rider || order.tracking_number) ? (
            <p className="text-[0.68rem] text-ink-soft"><Truck size={13} className="mr-1 inline text-wine" />{order.rider ?? order.courier ?? "Rider"}{order.tracking_number ? ` · ${order.tracking_number}` : ""}</p>
          ) : null}
        </div>

        {exceptional ? (
          <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-[0.74rem] text-amber-900">
            This order is currently marked <strong>{ORDER_STATUS_LABELS[order.status]}</strong>. Message us on WhatsApp if you need help.
          </p>
        ) : (
          <ol className="mt-5 grid gap-4 sm:grid-cols-6 sm:gap-2">
            {ORDER_PIPELINE.map((step, index) => {
              const done = pipelineIndex >= index;
              return (
                <li key={step} className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${done ? "border-wine bg-wine text-cream" : "border-line bg-cream text-mist"}`}>
                    {done ? <Check size={13} /> : <CircleDot size={11} />}
                  </span>
                  <span className={`text-[0.6rem] font-medium uppercase tracking-[0.08em] ${done ? "text-ink" : "text-mist"}`}>{ORDER_STATUS_LABELS[step]}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="border border-line bg-parchment">
          <h3 className="border-b border-line px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Your order</h3>
          <div className="divide-y divide-line">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-deep">
                  {item.image ? <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-stone">{item.brand}</p>
                  <p className="mt-0.5 truncate text-[0.85rem] font-medium">{item.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-stone">{item.size} · Qty {item.qty}</p>
                </div>
                <p className="text-[0.8rem]">{formatMoney(item.unit_price * item.qty)}</p>
              </div>
            ))}
          </div>
          <dl className="space-y-2 border-t border-line px-5 py-4 text-[0.78rem]">
            <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
            {order.discount > 0 ? <div className="flex justify-between text-moss"><dt>Member discount</dt><dd>−{formatMoney(order.discount)}</dd></div> : null}
            <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd>{order.delivery_fee === 0 ? "Complimentary" : formatMoney(order.delivery_fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
          </dl>
        </section>

        <div className="space-y-5">
          <section className="border border-line bg-parchment p-5">
            <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Delivering to</h3>
            <p className="mt-3 text-[0.85rem] font-medium">{order.customer_name}</p>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-stone">
              {order.address}
              <br />
              {order.city}
              <br />
              {order.phone}
            </p>
            <p className="mt-3 border-t border-line pt-3 text-[0.72rem] text-stone">
              Payment method <span className="font-medium uppercase text-ink">{order.payment_method}</span>
            </p>
            {order.notes ? <p className="mt-2 text-[0.72rem] italic text-stone">&ldquo;{order.notes}&rdquo;</p> : null}
          </section>

          <section className="border border-line bg-parchment p-5">
            <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Activity</h3>
            <ol className="mt-4 space-y-3">
              {events.length ? (
                events.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pl-0.5">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index === events.length - 1 ? "bg-wine" : "bg-line"}`} />
                    <div>
                      <p className="text-[0.72rem] font-medium">{ORDER_STATUS_LABELS[event.status as keyof typeof ORDER_STATUS_LABELS] ?? event.status}</p>
                      <p className="text-[0.66rem] leading-relaxed text-stone">{event.note}</p>
                      <p className="mt-0.5 text-[0.6rem] text-mist">{formatDateTime(event.created_at)}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-[0.72rem] text-stone">No activity yet.</li>
              )}
            </ol>
          </section>

          <div className="flex flex-wrap gap-2">
            {cancellable ? (
              <form action={cancelOrderAction}>
                <input type="hidden" name="orderNumber" value={order.order_number} />
                <ConfirmButton
                  message="Cancel this order? This cannot be undone."
                  className="btn btn-sm border border-line text-stone hover:border-wine hover:text-wine"
                >
                  Cancel order
                </ConfirmButton>
              </form>
            ) : null}
            <a
              href={whatsappLink(`Hello Maison du Scent, I'd like help with order ${order.order_number}.`, settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <MessageCircle size={13} /> WhatsApp us
            </a>
            {order.status === "delivered" ? (
              <Link href="/perfumes" className="btn btn-ink btn-sm"><PackageCheck size={13} /> Shop again</Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
