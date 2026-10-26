"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/utils";
import { trackEvent } from "./cart-provider";

export function WhatsAppFloat({ phone }: { phone: string }) {
  const pathname = usePathname();
  const message = `Hello Maison du Scent, I would love some help choosing a scent while browsing ${pathname}.`;

  return (
    <a
      href={whatsappLink(message, phone)}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("whatsapp_click", { placement: "float", path: pathname })}
      aria-label="Chat with Maison du Scent on WhatsApp"
      className="group fixed bottom-5 right-5 z-[90] flex items-center gap-2.5 rounded-full bg-[#1f7a53] py-3 pl-3.5 pr-4 text-cream shadow-[0_14px_35px_-12px_rgba(31,122,83,0.7)] transition hover:bg-[#186244] sm:bottom-7 sm:right-7"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-cream/25" />
        <MessageCircle size={18} strokeWidth={1.8} />
      </span>
      <span className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.13em] sm:block">Chat with us</span>
    </a>
  );
}
