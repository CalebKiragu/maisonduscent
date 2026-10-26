import { getDb, nowSql } from "./db";
import { mapOrder } from "./queries";
import type { Order } from "./types";

export interface Range {
  days: number;
  from: string;
  previousFrom: string;
  label: string;
}

const RANGE_LABELS: Record<number, string> = {
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
};

export function parseRange(value?: string | string[]): Range {
  const raw = Array.isArray(value) ? value[0] : value;
  const days = raw && [7, 30, 90].includes(Number(raw)) ? Number(raw) : 30;
  return {
    days,
    from: nowSql(new Date(Date.now() - days * 86400000)),
    previousFrom: nowSql(new Date(Date.now() - days * 2 * 86400000)),
    label: RANGE_LABELS[days] ?? "Last 30 days",
  };
}

function single(sql: string, ...params: (string | number)[]) {
  return getDb().prepare(sql).get(...params) as Record<string, unknown>;
}

function num(value: unknown): number {
  return Number(value ?? 0);
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export interface Overview {
  revenue: number;
  previousRevenue: number;
  orders: number;
  previousOrders: number;
  visitors: number;
  previousVisitors: number;
  pageviews: number;
  previousPageviews: number;
  conversion: number;
  previousConversion: number;
  aov: number;
  previousAov: number;
  customers: number;
  newCustomers: number;
  productViews: number;
  addToCart: number;
  whatsappClicks: number;
}

export function getOverview(range: Range): Overview {
  const db = getDb();
  const cur = single(
    `SELECT
      COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
      COUNT(CASE WHEN status != 'cancelled' THEN 1 END) AS orders,
      COUNT(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN 1 END) AS paid_orders
     FROM orders WHERE created_at >= ?`,
    range.from,
  );
  const prev = single(
    `SELECT
      COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
      COUNT(CASE WHEN status != 'cancelled' THEN 1 END) AS orders,
      COUNT(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN 1 END) AS paid_orders
     FROM orders WHERE created_at >= ? AND created_at < ?`,
    range.previousFrom,
    range.from,
  );
  const visitors = num(
    single("SELECT COUNT(DISTINCT session_id) AS c FROM page_views WHERE created_at >= ?", range.from).c,
  );
  const prevVisitors = num(
    single("SELECT COUNT(DISTINCT session_id) AS c FROM page_views WHERE created_at >= ? AND created_at < ?", range.previousFrom, range.from).c,
  );
  const pageviews = num(single("SELECT COUNT(*) AS c FROM page_views WHERE created_at >= ?", range.from).c);
  const prevPageviews = num(
    single("SELECT COUNT(*) AS c FROM page_views WHERE created_at >= ? AND created_at < ?", range.previousFrom, range.from).c,
  );
  const productViews = num(
    single("SELECT COUNT(*) AS c FROM page_views WHERE page_type = 'product' AND created_at >= ?", range.from).c,
  );
  const addToCart = num(
    single("SELECT COUNT(*) AS c FROM events WHERE name = 'add_to_cart' AND created_at >= ?", range.from).c,
  );
  const whatsappClicks = num(
    single("SELECT COUNT(*) AS c FROM events WHERE name = 'whatsapp_click' AND created_at >= ?", range.from).c,
  );
  const customers = single("SELECT COUNT(*) AS c FROM users WHERE role = 'member'");
  const newCustomers = single("SELECT COUNT(*) AS c FROM users WHERE role = 'member' AND created_at >= ?", range.from);
  const paidOrders = num(cur.paid_orders);
  const prevPaidOrders = num(prev.paid_orders);
  return {
    revenue: num(cur.revenue),
    previousRevenue: num(prev.revenue),
    orders: num(cur.orders),
    previousOrders: num(prev.orders),
    visitors,
    previousVisitors: prevVisitors,
    pageviews,
    previousPageviews: prevPageviews,
    conversion: visitors ? (paidOrders / visitors) * 100 : 0,
    previousConversion: prevVisitors ? (prevPaidOrders / prevVisitors) * 100 : 0,
    aov: paidOrders ? num(cur.revenue) / paidOrders : 0,
    previousAov: prevPaidOrders ? num(prev.revenue) / prevPaidOrders : 0,
    customers: num(customers.c),
    newCustomers: num(newCustomers.c),
    productViews,
    addToCart,
    whatsappClicks,
  };
}

export interface SeriesPoint {
  date: string;
  label: string;
  revenue: number;
  visitors: number;
  orders: number;
  views: number;
}

export function getTimeSeries(range: Range): SeriesPoint[] {
  const db = getDb();
  const revenueRows = db
    .prepare(
      `SELECT date(created_at) AS d, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
       FROM orders WHERE created_at >= ? AND payment_status = 'paid' AND status != 'cancelled'
       GROUP BY date(created_at)`,
    )
    .all(range.from) as { d: string; revenue: number; orders: number }[];
  const viewRows = db
    .prepare(
      `SELECT date(created_at) AS d, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
       FROM page_views WHERE created_at >= ? GROUP BY date(created_at)`,
    )
    .all(range.from) as { d: string; views: number; visitors: number }[];
  const revenueMap = new Map(revenueRows.map((r) => [r.d, r]));
  const viewMap = new Map(viewRows.map((r) => [r.d, r]));
  const points: SeriesPoint[] = [];
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (range.days - 1));
  for (let i = 0; i < range.days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short" }).format(d),
      revenue: num(revenueMap.get(key)?.revenue),
      orders: num(revenueMap.get(key)?.orders),
      views: num(viewMap.get(key)?.views),
      visitors: num(viewMap.get(key)?.visitors),
    });
  }
  return points;
}

