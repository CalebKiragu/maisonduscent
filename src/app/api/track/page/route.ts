import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getProductBySlug } from "@/lib/queries";

export const runtime = "nodejs";

function inferSource(referrer: string | null, provided: string | null) {
  if (provided) return provided;
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "google";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("facebook")) return "facebook";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("wa.me") || host.includes("whatsapp")) return "whatsapp";
    if (host.includes("maisonduscent")) return "direct";
    return host;
  } catch {
    return "direct";
  }
}

function inferMedium(source: string, provided: string | null) {
  if (provided) return provided;
  if (source === "direct") return "none";
  if (source === "google") return "organic";
  if (["instagram", "facebook", "tiktok"].includes(source)) return "social";
  if (source === "whatsapp") return "social";
  return "referral";
}

function inferPageType(path: string): { type: string; slug: string | null } {
  if (path === "/") return { type: "home", slug: null };
  if (path.startsWith("/perfumes/") && path.split("/").length === 3) return { type: "product", slug: path.split("/")[2] };
  if (path.startsWith("/perfumes")) return { type: "category", slug: null };
  if (path.startsWith("/collections/")) return { type: "collection", slug: null };
  if (path.startsWith("/brands/")) return { type: "brand", slug: null };
  if (path.startsWith("/journal/")) return { type: "journal", slug: null };
  if (path.startsWith("/bundles")) return { type: "category", slug: null };
  if (path.startsWith("/find-my-scent")) return { type: "tool", slug: null };
  if (path.startsWith("/search")) return { type: "search", slug: null };
  if (path.startsWith("/checkout")) return { type: "checkout", slug: null };
  if (path.startsWith("/account")) return { type: "account", slug: null };
  return { type: "page", slug: null };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const path = String(body.path ?? "/").slice(0, 300);
    if (path.startsWith("/admin")) return new NextResponse(null, { status: 204 });

    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;
    const source = inferSource(referrer, body.source ? String(body.source) : null);
    const medium = inferMedium(source, body.medium ? String(body.medium) : null);
    const campaign = body.campaign ? String(body.campaign).slice(0, 100) : null;
    const sessionId = String(body.sessionId ?? `anon-${Date.now()}`).slice(0, 100);
    const device = ["mobile", "tablet", "desktop"].includes(String(body.device)) ? String(body.device) : "desktop";
    const { type, slug } = inferPageType(path);
    const product = slug ? getProductBySlug(slug) : null;

    getDb()
      .prepare(
        `INSERT INTO page_views (path, page_type, product_id, session_id, referrer, source, medium, campaign, device)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(path, type, product?.id ?? null, sessionId, referrer, source, medium, campaign, device);

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Unable to track" }, { status: 400 });
  }
}
