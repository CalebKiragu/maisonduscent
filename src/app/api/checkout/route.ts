import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, nowSql } from "@/lib/db";
import { getProductById } from "@/lib/queries";
import { getVariants } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import type { PaymentMethod } from "@/lib/types";

export const runtime = "nodejs";

interface IncomingItem {
  productId: number;
  sizeKey: string;
  qty: number;
}

const PAYMENT_METHODS: PaymentMethod[] = ["mpesa", "card", "cod", "whatsapp"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: IncomingItem[];
      customer?: Record<string, string>;
      paymentMethod?: string;
      attribution?: Record<string, string | null>;
    };
    const incoming = (body.items ?? []).slice(0, 30);
    if (!incoming.length) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });

    const customer = body.customer ?? {};
    const name = String(customer.name ?? "").trim().slice(0, 120);
    const email = String(customer.email ?? "").trim().slice(0, 200);
    const phone = String(customer.phone ?? "").trim().slice(0, 40);
    const address = String(customer.address ?? "").trim().slice(0, 300);
    const city = String(customer.city ?? "").trim().slice(0, 100);
    const notes = String(customer.notes ?? "").trim().slice(0, 1000);
    if (!name || !email.includes("@") || !phone || !address || !city) {
      return NextResponse.json({ error: "Please complete your contact and delivery details." }, { status: 400 });
    }

    const paymentMethod: PaymentMethod = PAYMENT_METHODS.includes(body.paymentMethod as PaymentMethod)
      ? (body.paymentMethod as PaymentMethod)
      : "mpesa";

    const user = await getCurrentUser();
    const settings = getSettings();
    const db = getDb();

    const priced = [];
    for (const item of incoming) {
      const product = getProductById(Number(item.productId));
      if (!product) return NextResponse.json({ error: "One of the products in your bag is no longer available." }, { status: 400 });
      if (["out_of_stock", "pending", "held", "discontinued"].includes(product.status)) {
        return NextResponse.json({ error: `${product.name} is currently unavailable. Please remove it from your bag.` }, { status: 400 });
      }
      const variant = getVariants(product).find((v) => v.key === item.sizeKey);
      if (!variant) return NextResponse.json({ error: `The selected size for ${product.name} is unavailable.` }, { status: 400 });
      const qty = Math.max(1, Math.min(20, Number(item.qty) || 1));
      priced.push({ product, variant, qty });
    }

    const subtotal = priced.reduce((sum, item) => sum + item.variant.price * item.qty, 0);
    const member = user?.membership_tier === "Circle" || user?.membership_tier === "Maison+";
    const discount = member ? Math.round(subtotal * 0.1) : 0;
    const deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    const total = subtotal - discount + deliveryFee;

    const maxId = db.prepare("SELECT COALESCE(MAX(id), 0) AS m FROM orders").get() as { m: number };
    const orderNumber = `MDS-${10001 + Number(maxId.m)}`;

    db.exec("BEGIN");
    try {
      const result = db
        .prepare(
          `INSERT INTO orders (
            order_number, user_id, customer_name, email, phone, address, city, notes,
            subtotal, delivery_fee, discount, total, payment_method, payment_status, status,
            source, medium, campaign, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
        )
        .run(
          orderNumber,
          user?.id ?? null,
          name,
          email,
          phone,
          address,
          city,
          notes,
          subtotal,
          deliveryFee,
          discount,
          total,
          paymentMethod,
          paymentMethod === "cod" ? "cod" : "unpaid",
          body.attribution?.source ?? "direct",
          body.attribution?.medium ?? "none",
          body.attribution?.campaign ?? null,
          nowSql(),
          nowSql(),
        );
      const orderId = Number(result.lastInsertRowid);

      const insertItem = db.prepare(
        "INSERT INTO order_items (order_id, product_id, name, brand, size, unit_price, qty, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );
      const updateStock = db.prepare(
        `UPDATE products SET stock = MAX(0, stock - ?),
         status = CASE
           WHEN stock - ? <= 0 THEN 'out_of_stock'
           WHEN stock - ? <= 5 AND status = 'in_stock' THEN 'low_stock'
           ELSE status END,
         updated_at = ? WHERE id = ?`,
      );
      for (const item of priced) {
        insertItem.run(orderId, item.product.id, item.product.name, item.product.brand, item.variant.label, item.variant.price, item.qty, item.product.image);
        if (item.product.type === "perfume") {
          updateStock.run(item.qty, item.qty, item.qty, nowSql(), item.product.id);
        }
      }

      db.prepare(
        "INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, 'pending', 'Order placed online. Awaiting confirmation.', 'Website')",
      ).run(orderId);
      if (user) {
        db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(Math.floor(total / 100), user.id);
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }

    return NextResponse.json({ orderNumber });
  } catch {
    return NextResponse.json({ error: "We could not place your order. Please try again or message us on WhatsApp." }, { status: 500 });
  }
}
