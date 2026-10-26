import { getDb } from "./db";
import type {
  Address,
  Collection,
  Order,
  OrderEvent,
  OrderItem,
  Product,
  Review,
  User,
} from "./types";
import { mapUser } from "./auth";
import { parseJsonArray, slugify, startingPrice } from "./utils";

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    name: String(row.name),
    brand: String(row.brand),
    gender: row.gender as Product["gender"],
    family: String(row.family),
    concentration: String(row.concentration),
    description: String(row.description ?? ""),
    story: String(row.story ?? ""),
    top_notes: parseJsonArray(row.top_notes),
    heart_notes: parseJsonArray(row.heart_notes),
    base_notes: parseJsonArray(row.base_notes),
    price_2: Number(row.price_2 ?? 0),
    price_5: Number(row.price_5 ?? 0),
    price_8: Number(row.price_8 ?? 0),
    price_30: Number(row.price_30 ?? 0),
    stock: Number(row.stock ?? 0),
    status: row.status as Product["status"],
    badge: row.badge ? String(row.badge) : null,
    bestseller: Boolean(row.bestseller),
    new_arrival: Boolean(row.new_arrival),
    featured: Boolean(row.featured),
    rating: Number(row.rating ?? 0),
    review_count: Number(row.review_count ?? 0),
    image: String(row.image ?? ""),
    gallery: parseJsonArray(row.gallery),
    collections: parseJsonArray(row.collections),
    type: row.type as Product["type"],
    bundle_items: parseJsonArray(row.bundle_items),
    cost_price: Number(row.cost_price ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function getAllProducts(mode: "store" | "admin" = "store"): Product[] {
  const where = mode === "store" ? "WHERE status != 'discontinued'" : "";
  const rows = getDb()
    .prepare(`SELECT * FROM products ${where} ORDER BY featured DESC, bestseller DESC, rating DESC, name ASC`)
    .all() as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const row = getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : null;
}

export function getProductById(id: number): Product | null {
  const row = getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : null;
}

export function getProductBySku(sku: string): Product | null {
  const row = getDb().prepare("SELECT * FROM products WHERE sku = ?").get(sku) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : null;
}

export function getFeaturedProducts(limit = 8): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE featured = 1 AND status != 'discontinued' ORDER BY bestseller DESC, rating DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getBestsellers(limit = 8): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE bestseller = 1 AND status != 'discontinued' ORDER BY rating DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getNewArrivals(limit = 8): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE new_arrival = 1 AND status != 'discontinued' ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getProductsByGender(gender: "her" | "him" | "unisex"): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE (gender = ? OR gender = 'unisex') AND type = 'perfume' AND status != 'discontinued' ORDER BY bestseller DESC, rating DESC")
    .all(gender) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getCollections(): Collection[] {
  const rows = getDb().prepare("SELECT * FROM collections ORDER BY sort ASC, title ASC").all() as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle),
    description: String(row.description),
    image: String(row.image),
    theme: String(row.theme),
    sort: Number(row.sort),
  }));
}

export function getCollectionBySlug(slug: string): Collection | null {
  const row = getDb().prepare("SELECT * FROM collections WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle),
    description: String(row.description),
    image: String(row.image),
    theme: String(row.theme),
    sort: Number(row.sort),
  };
}

export function getProductsByCollection(slug: string): Product[] {
  const products = getAllProducts("store").filter((p) => p.collections.includes(slug));
  return products.sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.rating - a.rating);
}

export interface BrandSummary {
  name: string;
  slug: string;
  count: number;
  image: string;
  from: number;
  bestseller: boolean;
}

