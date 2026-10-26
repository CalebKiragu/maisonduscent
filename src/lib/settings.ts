import { getDb } from "./db";

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  city: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  announcement: string;
  instagram: string;
  tiktok: string;
  openingHours: string;
  returnsDays: number;
  membershipPrice: number;
}

const defaults: StoreSettings = {
  storeName: "Maison du Scent",
  whatsappNumber: "254700000001",
  email: "hello@maisonduscent.com",
  phone: "+254 700 000 001",
  city: "Mombasa",
  freeDeliveryThreshold: 5000,
  deliveryFee: 350,
  announcement: "Complimentary nationwide delivery on orders over KSh 5,000",
  instagram: "@maisonduscent",
  tiktok: "@maisonduscent",
  openingHours: "Monday – Friday · 9am – 6pm\nSaturday · 10am – 4pm\nSunday & public holidays · closed",
  returnsDays: 30,
  membershipPrice: 1500,
};

export function getSettings(): StoreSettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (key: string, fallback: number) => {
    const parsed = Number(map.get(key));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };
  return {
    storeName: map.get("store_name") ?? defaults.storeName,
    whatsappNumber: map.get("whatsapp_number") ?? map.get("phone") ?? defaults.whatsappNumber,
    email: map.get("email") ?? defaults.email,
    phone: map.get("phone") ?? defaults.phone,
    city: map.get("city") ?? defaults.city,
    freeDeliveryThreshold: num("free_delivery_threshold", defaults.freeDeliveryThreshold),
    deliveryFee: num("delivery_fee", defaults.deliveryFee),
    announcement: map.get("announcement") ?? defaults.announcement,
    instagram: map.get("instagram") ?? defaults.instagram,
    tiktok: map.get("tiktok") ?? defaults.tiktok,
    openingHours: map.get("opening_hours") ?? defaults.openingHours,
    returnsDays: num("returns_days", defaults.returnsDays),
    membershipPrice: num("membership_price", defaults.membershipPrice),
  };
}
