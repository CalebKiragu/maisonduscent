import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAnalyticsData, parseRange, pctChange } from "@/lib/analytics";
import { formatMoney, formatPercent } from "@/lib/utils";
import { AdminPageHeader, BarRow, EmptyState, KpiCard, Panel, RangeTabs, TrendChart } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; metric?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const range = parseRange(query.days);
  const metric = query.metric === "visitors" ? "visitors" : "revenue";
  const data = getAnalyticsData(range);
  const { overview, series, topProducts, topPages, sources, campaigns, devices, funnel, searchTerms, orderStatuses } = data;
  const maxFunnel = Math.max(...funnel.map((step) => step.value), 1);
  const maxPageViews = Math.max(...topPages.map((page) => page.views), 1);
  const maxProductViews = Math.max(...topProducts.map((product) => product.views), 1);

  return (
    <>
      <AdminPageHeader
        eyebrow="Store intelligence"
        title="Analytics"
        description="First-party traffic, campaign attribution, product interest and the full purchase funnel. All numbers are live from your own store database."
      >
        <RangeTabs basePath="/admin/analytics" days={range.days} />
        <Link href="/admin/products/import" className="btn btn-outline btn-sm">Export data</Link>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Revenue" value={formatMoney(overview.revenue)} change={pctChange(overview.revenue, overview.previousRevenue)} hint="vs previous period" />
        <KpiCard label="Paid orders" value={overview.orders.toLocaleString("en-KE")} change={pctChange(overview.orders, overview.previousOrders)} hint={`${formatMoney(overview.aov)} average order`} />
        <KpiCard label="Visitors" value={overview.visitors.toLocaleString("en-KE")} change={pctChange(overview.visitors, overview.previousVisitors)} hint={`${overview.pageviews.toLocaleString("en-KE")} pageviews`} />
        <KpiCard label="Conversion rate" value={formatPercent(overview.conversion)} change={pctChange(overview.conversion, overview.previousConversion)} hint="unique visitors → paid orders" />
        <KpiCard label="Product interest" value={overview.productViews.toLocaleString("en-KE")} hint="product page views" />
        <KpiCard label="Add to bag" value={overview.addToCart.toLocaleString("en-KE")} hint={`${overview.whatsappClicks} WhatsApp clicks`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title={metric === "revenue" ? "Revenue trend" : "Visitor trend"}
          description={range.label}
          action={
            <div className="inline-flex border border-[#ddd4c4] bg-[#fffdf9] p-0.5">
              <Link href={`/admin/analytics?days=${range.days}&metric=revenue`} className={`px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${metric === "revenue" ? "bg-ink text-cream" : "text-stone hover:text-ink"}`}>Revenue</Link>
              <Link href={`/admin/analytics?days=${range.days}&metric=visitors`} className={`px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${metric === "visitors" ? "bg-ink text-cream" : "text-stone hover:text-ink"}`}>Visitors</Link>
            </div>
          }
        >
          <TrendChart points={series} metric={metric} />
        </Panel>

        <Panel title="Purchase funnel" description={`${range.label} · product view to paid order`}>
          <div className="space-y-4 px-4 py-4 sm:px-5" id="funnel">
            {funnel.map((step, index) => (
              <div key={step.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[0.72rem]">{step.label}</p>
                  <p className="text-[0.68rem] text-stone">
                    {step.value.toLocaleString("en-KE")}
                    {index > 0 ? <span className="ml-2 text-[0.6rem] text-mist">{formatPercent(step.rate)} of views</span> : null}
                  </p>
                </div>
                <div className="mt-2 h-2 w-full bg-[#eee7db]">
                  <div className={`h-full ${index === funnel.length - 1 ? "bg-moss" : "bg-wine/75"}`} style={{ width: `${Math.max(2, (step.value / maxFunnel) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Traffic sources" description="Visits, orders and revenue by source / medium">
          {sources.length ? (
            <div className="table-scroll">
              <table className="admin-table w-full">
                <thead><tr><th>Source</th><th>Medium</th><th className="text-right">Visits</th><th className="text-right">Orders</th><th className="text-right">Revenue</th><th className="text-right">CVR</th></tr></thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={`${source.source}-${source.medium}-${source.campaign ?? ""}`}>
                      <td className="font-medium">{source.source}</td>
                      <td className="text-stone">{source.medium}</td>
                      <td className="text-right">{source.visitors.toLocaleString("en-KE")}</td>
                      <td className="text-right">{source.orders}</td>
                      <td className="text-right">{formatMoney(source.revenue)}</td>
                      <td className="text-right">{formatPercent(source.conversion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No traffic recorded" description="Traffic appears as soon as visitors reach the storefront. Use UTM links for paid campaigns." />
          )}
        </Panel>

        <Panel title="Campaigns" description="Attributed to UTM campaign tags">
          {campaigns.length ? (
            <div className="divide-y divide-[#eee7db]">
              {campaigns.map((campaign) => (
                <BarRow
                  key={`${campaign.source}-${campaign.campaign}`}
                  label={campaign.campaign ?? "Untagged"}
                  sub={`${campaign.source} / ${campaign.medium} · ${campaign.orders} orders · ${formatPercent(campaign.conversion)} CVR`}
                  value={campaign.visitors}
                  max={Math.max(...campaigns.map((item) => item.visitors), 1)}
                  display={formatMoney(campaign.revenue)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No campaign traffic yet" description="Add utm_source, utm_medium and utm_campaign to ad URLs to measure paid performance." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Most-viewed products" description="Views, units sold and revenue in period">
          {topProducts.length ? (
            <div className="table-scroll">
              <table className="admin-table w-full">
                <thead><tr><th>Product</th><th className="text-right">Views</th><th className="text-right">Sold</th><th className="text-right">Revenue</th></tr></thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-wine">{product.name}</Link>
                        <p className="text-[0.62rem] text-stone">{product.brand}</p>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{product.views}</span>
                          <span className="hidden h-1 w-16 bg-[#eee7db] sm:block">
                            <span className="block h-full bg-wine/60" style={{ width: `${(product.views / maxProductViews) * 100}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="text-right">{product.sold}</td>
                      <td className="text-right">{formatMoney(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No product views" description="Product-page traffic will appear here once shoppers browse." />
          )}
        </Panel>

        <Panel title="Devices" description="Unique visitors by device">
          {devices.length ? (
            <div className="divide-y divide-[#eee7db]">
              {devices.map((device) => (
                <BarRow
                  key={device.device}
                  label={device.device}
                  sub={`${device.pageviews.toLocaleString("en-KE")} pageviews`}
                  value={device.visitors}
                  max={Math.max(...devices.map((item) => item.visitors), 1)}
                  display={`${device.visitors.toLocaleString("en-KE")} · ${formatPercent(device.share, 0)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No device data" description="Device insights will appear with storefront traffic." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Most-viewed pages" description="Top pages by pageviews">
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
            <EmptyState title="No page views" description="Pageviews are captured by the first-party analytics beacon." />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Searches on site" description="What shoppers are looking for">
            {searchTerms.length ? (
              <div className="divide-y divide-[#eee7db]">
                {searchTerms.map((term) => (
                  <div key={term.query} className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                    <p className="text-[0.74rem]">&ldquo;{term.query}&rdquo;</p>
                    <p className="text-[0.66rem] text-stone">{term.count} searches</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-[0.72rem] text-stone sm:px-5">No searches recorded in this period.</p>
            )}
          </Panel>

          <Panel title="Orders by stage" description="All-time pipeline">
            <div className="grid grid-cols-3 gap-px bg-[#eee7db]">
              {Object.entries(orderStatuses).map(([status, count]) => (
                <Link key={status} href={`/admin/orders?status=${status}`} className="bg-[#fffdf9] px-3 py-3 transition hover:bg-[#faf7f1]">
                  <p className="text-[0.54rem] uppercase tracking-[0.08em] text-stone">{status.replace(/_/g, " ")}</p>
                  <p className="mt-1 font-display text-xl leading-none">{count}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