export interface TopProduct {
  id: number;
  name: string;
  brand: string;
  slug: string;
  image: string;
  views: number;
  sold: number;
  revenue: number;
}

export function getTopProducts(range: Range, limit = 8): TopProduct[] {
  const rows = getDb()
    .prepare(
      `SELECT p.id, p.name, p.brand, p.slug, p.image,
        COUNT(v.id) AS views,
        (SELECT COALESCE(SUM(oi.qty), 0) FROM order_items oi JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = p.id AND o.payment_status = 'paid' AND o.created_at >= ?) AS sold,
        (SELECT COALESCE(SUM(oi.qty * oi.unit_price), 0) FROM order_items oi JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = p.id AND o.payment_status = 'paid' AND o.created_at >= ?) AS revenue
       FROM products p
       LEFT JOIN page_views v ON v.product_id = p.id AND v.created_at >= ?
       GROUP BY p.id ORDER BY views DESC, sold DESC LIMIT ?`,
    )
    .all(range.from, range.from, range.from, limit) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    brand: String(row.brand),
    slug: String(row.slug),
    image: String(row.image),
    views: Number(row.views),
    sold: Number(row.sold),
    revenue: Number(row.revenue),
  }));
}

export interface TopPage {
  path: string;
  views: number;
  visitors: number;
  page_type: string;
}

