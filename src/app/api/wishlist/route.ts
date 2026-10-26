import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save favourites" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { productId?: number };
  const productId = Number(body.productId);
  if (!Number.isInteger(productId)) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?").get(user.id, productId) as
    | { id: number }
    | undefined;
  if (existing) {
    db.prepare("DELETE FROM wishlist WHERE id = ?").run(existing.id);
    return NextResponse.json({ saved: false });
  }
  db.prepare("INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)").run(user.id, productId);
  return NextResponse.json({ saved: true });
}
