"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb, nowSql } from "@/lib/db";
import { normalizePhoneNumber, parseNotes, slugify } from "@/lib/utils";
import type { ProductStatus, ProductType } from "@/lib/types";

export interface AdminFormState {
  error?: string;
  success?: string;
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function int(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseInt(text(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value: FormDataEntryValue | null): number {
  return value === "on" || value === "true" || value === "1" ? 1 : 0;
}

function list(value: FormDataEntryValue | null): string[] {
  return text(value)
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function refreshStorefront() {
  revalidatePath("/", "layout");
}

const PRODUCT_STATUSES: ProductStatus[] = ["in_stock", "low_stock", "out_of_stock", "pending", "held", "discontinued"];
const PRODUCT_TYPES: ProductType[] = ["perfume", "bundle", "atomizer", "giftcard"];

export async function saveProductAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();

  const id = int(formData.get("id"), 0);
  const name = text(formData.get("name"));
  const brand = text(formData.get("brand"));
  if (!name || !brand) return { error: "Product name and brand are required." };

  const db = getDb();
  const rawSlug = text(formData.get("slug")) || slugify(`${name}-${brand}`);
  let slug = rawSlug;
  let attempt = 2;
  while (true) {
    const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug) as { id: number } | undefined;
    if (!existing || existing.id === id) break;
    slug = `${rawSlug}-${attempt}`;
    attempt += 1;
  }

  const providedSku = text(formData.get("sku"));
  const sku = providedSku || `MDS-${Date.now().toString(36).toUpperCase()}`;
  const skuOwner = db.prepare("SELECT id FROM products WHERE sku = ?").get(sku) as { id: number } | undefined;
  if (skuOwner && skuOwner.id !== id) return { error: "That SKU is already used by another product." };

  const status = PRODUCT_STATUSES.includes(text(formData.get("status")) as ProductStatus)
    ? (text(formData.get("status")) as ProductStatus)
    : "in_stock";
  const type = PRODUCT_TYPES.includes(text(formData.get("type")) as ProductType)
    ? (text(formData.get("type")) as ProductType)
    : "perfume";
  const gender = ["her", "him", "unisex"].includes(text(formData.get("gender"))) ? text(formData.get("gender")) : "unisex";
  const image = text(formData.get("image")) || "/images/products/p01.jpg";
  const gallery = list(formData.get("gallery"));
  const collections = list(formData.get("collections")).map((item) => slugify(item));
  const bundleItems = list(formData.get("bundle_items")).map((item) => slugify(item));

  const values = [
    slug,
    sku,
    name.slice(0, 140),
    brand.slice(0, 90),
    gender,
    text(formData.get("family")) || "Woody",
    text(formData.get("concentration")) || "Eau de Parfum",
    text(formData.get("description")).slice(0, 2000),
    text(formData.get("story")).slice(0, 2000),
    JSON.stringify(parseNotes(text(formData.get("top_notes")))),
    JSON.stringify(parseNotes(text(formData.get("heart_notes")))),
    JSON.stringify(parseNotes(text(formData.get("base_notes")))),
    Math.max(0, int(formData.get("price_2"))),
    Math.max(0, int(formData.get("price_5"))),
    Math.max(0, int(formData.get("price_8"))),
    Math.max(0, int(formData.get("price_30"))),
    Math.max(0, int(formData.get("stock"))),
    status,
    text(formData.get("badge")) || null,
    bool(formData.get("bestseller")),
    bool(formData.get("new_arrival")),
    bool(formData.get("featured")),
    Math.max(0, Math.min(5, Number(text(formData.get("rating")) || 4.5))),
    Math.max(0, int(formData.get("review_count"))),
    image,
    JSON.stringify(gallery),
    JSON.stringify(collections),
    type,
    JSON.stringify(bundleItems),
    Math.max(0, int(formData.get("cost_price"))),
    nowSql(),
  ];

  let productId = id;
  if (id) {
    db.prepare(
      `UPDATE products SET slug=?, sku=?, name=?, brand=?, gender=?, family=?, concentration=?, description=?, story=?,
        top_notes=?, heart_notes=?, base_notes=?, price_2=?, price_5=?, price_8=?, price_30=?, stock=?, status=?, badge=?,
        bestseller=?, new_arrival=?, featured=?, rating=?, review_count=?, image=?, gallery=?, collections=?, type=?,
        bundle_items=?, cost_price=?, updated_at=? WHERE id=?`,
    ).run(...values, id);
  } else {
    const result = db
      .prepare(
        `INSERT INTO products (slug, sku, name, brand, gender, family, concentration, description, story,
          top_notes, heart_notes, base_notes, price_2, price_5, price_8, price_30, stock, status, badge,
          bestseller, new_arrival, featured, rating, review_count, image, gallery, collections, type,
          bundle_items, cost_price, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(...values);
    productId = Number(result.lastInsertRowid);
  }

  refreshStorefront();
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function quickStockAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = int(formData.get("id"));
  const stock = Math.max(0, int(formData.get("stock")));
  if (!id) return;
  const db = getDb();
  const row = db.prepare("SELECT status FROM products WHERE id = ?").get(id) as { status: ProductStatus } | undefined;
  if (!row) return;
  let status = row.status;
  if (["in_stock", "low_stock", "out_of_stock"].includes(status)) {
    status = stock <= 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock";
  }
  db.prepare("UPDATE products SET stock = ?, status = ?, updated_at = ? WHERE id = ?").run(stock, status, nowSql(), id);
  refreshStorefront();
}

export async function quickStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = int(formData.get("id"));
  const status = text(formData.get("status")) as ProductStatus;
  if (!id || !PRODUCT_STATUSES.includes(status)) return;
  getDb().prepare("UPDATE products SET status = ?, updated_at = ? WHERE id = ?").run(status, nowSql(), id);
  refreshStorefront();
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = int(formData.get("id"));
  if (!id) return;
  getDb().prepare("UPDATE products SET status = 'discontinued', updated_at = ? WHERE id = ?").run(nowSql(), id);
  refreshStorefront();
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = int(formData.get("id"));
  if (!id) return;
  const db = getDb();
  db.prepare("DELETE FROM wishlist WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM reviews WHERE product_id = ?").run(id);
  db.prepare("UPDATE order_items SET product_id = NULL WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  refreshStorefront();
  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}

export async function updateOrderAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const orderNumber = text(formData.get("order_number"));
  if (!orderNumber) return { error: "Order not found." };

  const db = getDb();
  const current = db.prepare("SELECT id, status, total, amount_collected FROM orders WHERE order_number = ?").get(orderNumber) as
    | { id: number; status: string; total: number; amount_collected: number }
    | undefined;
  if (!current) return { error: "Order not found." };

  const nextStatus = text(formData.get("status")) || current.status;
  const paymentStatus = text(formData.get("payment_status"));
  const paymentMethod = text(formData.get("payment_method"));
  const courier = text(formData.get("courier"));
  const tracking = text(formData.get("tracking_number"));
  const rider = text(formData.get("rider"));
  const amount = Math.max(0, int(formData.get("amount_collected"), Number(current.amount_collected)));
  const note = text(formData.get("note"));
  const collectedAt = amount > 0 ? nowSql() : null;

  db.prepare(
    `UPDATE orders SET status = ?, payment_status = ?, payment_method = ?, courier = ?, tracking_number = ?, rider = ?,
      amount_collected = ?, collected_at = COALESCE(?, collected_at), notes = CASE WHEN ? = '' THEN notes ELSE ? END,
      updated_at = ? WHERE id = ?`,
  ).run(
    nextStatus,
    paymentStatus || "unpaid",
    paymentMethod || "mpesa",
    courier || null,
    tracking || null,
    rider || null,
    amount,
    collectedAt,
    note,
    note,
    nowSql(),
    current.id,
  );

  if (nextStatus !== current.status || note) {
    const statusLabel = nextStatus.replace(/_/g, " ");
    db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, ?, ?, ?)").run(
      current.id,
      nextStatus,
      note || `Status updated to ${statusLabel}.`,
      admin.name,
    );
  }

  if (["cancelled", "returned"].includes(nextStatus) && !["cancelled", "returned"].includes(current.status)) {
    const items = db.prepare("SELECT product_id, qty FROM order_items WHERE order_id = ? AND product_id IS NOT NULL").all(current.id) as {
      product_id: number;
      qty: number;
    }[];
    const restock = db.prepare(
      "UPDATE products SET stock = stock + ?, status = CASE WHEN status = 'out_of_stock' THEN 'in_stock' ELSE status END, updated_at = ? WHERE id = ? AND type = 'perfume'",
    );
    for (const item of items) restock.run(item.qty, nowSql(), item.product_id);
    db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, ?, 'Stock returned to inventory.', ?)").run(
      current.id,
      nextStatus,
      admin.name,
    );
  }

  refreshStorefront();
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
  return { success: "Order updated and the customer timeline has been refreshed." };
}

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const orderNumber = text(formData.get("order_number"));
  const status = text(formData.get("status"));
  if (!orderNumber || !status) return;
  const valid = ["pending", "confirmed", "packing", "ready", "out_for_delivery", "delivered", "on_hold", "cancelled", "returned"];
  if (!valid.includes(status)) return;

  const db = getDb();
  const current = db.prepare("SELECT id, status FROM orders WHERE order_number = ?").get(orderNumber) as { id: number; status: string } | undefined;
  if (!current) return;
  db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, nowSql(), current.id);
  db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, ?, ?, ?)").run(
    current.id,
    status,
    `Status moved to ${status.replace(/_/g, " ")}.`,
    admin.name,
  );
  if (["cancelled", "returned"].includes(status) && !["cancelled", "returned"].includes(current.status)) {
    const items = db.prepare("SELECT product_id, qty FROM order_items WHERE order_id = ? AND product_id IS NOT NULL").all(current.id) as {
      product_id: number;
      qty: number;
    }[];
    const restock = db.prepare(
      "UPDATE products SET stock = stock + ?, status = CASE WHEN status = 'out_of_stock' THEN 'in_stock' ELSE status END, updated_at = ? WHERE id = ? AND type = 'perfume'",
    );
    for (const item of items) restock.run(item.qty, nowSql(), item.product_id);
  }
  refreshStorefront();
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
}

export async function markPaymentCollectedAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const orderNumber = text(formData.get("order_number"));
  if (!orderNumber) return;
  const db = getDb();
  const order = db.prepare("SELECT id, total FROM orders WHERE order_number = ?").get(orderNumber) as { id: number; total: number } | undefined;
  if (!order) return;
  db.prepare("UPDATE orders SET payment_status = 'paid', amount_collected = ?, collected_at = ?, updated_at = ? WHERE id = ?").run(
    order.total,
    nowSql(),
    nowSql(),
    order.id,
  );
  db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, (SELECT status FROM orders WHERE id = ?), 'Payment collected and marked as paid.', ?)").run(
    order.id,
    order.id,
    admin.name,
  );
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
  revalidatePath("/", "layout");
}

export async function saveSettingsAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const storeName = text(formData.get("store_name"));
  const email = text(formData.get("email"));
  const phone = text(formData.get("phone"));
  const whatsappNumber = normalizePhoneNumber(text(formData.get("whatsapp_number")) || phone);
  const phoneDigits = normalizePhoneNumber(phone);

  if (!storeName) return { error: "Store name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid public email address, for example hello@yourdomain.com." };
  }
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    return { error: "Enter a valid phone number with country code, for example +254 712 345 678." };
  }
  if (whatsappNumber.length < 9 || whatsappNumber.length > 15) {
    return { error: "Enter a valid WhatsApp number with country code, for example +254 712 345 678." };
  }

  const entries: [string, string][] = [
    ["store_name", storeName],
    ["whatsapp_number", whatsappNumber],
    ["email", email],
    ["phone", phone],
    ["city", text(formData.get("city"))],
    ["free_delivery_threshold", String(Math.max(0, int(formData.get("free_delivery_threshold"))))],
    ["delivery_fee", String(Math.max(0, int(formData.get("delivery_fee"))))],
    ["announcement", text(formData.get("announcement"))],
    ["instagram", text(formData.get("instagram"))],
    ["tiktok", text(formData.get("tiktok"))],
    ["opening_hours", text(formData.get("opening_hours"))],
    ["returns_days", String(Math.max(0, int(formData.get("returns_days"), 30)))],
    ["membership_price", String(Math.max(0, int(formData.get("membership_price"), 1500)))],
  ];
  const db = getDb();
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  for (const [key, value] of entries) upsert.run(key, value);
  refreshStorefront();
  revalidatePath("/admin/settings");
  return { success: "Store settings saved. The storefront updates immediately." };
}

export async function saveCollectionAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = int(formData.get("id"));
  const title = text(formData.get("title"));
  if (!title) return { error: "Collection title is required." };
  const db = getDb();
  const rawSlug = text(formData.get("slug")) || slugify(title);
  let slug = rawSlug;
  let attempt = 2;
  while (true) {
    const existing = db.prepare("SELECT id FROM collections WHERE slug = ?").get(slug) as { id: number } | undefined;
    if (!existing || existing.id === id) break;
    slug = `${rawSlug}-${attempt}`;
    attempt += 1;
  }

  const values = [
    slug,
    title.slice(0, 120),
    text(formData.get("subtitle")).slice(0, 160),
    text(formData.get("description")).slice(0, 1200),
    text(formData.get("image")) || "/images/editorial/hero.jpg",
    text(formData.get("theme")) || "#b9a17d",
    Math.max(0, int(formData.get("sort"))),
  ];

  if (id) {
    db.prepare("UPDATE collections SET slug=?, title=?, subtitle=?, description=?, image=?, theme=?, sort=? WHERE id=?").run(...values, id);
  } else {
    db.prepare("INSERT INTO collections (slug, title, subtitle, description, image, theme, sort) VALUES (?, ?, ?, ?, ?, ?, ?)").run(...values);
  }
  refreshStorefront();
  revalidatePath("/admin/collections");
  return { success: id ? "Collection updated." : "Collection created." };
}

export async function deleteCollectionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = int(formData.get("id"));
  if (!id) return;
  getDb().prepare("DELETE FROM collections WHERE id = ?").run(id);
  refreshStorefront();
  revalidatePath("/admin/collections");
}

export async function updateCustomerAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = int(formData.get("id"));
  if (!id) return { error: "Customer not found." };
  const tier = text(formData.get("membership_tier")) || "Guest";
  const phone = text(formData.get("phone"));
  const credit = Math.max(0, int(formData.get("store_credit")));
  const points = Math.max(0, int(formData.get("points")));
  getDb().prepare("UPDATE users SET membership_tier = ?, phone = ?, store_credit = ?, points = ? WHERE id = ? AND role = 'member'").run(
    tier.slice(0, 40),
    phone.slice(0, 40) || null,
    credit,
    points,
    id,
  );
  revalidatePath("/admin/customers");
  revalidatePath("/account", "layout");
  return { success: "Customer profile updated." };
}
