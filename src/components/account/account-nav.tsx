"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, MapPin, Package, Settings } from "lucide-react";

const items = [
  { href: "/account", label: "Overview", icon: Home },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col lg:gap-0">
      {items.map((item) => {
        const active = item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 border-b-2 px-3 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.13em] transition lg:border-b-0 lg:border-l-2 lg:px-4 ${
              active
                ? "border-wine text-wine lg:bg-parchment"
                : "border-transparent text-stone hover:border-mist hover:text-ink"
            }`}
          >
            <item.icon size={15} strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
