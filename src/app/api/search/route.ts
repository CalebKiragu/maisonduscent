import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").slice(0, 120);
  const limit = Math.min(24, Math.max(1, Number(url.searchParams.get("limit") ?? 8)));
  const products = searchProducts(query, limit);
  return NextResponse.json({ products });
}
