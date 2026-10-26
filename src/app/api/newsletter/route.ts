import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const existing = getDb().prepare("SELECT id FROM subscribers WHERE email = ?").get(email);
  getDb().prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email);
  return NextResponse.json({
    message: existing ? "You're already on the list." : "Welcome to the maison. Check your inbox.",
  });
}
