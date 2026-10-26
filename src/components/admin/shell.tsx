"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders" },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/products/import", label: "Import & export", icon: PackageSearch },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/collections", label: "Collections", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  userName,
  orderActionCount,
}: {
  children: React.ReactNode;
  userName: string;
  orderActionCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/products") return pathname.startsWith("/admin/products") && !pathname.startsWith("/admin/products/import");
    return pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-cream">
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <Link href="/admin" className="block">
          <p className="font-display text-xl leading-none">Maison du Scent</p>
          <p className="mt-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.24em] text-gold-soft">Operations</p>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="text-cream/60 lg:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const active = isActive(item.href);
          const badge = item.badgeKey === "orders" ? orderActionCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-[0.74rem] transition ${
                active ? "border-gold bg-cream/[0.07] text-cream" : "border-transparent text-cream/60 hover:bg-cream/[0.04] hover:text-cream"
              }`}
            >
              <item.icon size={16} strokeWidth={1.6} />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="min-w-5 rounded-full bg-wine px-1.5 py-0.5 text-center text-[0.56rem] font-semibold text-cream">{badge}</span>
              ) : null}
              {active ? <ChevronRight size={12} className="text-gold-soft" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-[0.7rem] text-cream/60 transition hover:text-cream">
          <ExternalLink size={14} /> View storefront
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-[0.72rem] text-cream">{userName}</p>
            <p className="text-[0.56rem] uppercase tracking-[0.12em] text-cream/40">Administrator</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" aria-label="Sign out" className="text-cream/50 transition hover:text-cream">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[17rem] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#e4ddd0] bg-[#fffdf9]/95 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="text-ink/70 lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <p className="hidden text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-stone sm:block">Maison operations</p>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/admin/orders?status=pending" className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-stone hover:text-ink">
              <span className="relative flex h-2 w-2">
                {orderActionCount ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wine opacity-60" /> : null}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${orderActionCount ? "bg-wine" : "bg-moss"}`} />
              </span>
              {orderActionCount ? `${orderActionCount} to action` : "All caught up"}
            </Link>
            <Link href="/" target="_blank" className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-stone hover:text-ink sm:block">
              Storefront
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
