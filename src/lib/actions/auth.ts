"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, getCurrentUser, loginUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isPreview } from "@/lib/preview";

export interface AuthState {
  error?: string;
}

function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData.get("email"));
  const password = text(formData.get("password"));
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await loginUser(email, password);
  if (!user) return { error: "That email and password don't match. Please try again." };

  const fallback = user.role === "admin" ? "/admin" : "/account";
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), fallback));
}

export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (isPreview()) return { error: "Admin access is disabled on the public preview." };

  const email = text(formData.get("email"));
  const password = text(formData.get("password"));
  if (!email || !password) return { error: "Enter your email and password." };

  const row = getDb()
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email) as Record<string, unknown> | undefined;
  if (!row || String(row.role) !== "admin" || !verifyPassword(password, String(row.password_hash))) {
    return { error: "These details don't match an administrator account." };
  }

  await createSession(Number(row.id));
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), "/admin"));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const password = text(formData.get("password"));
  const confirm = text(formData.get("confirm"));

  if (!name || !email || !password) return { error: "Please fill in your name, email and password." };
  if (!email.includes("@") || email.length < 6) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Choose a password with at least 8 characters." };
  if (password !== confirm) return { error: "Your passwords don't match." };

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email);
  if (existing) return { error: "An account with that email already exists. Sign in instead." };

  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role, phone, membership_tier, store_credit, points) VALUES (?, ?, ?, 'member', ?, 'Guest', 0, 0)",
    )
    .run(name.slice(0, 120), email.slice(0, 200), hashPassword(password), phone.slice(0, 40) || null);

  await createSession(Number(result.lastInsertRowid));
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), "/account"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function currentUserOrRedirect(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
