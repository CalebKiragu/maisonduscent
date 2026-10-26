import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, CircleDot, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getOrderDetail } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { markPaymentCollectedAction, setOrderStatusAction } from "@/lib/actions/admin";
import { formatDateTime, formatMoney, whatsappLink } from "@/lib/utils";
import { ORDER_PIPELINE, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { OrderUpdateForm } from "@/components/admin/order-update-form";

export const metadata: Metadata = { title: "Order detail" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  await requireAdmin();
  const { orderNumber } = await params;
  const detail = getOrderDetail(orderNumber);
  if (!detail) notFound();
  const { order, items, events } = detail;
  const settings = getSettings();
  const stepIndex = ORDER_PIPELINE.indexOf(order.status);
  const nextStep = stepIndex >= 0 && stepIndex < ORDER_PIPELINE.length - 1 ? ORDER_PIPELINE[stepIndex + 1] : null;
  const balance = Math.max(0, order.total - order.amount_collected);
  const customerPhone = order.phone.replace(/\D/g, "");
  const customerWhatsApp = customerPhone.length >= 10 ? `https://wa.me/${customerPhone}` : whatsappLink(`Hello ${order.customer_name}, this is Maison du Scent.`, settings.whatsappNumber);

  return (
    <>
      <AdminPageHeader
        eyebrow={`Placed ${formatDateTime(order.created_at)}`}
        title={order.order_number}
        description={`${order.customer_name} · ${order.city} · ${order.payment_method.toUpperCase()}`}
      >
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.payment_status} />
        <Link href="/admin/orders" className="btn btn-outline btn-sm">Back to orders</Link>
      </AdminPageHeader>

      <Panel title="Dispatch pipeline" description="Move the order through each stage" className="mb-4">
        <div className="grid gap-2 px-3 py-4 sm:grid-cols-3 lg:grid-cols-6">
          {ORDER_PIPELINE.map((step, index) => {
            const done = stepIndex >= index;
            const current = order.status === step;
            return (
              <form key={step} action={setOrderStatusAction}>
                <input type="hidden" name="order_number" value={order.order_number} />
                <input type="hidden" name="status" value={step} />
                <button
                  type="submit"
                  className={`w-full border px-3 py-3 text-left transition ${
                    current ? "border-wine bg-wine text-cream" : done ? "border-moss/30 bg-moss/5 text-ink" : "border-[#e4ddd0] bg-[#fffdf9] text-stone hover:border-wine/40"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.12em]">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${current ? "bg-cream/20" : done ? "bg-moss text-cream" : "bg-[#eee7db] text-stone"}`}>
                      {done ? <Check size={11} /> : <CircleDot size={9} />}
                    </span>
                    Step {index + 1}
                  </span>
                  <span className="mt-2 block text-[0.76rem]">{ORDER_STATUS_LABELS[step]}</span>
                </button>
              </form>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e4ddd0] px-4 py-3">
          {nextStep ? (
            <form action={setOrderStatusAction}>
              <input type="hidden" name="order_number" value={order.order_number} />
              <input type="hidden" name="status" value={nextStep} />
              <button type="submit" className="btn btn-ink btn-sm">Advance to {ORDER_STATUS_LABELS[nextStep]}</button>
            </form>
          ) : null}
          <form action={setOrderStatusAction}>
            <input type="hidden" name="order_number" value={order.order_number} />
            <input type="hidden" name="status" value="on_hold" />
            <button type="submit" className="btn btn-outline btn-sm">Put on hold</button>
          </form>
          <form action={setOrderStatusAction}>
            <input type="hidden" name="order_number" value={order.order_number} />
            <input type="hidden" name="status" value="returned" />
            <ConfirmButton message="Mark this order as returned? Stock will be added back." className="btn btn-sm border border-amber-300 bg-amber-50 text-amber-900">
              Mark returned
            </ConfirmButton>
          </form>
          <form action={setOrderStatusAction}>
            <input type="hidden" name="order_number" value={order.order_number} />
            <input type="hidden" name="status" value="cancelled" />
            <ConfirmButton message="Cancel this order? Stock will be returned to inventory." className="btn btn-sm border border-rose-300 bg-rose-50 text-rose-800">
              Cancel order
            </ConfirmButton>
          </form>
          {nextStep === null && order.status === "delivered" ? (
            <span className="inline-flex items-center gap-1.5 text-[0.66rem] text-moss"><ShieldCheck size={14} /> Delivered and complete</span>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Panel title="Order items" description={`${items.reduce((sum, item) => sum + item.qty, 0)} units`}>
            <div className="divide-y divide-[#eee7db]">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#eee7db]">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-stone">{item.brand}</p>
                    <p className="truncate text-[0.8rem] font-medium">{item.name}</p>
                    <p className="text-[0.66rem] text-stone">{item.size} · {formatMoney(item.unit_price)} each</p>
                  </div>
                  <p className="text-[0.72rem] text-stone">×{item.qty}</p>
                  <p className="w-24 text-right text-[0.8rem] font-medium">{formatMoney(item.unit_price * item.qty)}</p>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-[#e4ddd0] px-4 py-4 text-[0.76rem] sm:px-5">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
              {order.discount > 0 ? <div className="flex justify-between text-moss"><dt>Member discount</dt><dd>−{formatMoney(order.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd>{order.delivery_fee === 0 ? "Free" : formatMoney(order.delivery_fee)}</dd></div>
              <div className="flex justify-between border-t border-[#e4ddd0] pt-2 text-[0.9rem] font-medium"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
              <div className="flex justify-between text-stone"><dt>Collected</dt><dd>{formatMoney(order.amount_collected)}</dd></div>
              <div className={`flex justify-between font-medium ${balance > 0 ? "text-rose-700" : "text-moss"}`}><dt>Balance due</dt><dd>{formatMoney(balance)}</dd></div>
            </dl>
          </Panel>

          <Panel title="Customer timeline" description="Visible in the member dashboard">
            <ol className="space-y-3 px-4 py-4 sm:px-5">
              {events.length ? (
                events.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index === events.length - 1 ? "bg-wine" : "bg-[#ddd4c4]"}`} />
                    <div>
                      <p className="text-[0.74rem] font-medium">{ORDER_STATUS_LABELS[event.status as OrderStatus] ?? event.status}</p>
                      <p className="text-[0.68rem] leading-relaxed text-stone">{event.note}</p>
                      <p className="mt-0.5 text-[0.6rem] text-mist">{formatDateTime(event.created_at)} · {event.created_by}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-[0.72rem] text-stone">No timeline events yet.</li>
              )}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Customer" description="Delivery and contact">
            <div className="space-y-3 px-4 py-4 text-[0.74rem] sm:px-5">
              <p className="text-[0.9rem] font-medium">{order.customer_name}</p>
              <p className="flex items-center gap-2 text-stone"><Phone size={13} /> <a href={`tel:${order.phone}`} className="hover:text-ink">{order.phone}</a></p>
              <p className="flex items-center gap-2 break-all text-stone"><Mail size={13} /> <a href={`mailto:${order.email}`} className="hover:text-ink">{order.email}</a></p>
              <p className="flex items-start gap-2 text-stone">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span>{order.address}<br />{order.city}</span>
              </p>
              {order.notes ? <p className="border-l-2 border-wine/30 pl-3 text-[0.7rem] italic text-stone">&ldquo;{order.notes}&rdquo;</p> : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={customerWhatsApp} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><MessageCircle size={13} /> WhatsApp</a>
                <Link href={`/admin/customers?q=${encodeURIComponent(order.email)}`} className="btn btn-outline btn-sm">Customer record</Link>
              </div>
            </div>
          </Panel>

          <Panel title="Payment" description="Collection and balance">
            <div className="space-y-3 px-4 py-4 text-[0.74rem] sm:px-5">
              <div className="flex items-center justify-between">
                <span className="text-stone">Status</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
              <div className="flex items-center justify-between"><span className="text-stone">Method</span><span className="uppercase">{order.payment_method}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone">Collected</span><span>{formatMoney(order.amount_collected)}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone">Balance</span><span className={balance > 0 ? "text-rose-700" : "text-moss"}>{formatMoney(balance)}</span></div>
              {order.collected_at ? <p className="text-[0.62rem] text-stone">Last collection {formatDateTime(order.collected_at)}</p> : null}
              {order.payment_status !== "paid" && order.payment_status !== "refunded" ? (
                <form action={markPaymentCollectedAction}>
                  <input type="hidden" name="order_number" value={order.order_number} />
                  <button type="submit" className="btn btn-ink btn-sm w-full">Mark {formatMoney(order.total)} collected</button>
                </form>
              ) : null}
            </div>
          </Panel>

          <Panel title="Update order" description="Status, courier and notes">
            <div className="px-4 py-4 sm:px-5">
              <OrderUpdateForm order={order} />
            </div>
          </Panel>

          <Panel title="Attribution" description="Where this order came from">
            <div className="space-y-2 px-4 py-4 text-[0.7rem] sm:px-5">
              <div className="flex justify-between"><span className="text-stone">Source</span><span>{order.source ?? "direct"}</span></div>
              <div className="flex justify-between"><span className="text-stone">Medium</span><span>{order.medium ?? "none"}</span></div>
              <div className="flex justify-between"><span className="text-stone">Campaign</span><span className="text-right">{order.campaign ?? "—"}</span></div>
              <Link href="/admin/analytics" className="mt-1 inline-block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-wine hover:text-ink">View campaign report</Link>
            </div>
          </Panel>
        </div>
      </div>

      <p className="mt-4 text-[0.6rem] text-stone">
        Store WhatsApp for customer replies: {settings.phone} · Last updated {formatDateTime(order.updated_at)}
      </p>
    </>
  );
}