export function getBrands(): BrandSummary[] {
  const products = getAllProducts("store").filter((p) => p.type === "perfume");
  const map = new Map<string, BrandSummary>();
  for (const p of products) {
    const slug = slugify(p.brand);
    const existing = map.get(slug);
    if (!existing) {
      map.set(slug, {
        name: p.brand,
        slug,
        count: 1,
        image: p.image,
        from: startingPrice(p),
        bestseller: p.bestseller,
      });
    } else {
      existing.count += 1;
      existing.from = Math.min(existing.from, startingPrice(p));
      existing.bestseller = existing.bestseller || p.bestseller;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getBrandBySlug(slug: string): BrandSummary | null {
  return getBrands().find((b) => b.slug === slug) ?? null;
}

export function getProductsByBrand(slug: string): Product[] {
  return getAllProducts("store").filter((p) => p.type === "perfume" && slugify(p.brand) === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const all = getAllProducts("store").filter((p) => p.id !== product.id && p.type === product.type);
  return all
    .map((p) => {
      let score = 0;
      for (const c of product.collections) if (p.collections.includes(c)) score += 3;
      if (p.family === product.family) score += 2;
      if (p.gender === product.gender) score += 1;
      if (p.brand === product.brand) score += 2;
      score += p.rating / 10;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export function searchProducts(query: string, limit = 12): Product[] {
  const q = `%${query.trim().toLowerCase()}%`;
  if (!query.trim()) return [];
  const rows = getDb()
    .prepare(
      `SELECT * FROM products
       WHERE status != 'discontinued' AND (
         lower(name) LIKE ? OR lower(brand) LIKE ? OR lower(family) LIKE ?
         OR lower(top_notes) LIKE ? OR lower(heart_notes) LIKE ? OR lower(base_notes) LIKE ?
       )
       ORDER BY bestseller DESC, rating DESC LIMIT ?`,
    )
    .all(q, q, q, q, q, q, limit) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getReviews(productId: number, limit = 6): Review[] {
  const rows = getDb()
    .prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT ?")
    .all(productId, limit) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    product_id: Number(row.product_id),
    name: String(row.name),
    rating: Number(row.rating),
    title: String(row.title),
    body: String(row.body),
    created_at: String(row.created_at),
  }));
}

export function getBundleContents(product: Product): Product[] {
  if (product.type !== "bundle" || !product.bundle_items.length) return [];
  const all = getAllProducts("store");
  return product.bundle_items
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export function getOrderByNumber(orderNumber: string): Order | null {
  const row = getDb().prepare("SELECT * FROM orders WHERE order_number = ?").get(orderNumber) as Record<string, unknown> | undefined;
  return row ? mapOrder(row) : null;
}

export function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: Number(row.id),
    order_number: String(row.order_number),
    user_id: row.user_id ? Number(row.user_id) : null,
    customer_name: String(row.customer_name),
    email: String(row.email),
    phone: String(row.phone),
    address: String(row.address),
    city: String(row.city),
    notes: String(row.notes ?? ""),
    subtotal: Number(row.subtotal),
    delivery_fee: Number(row.delivery_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    payment_method: row.payment_method as Order["payment_method"],
    payment_status: row.payment_status as Order["payment_status"],
    status: row.status as Order["status"],
    source: row.source ? String(row.source) : null,
    medium: row.medium ? String(row.medium) : null,
    campaign: row.campaign ? String(row.campaign) : null,
    courier: row.courier ? String(row.courier) : null,
    tracking_number: row.tracking_number ? String(row.tracking_number) : null,
    rider: row.rider ? String(row.rider) : null,
    amount_collected: Number(row.amount_collected ?? 0),
    collected_at: row.collected_at ? String(row.collected_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function getOrderItems(orderId: number): OrderItem[] {
  const rows = getDb().prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC").all(orderId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    order_id: Number(row.order_id),
    product_id: row.product_id ? Number(row.product_id) : null,
    name: String(row.name),
    brand: String(row.brand),
    size: String(row.size),
    unit_price: Number(row.unit_price),
    qty: Number(row.qty),
    image: String(row.image),
  }));
}

export function getOrderEvents(orderId: number): OrderEvent[] {
  const rows = getDb()
    .prepare("SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at ASC, id ASC")
    .all(orderId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    order_id: Number(row.order_id),
    status: String(row.status),
    note: String(row.note),
    created_by: String(row.created_by),
    created_at: String(row.created_at),
  }));
}

export function getOrderDetail(orderNumber: string): { order: Order; items: OrderItem[]; events: OrderEvent[] } | null {
  const order = getOrderByNumber(orderNumber);
  if (!order) return null;
  return { order, items: getOrderItems(order.id), events: getOrderEvents(order.id) };
}

export function getUserOrders(userId: number): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Record<string, unknown>[];
  return rows.map(mapOrder);
}

export interface OrderAdminStats {
  total: number;
  toAction: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  paidRevenue: number;
  unpaidValue: number;
}

export function getAllOrders(limit = 400): Order[] {
  const rows = getDb()
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapOrder);
}

export function getOrderAdminStats(): OrderAdminStats {
  const row = getDb()
    .prepare(
      `SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN status IN ('pending','confirmed','packing','ready') THEN 1 END) AS to_action,
        COUNT(CASE WHEN status = 'out_for_delivery' THEN 1 END) AS in_transit,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered,
        COUNT(CASE WHEN status IN ('cancelled','returned') THEN 1 END) AS cancelled,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' AND status != 'cancelled' THEN total ELSE 0 END), 0) AS paid_revenue,
        COALESCE(SUM(CASE WHEN payment_status IN ('unpaid','cod') AND status NOT IN ('cancelled','returned') THEN total ELSE 0 END), 0) AS unpaid_value
       FROM orders`,
    )
    .get() as Record<string, unknown>;
  return {
    total: Number(row.total ?? 0),
    toAction: Number(row.to_action ?? 0),
    inTransit: Number(row.in_transit ?? 0),
    delivered: Number(row.delivered ?? 0),
    cancelled: Number(row.cancelled ?? 0),
    paidRevenue: Number(row.paid_revenue ?? 0),
    unpaidValue: Number(row.unpaid_value ?? 0),
  };
}

export function getWishlistProducts(userId: number): Product[] {
  const rows = getDb()
    .prepare("SELECT p.* FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at DESC")
    .all(userId) as Record<string, unknown>[];
  return rows.map(mapProduct);
}

export function getWishlistIds(userId: number): number[] {
  const rows = getDb().prepare("SELECT product_id FROM wishlist WHERE user_id = ?").all(userId) as { product_id: number }[];
  return rows.map((r) => Number(r.product_id));
}

export function getAddresses(userId: number): Address[] {
  const rows = getDb().prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC").all(userId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    label: String(row.label),
    line1: String(row.line1),
    line2: row.line2 ? String(row.line2) : null,
    city: String(row.city),
    phone: String(row.phone),
    is_default: Number(row.is_default),
  }));
}

export interface CustomerSummary {
  user: User;
  orderCount: number;
  spent: number;
  lastOrder: string | null;
}

export function getCustomers(): CustomerSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT u.*,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
        (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'paid') AS spent,
        (SELECT MAX(o.created_at) FROM orders o WHERE o.user_id = u.id) AS last_order
       FROM users u WHERE u.role = 'member' ORDER BY spent DESC`,
    )
    .all() as Record<string, unknown>[];
  return rows.map((row) => ({
    user: mapUser(row),
    orderCount: Number(row.order_count ?? 0),
    spent: Number(row.spent ?? 0),
    lastOrder: row.last_order ? String(row.last_order) : null,
  }));
}

export function getDashboardCustomerCount(): { total: number; newThisMonth: number } {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) c FROM users WHERE role = 'member'").get() as { c: number };
  const fresh = db
    .prepare("SELECT COUNT(*) c FROM users WHERE role = 'member' AND created_at >= datetime('now', '-30 days')")
    .get() as { c: number };
  return { total: Number(total.c), newThisMonth: Number(fresh.c) };
}
