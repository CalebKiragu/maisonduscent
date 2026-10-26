export type ProductStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pending"
  | "held"
  | "discontinued";

export type ProductType = "perfume" | "bundle" | "atomizer" | "giftcard";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "on_hold"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "paid" | "cod" | "refunded";
export type PaymentMethod = "mpesa" | "card" | "cod" | "whatsapp";
export type Gender = "her" | "him" | "unisex";

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  gender: Gender;
  family: string;
  concentration: string;
  description: string;
  story: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  price_2: number;
  price_5: number;
  price_8: number;
  price_30: number;
  stock: number;
  status: ProductStatus;
  badge: string | null;
  bestseller: boolean;
  new_arrival: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  image: string;
  gallery: string[];
  collections: string[];
  type: ProductType;
  bundle_items: string[];
  cost_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  key: string;
  label: string;
  price: number;
  ml: number | null;
  sprays: number | null;
}

export interface Collection {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  theme: string;
  sort: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  phone: string | null;
  membership_tier: string;
  store_credit: number;
  points: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  brand: string;
  size: string;
  unit_price: number;
  qty: number;
  image: string;
}

export interface OrderEvent {
  id: number;
  order_id: number;
  status: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  courier: string | null;
  tracking_number: string | null;
  rider: string | null;
  amount_collected: number;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
}

export interface Review {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  phone: string;
  is_default: number;
}

export interface CartItem {
  key: string;
  productId: number;
  slug: string;
  name: string;
  brand: string;
  image: string;
  size: string;
  sizeKey: string;
  price: number;
  qty: number;
  kind: ProductType;
  bundle5?: boolean;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packing: "Packing",
  ready: "Ready for dispatch",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  on_hold: "On hold",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  pending: "Pending",
  held: "Held",
  discontinued: "Discontinued",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  cod: "Cash on delivery",
  refunded: "Refunded",
};

export const ORDER_PIPELINE: OrderStatus[] = [
  "pending",
  "confirmed",
  "packing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export const GENDER_LABELS: Record<Gender, string> = {
  her: "For Her",
  him: "For Him",
  unisex: "Unisex",
};
