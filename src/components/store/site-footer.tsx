import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { footerNav } from "@/lib/nav";
import { formatMoney, phoneHref, whatsappLink } from "@/lib/utils";
import type { StoreSettings } from "@/lib/settings";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  const instagramUrl = settings.instagram.startsWith("http")
    ? settings.instagram
    : `https://instagram.com/${settings.instagram.replace(/^@/, "")}`;

  return (
    <footer className="mt-20 bg-ink text-cream/80">
      <div className="shell">
        <div className="grid gap-12 border-b border-cream/10 py-14 lg:grid-cols-[1.15fr_2fr] lg:gap-20">
          <div>
            <div className="text-cream">
              <Logo tone="light" />
            </div>
            <p className="mt-5 max-w-sm text-[0.84rem] leading-relaxed text-cream/60">
              Authentic designer and niche fragrances, hand-decanted in Mombasa. Try before you commit — then wear the ones that feel like you.
            </p>
            <div className="mt-6 space-y-2 text-[0.78rem] text-cream/60">
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 transition hover:text-cream">
                <Mail size={13} strokeWidth={1.4} /> {settings.email}
              </a>
              <a href={phoneHref(settings.phone)} className="flex items-center gap-2.5 transition hover:text-cream">
                <Phone size={13} strokeWidth={1.4} /> {settings.phone}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin size={13} strokeWidth={1.4} /> {settings.city}, Kenya
              </p>
              <a
                href={whatsappLink("Hello Maison du Scent, I have a question.", settings.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 transition hover:text-cream"
              >
                <MessageCircle size={13} strokeWidth={1.4} /> WhatsApp the maison
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.25fr]">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-gold-soft">{group.title}</p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link href={link.href} className="text-[0.78rem] text-cream/60 transition hover:text-cream">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="mb-4 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-gold-soft">The list</p>
              <p className="text-[0.8rem] leading-relaxed text-cream/60">
                New arrivals, private sales and scent notes. No noise.
              </p>
              <NewsletterForm variant="footer" />
              <div className="mt-6 flex gap-3">
                <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center border border-cream/20 text-cream/70 transition hover:border-cream hover:text-cream">
                  <Instagram size={14} />
                </a>
                <a href={whatsappLink("Hello Maison du Scent!", settings.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-8 w-8 items-center justify-center border border-cream/20 text-cream/70 transition hover:border-cream hover:text-cream">
                  <MessageCircle size={14} />
                </a>
                <a href={`mailto:${settings.email}`} aria-label="Email" className="flex h-8 w-8 items-center justify-center border border-cream/20 text-cream/70 transition hover:border-cream hover:text-cream">
                  <Mail size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-[0.62rem] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Maison du Scent. Hand-decanted in Mombasa, Kenya.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Free delivery over {formatMoney(settings.freeDeliveryThreshold)}</span>
            <span>M-PESA · Visa · Mastercard</span>
            <Link href="/privacy" className="transition hover:text-cream">Privacy</Link>
            <Link href="/terms" className="transition hover:text-cream">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
