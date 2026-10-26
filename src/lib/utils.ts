import type { OrderStatus, Product, ProductVariant, ProductStatus } from "./types";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(value: number): string {
  return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

export function formatMoneyShort(value: number): string {
  if (value >= 1_000_000) return `KSh ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `KSh ${(value / 1000).toFixed(0)}k`;
  return formatMoney(value);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("en-KE", options ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string): string {
  return formatDate(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value: string): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value, { day: "numeric", month: "short" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function getVariants(product: Product): ProductVariant[] {
  if (product.type === "bundle") {
    return [{ key: "set", label: product.concentration || "Discovery set", price: product.price_30, ml: null, sprays: null }];
  }
  if (product.type === "atomizer") {
    return [{ key: "one-size", label: "One size", price: product.price_30, ml: 8, sprays: null }];
  }
  return [
    { key: "2ml", label: "2 ml", price: product.price_2, ml: 2, sprays: 30 },
    { key: "5ml", label: "5 ml", price: product.price_5, ml: 5, sprays: 75 },
    { key: "8ml", label: "8 ml", price: product.price_8, ml: 8, sprays: 120 },
    { key: "30ml", label: "30 ml", price: product.price_30, ml: 30, sprays: 450 },
  ].filter((variant) => variant.price > 0);
}

export function startingPrice(product: Product): number {
  const prices = getVariants(product).map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function isPurchasable(product: Product): boolean {
  return product.status === "in_stock" || product.status === "low_stock";
}

export function purchaseBlockReason(product: Product): string | null {
  if (product.status === "out_of_stock") return "Sold out — join the waitlist";
  if (product.status === "pending") return "Arriving soon";
  if (product.status === "held") return "Currently on hold";
  if (product.status === "discontinued") return "Discontinued";
  return null;
}

export function getProductOrderedCount(product: Product): string {
  const size = getVariants(product)[0];
  if (!size) return "";
  return product.type === "bundle" ? "A complete discovery set" : `From ${formatMoney(size.price)}`;
}

export function statusTone(status: ProductStatus): string {
  switch (status) {
    case "in_stock":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "low_stock":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "out_of_stock":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "pending":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "held":
      return "bg-violet-50 text-violet-800 border-violet-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

export function orderStatusTone(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "out_for_delivery":
    case "ready":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "packing":
    case "confirmed":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "pending":
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
    case "on_hold":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "cancelled":
    case "returned":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

export function paymentStatusTone(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "cod":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "refunded":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

export function normalizePhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9 && /^[17]/.test(digits)) return `254${digits}`;
  return digits;
}

export function phoneHref(value: string): string {
  const digits = normalizePhoneNumber(value);
  return digits ? `tel:+${digits}` : "tel:";
}

export function whatsappTarget(value: string): string {
  const digits = normalizePhoneNumber(value);
  if (digits) return digits;
  const handle = value.trim().replace(/^@/, "");
  return handle || "maison_du_scent";
}

export function whatsappLink(message: string, target: string): string {
  return `https://wa.me/${encodeURIComponent(whatsappTarget(target))}?text=${encodeURIComponent(message)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split("|")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}

export function parseNotes(value: string): string[] {
  return value
    .split(/[|,]/)
    .map((note) => note.trim())
    .filter(Boolean);
}

export function calculateDelivery(subtotal: number, threshold: number, fee: number): number {
  return subtotal >= threshold || subtotal === 0 ? 0 : fee;
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(digits).replace(/\.0$/, "")}%`;
}

export function orderProgress(status: OrderStatus): number {
  const steps: OrderStatus[] = ["pending", "confirmed", "packing", "ready", "out_for_delivery", "delivered"];
  if (status === "on_hold" || status === "cancelled" || status === "returned") return 0;
  const index = steps.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / steps.length) * 100;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
