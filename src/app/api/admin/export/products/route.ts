import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts } from "@/lib/queries";

export const runtime = "nodejs";

function escape(value: unknown): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

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
] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const rows = getAllProducts("admin").map((product) =>
    columns
      .map((column) => {
        const value = product[column as keyof typeof product];
        if (Array.isArray(value)) return escape(value.join(" | "));
        if (typeof value === "boolean") return value ? "1" : "0";
        return escape(value);
      })
      .join(","),
  );

  const csv = [columns.join(","), ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="maison-products-${date}.csv"`,
    },
  });
}