export function getTopPages(range: Range, limit = 8): TopPage[] {
  const rows = getDb()
    .prepare(
      `SELECT path, page_type, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
       FROM page_views WHERE created_at >= ?
       GROUP BY path ORDER BY views DESC LIMIT ?`,
    )
    .all(range.from, limit) as Record<string, unknown>[];
  return rows.map((row) => ({
    path: String(row.path),
    page_type: String(row.page_type),
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

export interface SourcePerformance {
  source: string;
  medium: string;
  campaign: string | null;
  visitors: number;
  pageviews: number;
  orders: number;
  revenue: number;
  conversion: number;
}

export function getSources(range: Range, limit = 10): SourcePerformance[] {
  const visits = getDb()
    .prepare(
      `SELECT source, medium, COALESCE(campaign, '') AS campaign,
        COUNT(DISTINCT session_id) AS visitors, COUNT(*) AS pageviews
       FROM page_views WHERE created_at >= ?
       GROUP BY source, medium, campaign ORDER BY visitors DESC`,
    )
    .all(range.from) as Record<string, unknown>[];
  const orders = getDb()
    .prepare(
      `SELECT COALESCE(source, 'direct') AS source, COALESCE(medium, 'none') AS medium,
        COALESCE(campaign, '') AS campaign, COUNT(*) AS orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS revenue
       FROM orders WHERE created_at >= ? AND status != 'cancelled'
       GROUP BY source, medium, campaign`,
    )
    .all(range.from) as Record<string, unknown>[];
  const orderMap = new Map(
    orders.map((row) => [`${row.source}|${row.medium}|${row.campaign}`, row]),
  );
  const seen = new Set<string>();
  const rows: SourcePerformance[] = [];
  for (const row of visits) {
    const key = `${row.source}|${row.medium}|${row.campaign}`;
    seen.add(key);
    const order = orderMap.get(key);
    const visitors = Number(row.visitors);
    const orderCount = Number(order?.orders ?? 0);
    rows.push({
      source: String(row.source),
      medium: String(row.medium),
      campaign: row.campaign ? String(row.campaign) : null,
      visitors,
      pageviews: Number(row.pageviews),
      orders: orderCount,
      revenue: Number(order?.revenue ?? 0),
      conversion: visitors ? (orderCount / visitors) * 100 : 0,
    });
  }
  for (const [key, order] of orderMap) {
    if (seen.has(key)) continue;
    rows.push({
      source: String(order.source),
      medium: String(order.medium),
      campaign: order.campaign ? String(order.campaign) : null,
      visitors: 0,
      pageviews: 0,
      orders: Number(order.orders),
      revenue: Number(order.revenue),
      conversion: 0,
    });
  }
  return rows.sort((a, b) => b.visitors - a.visitors || b.revenue - a.revenue).slice(0, limit);
}

export function getCampaignPerformance(range: Range, limit = 8): SourcePerformance[] {
  return getSources({ ...range }, 50)
    .filter((row) => Boolean(row.campaign))
    .sort((a, b) => b.revenue - a.revenue || b.visitors - a.visitors)
    .slice(0, limit);
}

export function getDeviceSplit(range: Range): { device: string; visitors: number; pageviews: number; share: number }[] {
  const rows = getDb()
    .prepare(
      `SELECT device, COUNT(DISTINCT session_id) AS visitors, COUNT(*) AS pageviews
       FROM page_views WHERE created_at >= ? GROUP BY device`,
    )
    .all(range.from) as Record<string, unknown>[];
  const total = rows.reduce((sum, row) => sum + Number(row.visitors), 0);
  return rows
    .map((row) => ({
      device: String(row.device),
      visitors: Number(row.visitors),
      pageviews: Number(row.pageviews),
      share: total ? (Number(row.visitors) / total) * 100 : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);
}

export interface FunnelStep {
  label: string;
  value: number;
  rate: number;
}

export function getFunnel(range: Range): FunnelStep[] {
  const db = getDb();
  const productViews = num(
    single("SELECT COUNT(*) c FROM page_views WHERE page_type = 'product' AND created_at >= ?", range.from).c,
  );
  const addToCart = num(single("SELECT COUNT(*) c FROM events WHERE name = 'add_to_cart' AND created_at >= ?", range.from).c);
  const checkouts = num(single("SELECT COUNT(*) c FROM events WHERE name = 'checkout_started' AND created_at >= ?", range.from).c);
  const paid = num(
    single("SELECT COUNT(*) c FROM orders WHERE payment_status = 'paid' AND status != 'cancelled' AND created_at >= ?", range.from).c,
  );
  const steps = [
    { label: "Product views", value: productViews },
    { label: "Added to bag", value: addToCart },
    { label: "Checkout started", value: checkouts },
    { label: "Paid orders", value: paid },
  ];
  return steps.map((step, i) => ({
    ...step,
    rate: i === 0 ? 100 : steps[0].value ? (step.value / steps[0].value) * 100 : 0,
  }));
}

export function getSearchTerms(range: Range, limit = 8): { query: string; count: number }[] {
  const rows = getDb()
    .prepare(
      `SELECT json_extract(metadata, '$.query') AS query, COUNT(*) AS count
       FROM events WHERE name = 'search' AND created_at >= ?
       GROUP BY query ORDER BY count DESC LIMIT ?`,
    )
    .all(range.from, limit) as { query: string | null; count: number }[];
  return rows.filter((row) => row.query).map((row) => ({ query: String(row.query), count: Number(row.count) }));
}

export function getOrderStatusCounts(): Record<string, number> {
  const rows = getDb().prepare("SELECT status, COUNT(*) AS c FROM orders GROUP BY status").all() as { status: string; c: number }[];
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.c)]));
}

export function getOrderActionCount(): number {
  return num(
    single("SELECT COUNT(*) c FROM orders WHERE status IN ('pending','confirmed','packing','ready')").c,
  );
}

export function getRecentOrders(limit = 6): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapOrder);
}

export function getLowStock(threshold = 8): { id: number; name: string; brand: string; stock: number; status: string; image: string }[] {
  const rows = getDb()
    .prepare(
      `SELECT id, name, brand, stock, status, image FROM products
       WHERE status IN ('low_stock','out_of_stock','pending','held') OR stock <= ?
       ORDER BY stock ASC, name ASC LIMIT 8`,
    )
    .all(threshold) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    brand: String(row.brand),
    stock: Number(row.stock),
    status: String(row.status),
    image: String(row.image),
  }));
}

export function getAnalyticsData(range: Range) {
  return {
    overview: getOverview(range),
    series: getTimeSeries(range),
    topProducts: getTopProducts(range, 8),
    topPages: getTopPages(range, 8),
    sources: getSources(range, 10),
    campaigns: getCampaignPerformance(range, 8),
    devices: getDeviceSplit(range),
    funnel: getFunnel(range),
    searchTerms: getSearchTerms(range, 8),
    orderStatuses: getOrderStatusCounts(),
    recentOrders: getRecentOrders(6),
    lowStock: getLowStock(6),
    orderActionCount: getOrderActionCount(),
  };
}

export function getDashboardData(range: Range) {
  return {
    ...getAnalyticsData(range),
    topProducts: getTopProducts(range, 5),
    topPages: getTopPages(range, 5),
    campaigns: getCampaignPerformance(range, 5),
    recentOrders: getRecentOrders(6),
  };
}
