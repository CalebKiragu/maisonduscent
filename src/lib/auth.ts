import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { getDb, nowSql } from "./db";
import { verifyPassword } from "./password";
import { isPreview } from "./preview";
import type { User } from "./types";

const SESSION_COOKIE = "mds_session";
const SESSION_DAYS = 30;

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role === "admin" ? "admin" : "member",
    phone: row.phone ? String(row.phone) : null,
    membership_tier: String(row.membership_tier ?? "Guest"),
    store_credit: Number(row.store_credit ?? 0),
    points: Number(row.points ?? 0),
    created_at: String(row.created_at),
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, nowSql()) as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapUser(row);
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, nowSql(expires));
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  store.delete(SESSION_COOKIE);
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email.trim()) as Record<string, unknown> | undefined;
  if (!row) return null;
  if (!verifyPassword(password, String(row.password_hash))) return null;
  await createSession(Number(row.id));
  return mapUser(row);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return user;
}

export async function requireAdmin(): Promise<User> {
  if (isPreview()) redirect("/");
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/admin/login");
  return user;
}
