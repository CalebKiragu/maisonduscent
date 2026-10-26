"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { trackEvent } from "./cart-provider";

export function WishlistButton({
  productId,
  initial = false,
  className = "",
  withLabel = false,
  refreshOnChange = false,
}: {
  productId: number;
  initial?: boolean;
  className?: string;
  withLabel?: boolean;
  refreshOnChange?: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(pathname)}`;
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
        trackEvent(data.saved ? "wishlist_add" : "wishlist_remove", { productId });
        if (refreshOnChange) router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`inline-flex items-center gap-2 transition ${className}`}
    >
      <Heart size={17} strokeWidth={1.4} className={saved ? "fill-wine text-wine" : ""} />
      {withLabel && <span className="text-[0.66rem] font-semibold uppercase tracking-[0.13em]">{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
