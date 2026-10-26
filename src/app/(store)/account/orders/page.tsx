import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrderItems, getUserOrders } from "@/lib/queries";
import { cancelOrderAction } from "@/lib/actions/account";
import { formatDate, formatMoney } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const metadata: Metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All orders" },
  { key: "active", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function matches(status: string, filter: string): boolean {
  if (filter === "active") return ["pending", "confirmed", "packing", "ready", "out_for_delivery", "on_hold"].includes(status);
  if (filter === "delivered") return status === "delivered";
  if (filter === "cancelled") return status === "cancelled" || status === "returned";
  return true;
}

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  const filter = FILTERS.some((item) => item.key === query.status) ? (query.status as string) : "all";
  const orders = getUserOrders(user.id).filter((order) => matches(order.status, filter));
  const withItems = orders.map((order) => ({ order, items: getOrderItems(order.id) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Order history</h2>
          <p className="mt-1 text-[0.74rem] text-stone">Every decant, tracked from our atelier to your door.</p>
        </div>
        <Link href="/account/orders" className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">
          Refresh
        </Link>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line pb-px">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={item.key === "all" ? "/account/orders" : `/account/orders?status=${item.key}`}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition ${
              filter === item.key ? "border-wine text-wine" : "border-transparent text-stone hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {withItems.length ? (
        <div className="space-y-4">
          {withItems.map(({ order, items }) => {
            const cancellable = order.status === "pending" || order.status === "confirmed";
            return (
              <article key={order.id} className="border border-line bg-parchment">
                <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.82rem] font-semibold tracking-wide">{order.order_number}</p>
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.payment_status} />
                    </div>
                    <p className="mt-1 text-[0.66rem] text-stone">Placed {formatDate(order.created_at)}</p>
                  </div>
                  <p className="font-display text-xl">{formatMoney(order.total)}</p>
                </div>

                <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {items.slice(0, 4).map((item) => (
                        <span key={item.id} className="relative h-14 w-11 overflow-hidden border border-cream bg-cream-deep">
                          {item.image ? <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" /> : null}
                        </span>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.8rem] font-medium">{items[0]?.name ?? "Order"}{items.length > 1 ? ` + ${items.length - 1} more` : ""}</p>
                      <p className="mt-1 text-[0.66rem] text-stone">
                        {items.reduce((sum, item) => sum + item.qty, 0)} {items.reduce((sum, item) => sum + item.qty, 0) === 1 ? "item" : "items"} · {order.payment_method.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {cancellable ? (
                      <form action={cancelOrderAction}>
                        <input type="hidden" name="orderNumber" value={order.order_number} />
                        <ConfirmButton
                          message="Cancel this order? This cannot be undone."
                          className="btn btn-sm border border-line text-stone hover:border-wine hover:text-wine"
                        >
                          Cancel
                        </ConfirmButton>
                      </form>
                    ) : null}
                    <Link href={`/account/orders/${order.order_number}`} className="btn btn-outline btn-sm">
                      View details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {order.status === "out_for_delivery" && order.rider ? (
                  <p className="flex items-center gap-2 border-t border-line bg-cream-deep/40 px-4 py-2.5 text-[0.68rem] text-ink-soft sm:px-5">
                    <Truck size={13} className="text-wine" /> Out with {order.rider}
                    {order.tracking_number ? ` · ${order.tracking_number}` : ""}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-line bg-parchment/60 px-6 py-14 text-center">
          <Package size={24} strokeWidth={1.2} className="mx-auto text-mist" />
          <p className="mt-3 text-[0.9rem]">No {filter === "all" ? "" : filter} orders yet.</p>
          <p className="mt-1 text-[0.72rem] text-stone">Your next signature is waiting in the collection.</p>
          <Link href="/perfumes" className="btn btn-ink btn-sm mt-4">Browse perfumes</Link>
        </div>
      )}
    </div>
  );
}
