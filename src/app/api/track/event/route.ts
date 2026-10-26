import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").slice(0, 80);
    if (!name) return NextResponse.json({ error: "Missing event name" }, { status: 400 });
    const path = String(body.path ?? "/").slice(0, 300);
    const sessionId = body.sessionId ? String(body.sessionId).slice(0, 100) : null;
    const metadata = body.metadata && typeof body.metadata === "object" ? JSON.stringify(body.metadata).slice(0, 2000) : "{}";
    getDb()
      .prepare("INSERT INTO events (name, path, session_id, metadata) VALUES (?, ?, ?, ?)")
      .run(name, path, sessionId, metadata);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Unable to track event" }, { status: 400 });
  }
}
