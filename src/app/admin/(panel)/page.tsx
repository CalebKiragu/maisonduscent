import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, MessageCircle, PackagePlus, Plus, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData, parseRange, pctChange } from "@/lib/analytics";
import { formatDate, formatMoney, formatPercent } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { AdminPageHeader, BarRow, Delta, EmptyState, KpiCard, Panel, RangeTabs, SectionLink, TrendChart } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  const range = parseRange(query.days);
  const data = getDashboardData(range);
  const { overview, series, topProducts, topPages, sources, recentOrders, lowStock, campaigns } = data;
  const maxSource = Math.max(...sources.map((source) => source.visitors), 1);
  const maxProductViews = Math.max(...topProducts.map((product) => product.views), 1);
  const maxPageViews = Math.max(...topPages.map((page) => page.views), 1);

  return (
    <>
      <AdminPageHeader
        eyebrow={range.label}
        title="Good to see you."
        description="A live view of the storefront: revenue, traffic, what people are viewing and what needs your attention today."
      >
        <RangeTabs basePath="/admin" days={range.days} />
        <Link href="/admin/products/new" className="btn btn-ink btn-sm"><Plus size={13} /> New product</Link>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatMoney(overview.revenue)} change={pctChange(overview.revenue, overview.previousRevenue)} hint="vs previous period" icon={<Wallet size={15} />} href="/admin/orders?payment=paid" />
        <KpiCard label="Orders" value={overview.orders.toLocaleString("en-KE")} change={pctChange(overview.orders, overview.previousOrders)} hint={`${data.orderActionCount} awaiting action`} icon={<ShoppingBag size={15} />} href="/admin/orders" />
        <KpiCard label="Visitors" value={overview.visitors.toLocaleString("en-KE")} change={pctChange(overview.visitors, overview.previousVisitors)} hint={`${overview.pageviews.toLocaleString("en-KE")} pageviews`} icon={<Users size={15} />} href="/admin/analytics" />
        <KpiCard label="Conversion" value={formatPercent(overview.conversion)} change={pctChange(overview.conversion, overview.previousConversion)} hint="visitors → paid orders" icon={<TrendingUp size={15} />} href="/admin/analytics#funnel" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Average order value" value={formatMoney(overview.aov)} change={pctChange(overview.aov, overview.previousAov)} />
        <KpiCard label="Product views" value={overview.productViews.toLocaleString("en-KE")} hint="pages viewed" icon={<Eye size={14} />} />
        <KpiCard label="Added to bag" value={overview.addToCart.toLocaleString("en-KE")} hint="add-to-cart events" icon={<PackagePlus size={14} />} />
        <KpiCard label="WhatsApp clicks" value={overview.whatsappClicks.toLocaleString("en-KE")} hint="high-intent conversations" icon={<MessageCircle size={14} />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Panel
          title="Revenue trend"
          description={`${range.label} · paid orders only`}
          action={<Link href="/admin/analytics" className="text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">Full analytics</Link>}
        >
          <TrendChart points={series} metric="revenue" />
        </Panel>

        <Panel title="Traffic sources" description="Where visits and orders came from" action={<SectionLink href="/admin/analytics">Details</SectionLink>}>
          {sources.length ? (
            <div className="divide-y divide-[#eee7db]">
              {sources.slice(0, 6).map((source) => (
                <BarRow
                  key={`${source.source}-${source.medium}-${source.campaign ?? ""}`}
                  label={`${source.source} / ${source.medium}`}
                  sub={source.campaign ? `Campaign: ${source.campaign}` : undefined}
                  value={source.visitors}
                  max={maxSource}
                  display={`${source.visitors.toLocaleString("en-KE")} visits · ${source.orders} orders`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No traffic yet" description="Visits will appear here as soon as the storefront receives traffic." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Panel
          title="Recent orders"
          description="Newest orders across all channels"
          action={<SectionLink href="/admin/orders">All orders</SectionLink>}
        >
          {recentOrders.length ? (
            <div className="table-scroll">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Placed</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/orders/${order.order_number}`} className="font-medium text-wine hover:underline">{order.order_number}</Link>
                      </td>
                      <td>
                        <p>{order.customer_name}</p>
                        <p className="text-[0.64rem] text-stone">{order.city}</p>
                      </td>
                      <td className="whitespace-nowrap text-stone">{formatDate(order.created_at)}</td>
                      <td><OrderStatusBadge status={order.status} /></td>
                      <td className="text-right font-medium">{formatMoney(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No orders yet" description="Orders from the storefront and manual WhatsApp sales will appear here." />
          )}
        </Panel>

        <Panel title="Stock attention" description="Low, held or out of stock" action={<SectionLink href="/admin/products">Inventory</SectionLink>}>
          {lowStock.length ? (
            <div className="divide-y divide-[#eee7db]">
              {lowStock.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#faf7f1] sm:px-5">
                  <span className="relative h-11 w-9 shrink-0 overflow-hidden bg-[#eee7db]">
                    {product.image ? <Image src={product.image} alt={product.name} fill sizes="36px" className="object-cover" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.74rem]">{product.name}</p>
                    <p className="mt-0.5 text-[0.62rem] text-stone">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[0.72rem] font-medium ${product.stock <= 0 ? "text-rose-700" : "text-amber-700"}`}>{product.stock} left</p>
                    <p className="text-[0.58rem] uppercase tracking-[0.08em] text-stone">{product.status.replace("_", " ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Stock is healthy" description="No products are low, held or out of stock right now." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Most-viewed products" description="Product page views" action={<SectionLink href="/admin/analytics">Analytics</SectionLink>}>
          {topProducts.length ? (
            <div className="divide-y divide-[#eee7db]">
              {topProducts.map((product) => (
                <BarRow
                  key={product.id}
                  label={`${product.brand} — ${product.name}`}
                  sub={`${product.sold} sold · ${formatMoney(product.revenue)} revenue`}
                  value={product.views}
                  max={maxProductViews}
                  display={`${product.views} views`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No product views yet" description="Views are tracked automatically as shoppers browse." />
          )}
        </Panel>

        <Panel title="Most-viewed pages" description="Traffic by path" action={<SectionLink href="/admin/analytics">Analytics</SectionLink>}>
          {topPages.length ? (
            <div className="divide-y divide-[#eee7db]">
              {topPages.map((page) => (
                <BarRow
                  key={page.path}
                  label={page.path}
                  sub={`${page.page_type} · ${page.visitors} unique visitors`}
                  value={page.views}
                  max={maxPageViews}
                  display={`${page.views} views`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No page views yet" description="Page visits will appear here once the storefront is live." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Campaign performance" description="Paid traffic and attributed revenue" action={<SectionLink href="/admin/analytics">Full report</SectionLink>}>
          {campaigns.length ? (
            <div className="table-scroll">
              <table className="admin-table w-full">
                <thead>
                  <tr><th>Campaign</th><th>Source</th><th className="text-right">Visits</th><th className="text-right">Orders</th><th className="text-right">Revenue</th><th className="text-right">CVR</th></tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={`${campaign.source}-${campaign.campaign}`}>
                      <td className="font-medium">{campaign.campaign}</td>
                      <td className="text-stone">{campaign.source}</td>
                      <td className="text-right">{campaign.visitors.toLocaleString("en-KE")}</td>
                      <td className="text-right">{campaign.orders}</td>
                      <td className="text-right">{formatMoney(campaign.revenue)}</td>
                      <td className="text-right">{formatPercent(campaign.conversion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No campaign data yet" description="Tag your ads with UTM parameters and results will appear here automatically." />
          )}
        </Panel>

        <Panel title="Orders by stage" description="Whole-store pipeline">
          <div className="grid grid-cols-2 gap-px bg-[#eee7db] sm:grid-cols-3">
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <Link key={key} href={`/admin/orders?status=${key}`} className="group bg-[#fffdf9] px-4 py-3.5 transition hover:bg-[#faf7f1]">
                <p className="text-[0.58rem] uppercase tracking-[0.1em] text-stone">{label}</p>
                <p className="mt-1 font-display text-2xl leading-none">{data.orderStatuses[key] ?? 0}</p>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#e4ddd0] px-4 py-3 text-[0.66rem] text-stone">
            <span>New customers this period</span>
            <span className="font-medium text-ink">{overview.newCustomers}</span>
          </div>
        </Panel>
      </div>

      <p className="mt-6 flex items-center gap-2 text-[0.6rem] text-stone">
        <Delta value={pctChange(overview.pageviews, overview.previousPageviews)} /> pageviews vs previous {range.days} days
        <span className="text-[#ddd4c4]">·</span> Data refreshed on every page load
      </p>
    </>
  );
}
