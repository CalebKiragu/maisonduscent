import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const subject = String(body.subject ?? "General").trim().slice(0, 120);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  if (!name || !email.includes("@") || !message) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  getDb()
    .prepare("INSERT INTO events (name, path, session_id, metadata) VALUES ('contact_message', '/contact', NULL, ?)")
    .run(JSON.stringify({ name, email, subject, message }));
  return NextResponse.json({ message: "Thank you for writing to us." });
}
