import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllOrders, getOrderAdminStats, getOrderItems } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatDate, formatMoney, whatsappLink } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { AdminPageHeader, EmptyState, KpiCard, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { key: "all", label: "All orders" },
  { key: "to_action", label: "To action" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "on_hold", label: "On hold" },
  { key: "cancelled", label: "Cancelled" },
];

function statusMatches(status: string, filter: string): boolean {
  if (filter === "to_action") return ["pending", "confirmed", "packing", "ready"].includes(status);
  if (filter === "cancelled") return status === "cancelled" || status === "returned";
  if (filter === "all") return true;
  return status === filter;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; q?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const status = STATUS_TABS.some((tab) => tab.key === query.status) ? (query.status as string) : "all";
  const payment = ["all", "unpaid", "paid", "cod", "refunded"].includes(query.payment ?? "") ? (query.payment as string) : "all";
  const q = (query.q ?? "").trim().toLowerCase();
  const settings = getSettings();
  const stats = getOrderAdminStats();

  const orders = getAllOrders().filter((order) => {
    if (!statusMatches(order.status, status)) return false;
    if (payment !== "all" && order.payment_status !== payment) return false;
    if (q && !`${order.order_number} ${order.customer_name} ${order.email} ${order.phone} ${order.city}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Fulfilment pipeline"
        title="Orders"
        description="Confirm, pack, dispatch and collect payment. Every status change is recorded on the customer timeline."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Needs action" value={String(stats.toAction)} hint="pending → ready" href="/admin/orders?status=to_action" />
        <KpiCard label="Out for delivery" value={String(stats.inTransit)} hint="with courier or rider" href="/admin/orders?status=out_for_delivery" />
        <KpiCard label="Collected revenue" value={formatMoney(stats.paidRevenue)} hint={`${stats.delivered} delivered orders`} href="/admin/orders?payment=paid" />
        <KpiCard label="Outstanding" value={formatMoney(stats.unpaidValue)} hint="unpaid or cash on delivery" href="/admin/orders?payment=unpaid" />
      </div>

      <div className="mt-4">
        <Panel
          title={`${orders.length} orders`}
          description="Newest first · click any order to manage fulfilment"
          action={
            <form method="get" className="flex items-center gap-2">
              {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
              {payment !== "all" ? <input type="hidden" name="payment" value={payment} /> : null}
              <label className="flex items-center gap-1.5 border border-[#ddd4c4] bg-[#fffdf9] px-2.5 py-1.5">
                <Search size={13} className="text-stone" />
                <input name="q" defaultValue={query.q ?? ""} placeholder="Order, name, phone" className="w-32 bg-transparent text-[0.72rem] outline-none sm:w-44" />
              </label>
              <button type="submit" className="btn btn-outline btn-sm">Search</button>
            </form>
          }
        >
          <div className="flex flex-wrap items-center gap-1 border-b border-[#eee7db] px-3 py-2">
            {STATUS_TABS.map((tab) => {
              const params = new URLSearchParams({ ...(tab.key !== "all" ? { status: tab.key } : {}), ...(payment !== "all" ? { payment } : {}), ...(q ? { q } : {}) });
              return (
                <Link key={tab.key} href={`/admin/orders?${params.toString()}`} className={`px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${status === tab.key ? "bg-ink text-cream" : "text-stone hover:text-ink"}`}>
                  {tab.label}
                </Link>
              );
            })}
            <span className="mx-1 h-4 w-px bg-[#ddd4c4]" />
            {["all", "unpaid", "paid", "cod", "refunded"].map((value) => {
              const params = new URLSearchParams({ ...(status !== "all" ? { status } : {}), ...(value !== "all" ? { payment: value } : {}), ...(q ? { q } : {}) });
              return (
                <Link key={value} href={`/admin/orders?${params.toString()}`} className={`px-2 py-1 text-[0.56rem] uppercase tracking-[0.08em] ${payment === value ? "text-wine underline underline-offset-4" : "text-stone hover:text-ink"}`}>
                  {value}
                </Link>
              );
            })}
          </div>

          {orders.length ? (
            <div className="table-scroll">
              <table className="admin-table w-full min-w-[64rem]">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Placed</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const items = getOrderItems(order.id);
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/admin/orders/${order.order_number}`} className="font-medium text-wine hover:underline">{order.order_number}</Link>
                          <p className="text-[0.6rem] text-stone">{order.source ?? "direct"} / {order.medium ?? "none"}</p>
                        </td>
                        <td>
                          <p>{order.customer_name}</p>
                          <p className="text-[0.62rem] text-stone">{order.phone}</p>
                        </td>
                        <td className="whitespace-nowrap text-stone">{formatDate(order.created_at)}</td>
                        <td>
                          <p>{items.reduce((sum, item) => sum + item.qty, 0)} units</p>
                          <p className="max-w-40 truncate text-[0.62rem] text-stone">{items[0]?.name}{items.length > 1 ? ` +${items.length - 1}` : ""}</p>
                        </td>
                        <td><PaymentStatusBadge status={order.payment_status} /><p className="mt-0.5 text-[0.58rem] uppercase text-stone">{order.payment_method}</p></td>
                        <td><OrderStatusBadge status={order.status} /></td>
                        <td className="text-right font-medium">{formatMoney(order.total)}</td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={whatsappLink(`Hello ${order.customer_name.split(" ")[0]}, this is Maison du Scent about your order ${order.order_number}.`, order.phone)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stone hover:text-moss"
                              aria-label="Message customer"
                            >
                              <MessageCircle size={14} />
                            </a>
                            <Link href={`/admin/orders/${order.order_number}`} className="inline-flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-wine hover:text-ink">
                              Manage <ArrowRight size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No orders match"
              description="Try clearing the filters. New orders will appear here as soon as they are placed."
              action={<Link href="/admin/orders" className="btn btn-outline btn-sm">Clear filters</Link>}
            />
          )}
        </Panel>
      </div>
    </>
  );
}
