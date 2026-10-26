import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getDb, nowSql } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { ProductStatus, ProductType } from "@/lib/types";

export const runtime = "nodejs";

const STRING_FIELDS = ["name", "brand", "family", "concentration", "description", "story", "badge", "image"] as const;
const NUMBER_FIELDS = ["price_2", "price_5", "price_8", "price_30", "cost_price", "stock", "rating", "review_count"] as const;
const BOOL_FIELDS = ["bestseller", "new_arrival", "featured"] as const;
const LIST_FIELDS = ["top_notes", "heart_notes", "base_notes", "gallery", "collections", "bundle_items"] as const;
const STATUSES: ProductStatus[] = ["in_stock", "low_stock", "out_of_stock", "pending", "held", "discontinued"];
const TYPES: ProductType[] = ["perfume", "bundle", "atomizer", "giftcard"];
const GENDERS = ["her", "him", "unisex"];

function key(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function asText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

function asNumber(value: unknown): number {
  const parsed = Number(asText(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asBool(value: unknown): number {
  return ["1", "true", "yes", "y", "on", "x"].includes(asText(value).toLowerCase()) ? 1 : 0;
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => asText(item)).filter(Boolean);
  return asText(value)
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a CSV or spreadsheet file." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Files must be 12 MB or smaller." }, { status: 400 });

  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error("empty");
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } catch {
    return NextResponse.json({ error: "We couldn't read that file. Upload a .csv, .xlsx or .xls file with headers in the first row." }, { status: 400 });
  }

  if (!rows.length) return NextResponse.json({ error: "The file has no data rows." }, { status: 400 });
  if (rows.length > 2000) return NextResponse.json({ error: "Import up to 2,000 products at a time." }, { status: 400 });

  const db = getDb();
  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let updated = 0;

  const normalise = (row: Record<string, unknown>) => {
    const map = new Map<string, unknown>();
    for (const [rawKey, value] of Object.entries(row)) map.set(key(rawKey), value);
    return map;
  };

  const slugExists = (slug: string, ignoreId: number) => {
    const row = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug) as { id: number } | undefined;
    return row && row.id !== ignoreId ? row : undefined;
  };

  const uniqueSlug = (base: string, ignoreId = 0) => {
    let slug = base || `product-${Date.now().toString(36)}`;
    let attempt = 2;
    while (slugExists(slug, ignoreId)) {
      slug = `${base}-${attempt}`;
      attempt += 1;
    }
    return slug;
  };

  rows.forEach((rawRow, index) => {
    const row = normalise(rawRow);
    const rowNumber = index + 2;
    const name = asText(row.get("name"));
    const brand = asText(row.get("brand"));
    const providedSku = asText(row.get("sku"));

    const existingBySku = providedSku
      ? (db.prepare("SELECT * FROM products WHERE sku = ?").get(providedSku) as Record<string, unknown> | undefined)
      : undefined;
    const candidateSlug = slugify(`${name} ${brand}`);
    const existingBySlug = !existingBySku && name && brand
      ? (db.prepare("SELECT * FROM products WHERE slug = ?").get(candidateSlug) as Record<string, unknown> | undefined)
      : undefined;
    const existing = existingBySku ?? existingBySlug;

    if (!existing && (!name || !brand)) {
      errors.push({ row: rowNumber, message: "New products need both a name and a brand." });
      return;
    }

    if (existing && !name && !brand && !providedSku) {
      errors.push({ row: rowNumber, message: "Could not identify the product to update." });
      return;
    }

    const updates = new Map<string, string | number | null>();

    for (const field of STRING_FIELDS) {
      if (row.has(field)) {
        const value = asText(row.get(field));
        if (field === "name" || field === "brand") {
          if (value) updates.set(field, value.slice(0, field === "name" ? 140 : 90));
        } else if (field === "badge") {
          updates.set(field, value ? value.slice(0, 60) : null);
        } else if (field === "image") {
          updates.set(field, value || "/images/products/p01.jpg");
        } else {
          updates.set(field, value);
        }
      }
    }

    if (row.has("type")) {
      const value = asText(row.get("type")) as ProductType;
      updates.set("type", TYPES.includes(value) ? value : "perfume");
    }
    if (row.has("gender")) {
      const value = asText(row.get("gender"));
      updates.set("gender", GENDERS.includes(value) ? value : "unisex");
    }
    if (row.has("status")) {
      const value = asText(row.get("status")) as ProductStatus;
      if (STATUSES.includes(value)) updates.set("status", value);
    }
    for (const field of NUMBER_FIELDS) {
      if (row.has(field)) {
        let value = Math.max(0, asNumber(row.get(field)));
        if (field === "rating") value = Math.min(5, value);
        updates.set(field, value);
      }
    }
    for (const field of BOOL_FIELDS) {
      if (row.has(field)) updates.set(field, asBool(row.get(field)));
    }
    for (const field of LIST_FIELDS) {
      if (row.has(field)) {
        const list = field === "collections" || field === "bundle_items"
          ? asList(row.get(field)).map((item) => slugify(item))
          : asList(row.get(field));
        updates.set(field, JSON.stringify(list));
      }
    }

    try {
      if (existing) {
        if (!updates.size) return;
        updates.set("updated_at", nowSql());
        const set = Array.from(updates.keys()).map((field) => `${field} = ?`).join(", ");
        db.prepare(`UPDATE products SET ${set} WHERE id = ?`).run(...Array.from(updates.values()), Number(existing.id));
        updated += 1;
      } else {
        const finalSku = providedSku || `MDS-${Date.now().toString(36).toUpperCase()}-${index + 1}`;
        const skuOwner = db.prepare("SELECT id FROM products WHERE sku = ?").get(finalSku);
        if (skuOwner) {
          errors.push({ row: rowNumber, message: `SKU ${finalSku} is already used by another product.` });
          return;
        }
        const slug = uniqueSlug(candidateSlug);
        const values: Record<string, string | number | null> = {
          slug,
          sku: finalSku,
          name: name.slice(0, 140),
          brand: brand.slice(0, 90),
          gender: "unisex",
          family: "Woody",
          concentration: "Eau de Parfum",
          description: "",
          story: "",
          top_notes: "[]",
          heart_notes: "[]",
          base_notes: "[]",
          price_2: 0,
          price_5: 0,
          price_8: 0,
          price_30: 0,
          stock: 0,
          status: "in_stock",
          badge: null,
          bestseller: 0,
          new_arrival: 0,
          featured: 0,
          rating: 4.5,
          review_count: 0,
          image: "/images/products/p01.jpg",
          gallery: "[]",
          collections: "[]",
          type: "perfume",
          bundle_items: "[]",
          cost_price: 0,
          updated_at: nowSql(),
        };
        for (const [field, value] of updates) values[field] = value;
        const columns = Object.keys(values);
        db.prepare(`INSERT INTO products (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).run(...Object.values(values));
        created += 1;
      }
    } catch {
      errors.push({ row: rowNumber, message: "Could not save this row — check the values and try again." });
    }
  });

  revalidatePath("/", "layout");
  return NextResponse.json({ created, updated, skipped: rows.length - created - updated - errors.length, errors: errors.slice(0, 25), total: rows.length });
}
