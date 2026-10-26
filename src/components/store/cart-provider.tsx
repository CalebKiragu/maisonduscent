"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  lastAdded: string | null;
  add: (item: CartItem, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mds_cart_v1";

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.productId === "number" && typeof item.price === "number");
  } catch {
    return [];
  }
}

function track(name: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ name, path: window.location.pathname, metadata });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track/event", new Blob([payload], { type: "application/json" }));
    return;
  }
  void fetch("/api/track/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: CartItem, qty = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.key === item.key);
      if (existing) {
        return current.map((i) => (i.key === item.key ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
      }
      return [...current, { ...item, qty }];
    });
    setLastAdded(item.key);
    setIsOpen(true);
    track("add_to_cart", { product: item.slug, size: item.size, price: item.price, qty });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLastAdded(null), 2500);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((i) => i.key !== key)
        : current.map((i) => (i.key === key ? { ...i, qty: Math.min(99, qty) } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    return { items, count, subtotal, ready, isOpen, lastAdded, add, remove, setQty, clear, open, close };
  }, [items, ready, isOpen, lastAdded, add, remove, setQty, clear, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export function trackEvent(name: string, metadata: Record<string, unknown> = {}) {
  track(name, metadata);
}
