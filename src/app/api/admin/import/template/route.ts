import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const columns = [
  "sku",
  "name",
  "brand",
  "type",
  "gender",
  "family",
  "concentration",
  "description",
  "story",
  "top_notes",
  "heart_notes",
  "base_notes",
  "price_2",
  "price_5",
  "price_8",
  "price_30",
  "cost_price",
  "stock",
  "status",
  "badge",
  "bestseller",
  "new_arrival",
  "featured",
  "image",
  "gallery",
  "collections",
  "bundle_items",
  "rating",
  "review_count",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  return new NextResponse(columns.join(",") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="maison-product-import-template.csv"',
    },
  });
}
