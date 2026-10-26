"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSettings } from "@/lib/settings";

export interface FormState {
  error?: string;
  success?: string;
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function refreshAccount() {
  revalidatePath("/account", "layout");
  revalidatePath("/", "layout");
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const name = text(formData.get("name"));
  const phone = text(formData.get("phone"));
  if (!name) return { error: "Please enter your name." };
  if (phone && !/^[+\d][\d\s()-]{6,24}$/.test(phone)) return { error: "Enter a valid phone number." };

  getDb().prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(name.slice(0, 120), phone.slice(0, 40) || null, user.id);
  refreshAccount();
  return { success: "Your details have been updated." };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const current = text(formData.get("current"));
  const next = text(formData.get("password"));
  const confirm = text(formData.get("confirm"));
  if (!current || !next || !confirm) return { error: "Complete all three password fields." };
  if (next.length < 8) return { error: "Your new password needs at least 8 characters." };
  if (next !== confirm) return { error: "Your new passwords don't match." };

  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(current, row.password_hash)) return { error: "Your current password is incorrect." };

  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), user.id);
  return { success: "Password changed. Use it next time you sign in." };
}

export async function addAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please sign in again." };

  const label = text(formData.get("label")) || "Home";
  const line1 = text(formData.get("line1"));
  const line2 = text(formData.get("line2"));
  const city = text(formData.get("city")) || "Mombasa";
  const phone = text(formData.get("phone"));
  if (!line1 || !phone) return { error: "A street address and phone number are required." };

  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) c FROM addresses WHERE user_id = ?").get(user.id) as { c: number };
  const makeDefault = Number(count.c) === 0 || formData.get("is_default") === "on";
  if (makeDefault) db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(user.id);
  db.prepare("INSERT INTO addresses (user_id, label, line1, line2, city, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    user.id,
    label.slice(0, 40),
    line1.slice(0, 200),
    line2.slice(0, 200) || null,
    city.slice(0, 80),
    phone.slice(0, 40),
    makeDefault ? 1 : 0,
  );

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: "Address saved." };
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  getDb().prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function makeDefaultAddressAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const db = getDb();
  const owned = db.prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!owned) return;
  db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(user.id);
  db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ?").run(id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function removeWishlistAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const productId = Number(formData.get("productId"));
  if (!Number.isInteger(productId)) return;
  getDb().prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?").run(user.id, productId);
  revalidatePath("/account/wishlist");
}

export async function cancelOrderAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const orderNumber = text(formData.get("orderNumber"));
  if (!orderNumber) return;

  const db = getDb();
  const order = db
    .prepare("SELECT id, status, user_id, email FROM orders WHERE order_number = ?")
    .get(orderNumber) as { id: number; status: string; user_id: number | null; email: string } | undefined;
  if (!order) return;
  if (order.user_id !== user.id && order.email.toLowerCase() !== user.email.toLowerCase()) return;
  if (!["pending", "confirmed"].includes(order.status)) return;

  db.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(order.id);
  db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, 'cancelled', 'Cancelled by customer from account dashboard.', ?)").run(
    order.id,
    user.name,
  );

  const items = db
    .prepare("SELECT product_id, qty FROM order_items WHERE order_id = ? AND product_id IS NOT NULL")
    .all(order.id) as { product_id: number; qty: number }[];
  if (items.length) {
    const restock = db.prepare(
      "UPDATE products SET stock = stock + ?, status = CASE WHEN status = 'out_of_stock' THEN 'in_stock' ELSE status END, updated_at = datetime('now') WHERE id = ? AND type = 'perfume'",
    );
    for (const item of items) restock.run(item.qty, item.product_id);
    db.prepare("INSERT INTO order_events (order_id, status, note, created_by) VALUES (?, 'cancelled', 'Stock returned to inventory.', ?)").run(
      order.id,
      user.name,
    );
  }

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderNumber}`);
  revalidatePath("/", "layout");
  redirect(`/account/orders/${orderNumber}`);
}

export async function upgradeMembershipAction(): Promise<void> {
  const user = await requireUser();
  if (user.membership_tier === "Maison+" || user.membership_tier === "Circle") redirect("/account/settings?upgrade=active");

  const settings = getSettings();
  const db = getDb();
  db.prepare(
    "UPDATE users SET membership_tier = 'Maison+', store_credit = MAX(0, store_credit - ?), points = points + 500 WHERE id = ?",
  ).run(settings.membershipPrice, user.id);

  revalidatePath("/account", "layout");
  revalidatePath("/membership");
  redirect("/account/settings?upgrade=done");
}
