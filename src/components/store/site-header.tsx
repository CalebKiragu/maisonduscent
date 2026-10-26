"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { primaryNav, footerNav } from "@/lib/nav";
import { useCart } from "./cart-provider";
import { SearchDialog } from "./search-dialog";
import { formatMoney, whatsappLink } from "@/lib/utils";

export function SiteHeader({
  announcement,
  userName,
  loggedIn,
  freeDeliveryThreshold,
  whatsappNumber,
}: {
  announcement: string;
  userName?: string | null;
  loggedIn: boolean;
  freeDeliveryThreshold: number;
  whatsappNumber: string;
}) {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const accountHref = loggedIn ? "/account" : "/login";

  return (
    <>
      <header className="sticky top-0 z-[100]">
        <div className="bg-ink text-cream">
          <div className="shell flex h-8 items-center justify-between gap-4">
            <p className="hidden text-[0.55rem] uppercase tracking-[0.18em] text-cream/60 sm:block">Mombasa · Hand-decanted daily</p>
            <p className="mx-auto text-center text-[0.54rem] uppercase tracking-[0.16em] text-cream/90 sm:tracking-[0.2em]">{announcement}</p>
            <a
              href={whatsappLink("Hello Maison du Scent, I have a question.", whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="hidden text-[0.55rem] uppercase tracking-[0.16em] text-cream/60 transition hover:text-cream sm:block"
            >
              WhatsApp us
            </a>
          </div>
        </div>

        <div className={`border-b border-line bg-cream/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-[0_10px_30px_-24px_rgba(25,23,19,0.55)]" : ""}`}>
          <div className="shell flex h-[4.4rem] items-center justify-between gap-4 xl:h-[5rem]">
            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center text-ink"
              >
                <Menu size={21} strokeWidth={1.4} />
              </button>
            </div>

            <Logo className="shrink-0 xl:mr-2" />

            <nav className="hidden items-center gap-[1.35rem] xl:flex xl:gap-7" aria-label="Primary">
              {primaryNav.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <div key={item.label} className="group/nav relative">
                    <Link
                      href={item.href}
                      data-active={active}
                      className="link-underline flex items-center gap-1 py-6 text-[0.64rem] font-semibold uppercase tracking-[0.13em] text-ink-soft transition-colors hover:text-ink"
                    >
                      {item.label}
                      {item.groups && <ChevronDown size={10} className="mt-0.5 text-mist transition group-hover/nav:rotate-180" />}
                    </Link>
                    {item.groups && (
                      <div className="invisible absolute left-1/2 top-full w-[min(58rem,72vw)] -translate-x-1/2 translate-y-2 border border-line bg-parchment opacity-0 shadow-lift transition-all duration-200 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                        <div className="grid grid-cols-[1fr_1fr_1fr_0.9fr]">
                          <div className="col-span-3 grid grid-cols-3 gap-6 px-7 py-8">
                            {item.groups.map((group) => (
                              <div key={group.title}>
                                <p className="mb-3 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-stone">{group.title}</p>
                                <ul className="space-y-2.5">
                                  {group.links.map((link) => (
                                    <li key={link.href}>
                                      <Link href={link.href} className="text-[0.82rem] text-ink-soft transition hover:text-wine">
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          {item.feature && (
                            <Link href={item.feature.href} className="group/feature relative min-h-[16rem] overflow-hidden bg-cream-deep">
                              <Image src={item.feature.image} alt="" fill sizes="240px" className="object-cover transition duration-700 group-hover/feature:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                                <p className="text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-cream/70">{item.feature.eyebrow}</p>
                                <p className="mt-1 font-display text-xl leading-tight">{item.feature.title}</p>
                                <span className="mt-2 inline-flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.15em]">
                                  Discover <ArrowRight size={11} />
                                </span>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-0.5 sm:gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center text-ink transition hover:text-wine"
              >
                <Search size={18} strokeWidth={1.4} />
              </button>
              <Link
                href={accountHref}
                aria-label={loggedIn ? `Account — ${userName}` : "Sign in"}
                className="hidden h-9 w-9 items-center justify-center text-ink transition hover:text-wine sm:flex"
              >
                <User size={18} strokeWidth={1.4} />
              </Link>
              <Link
                href={loggedIn ? "/account/wishlist" : "/login?next=/account/wishlist"}
                aria-label="Wishlist"
                className="hidden h-9 w-9 items-center justify-center text-ink transition hover:text-wine sm:flex"
              >
                <Heart size={18} strokeWidth={1.4} />
              </Link>
              <button
                onClick={open}
                aria-label={`Shopping bag, ${count} item${count === 1 ? "" : "s"}`}
                className="relative flex h-9 w-9 items-center justify-center text-ink transition hover:text-wine"
              >
                <ShoppingBag size={18} strokeWidth={1.4} />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-wine px-1 text-[0.55rem] font-semibold text-cream">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className={`fixed inset-0 z-[140] xl:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-cream transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo compact />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1 text-stone">
              <X size={20} />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
            {primaryNav.map((item) => (
              <div key={item.label} className="border-b border-line/70">
                <div className="flex items-center justify-between">
                  <Link href={item.href} className="flex-1 py-3.5 font-display text-[1.45rem]">
                    {item.label}
                  </Link>
                  {item.groups && (
                    <button
                      onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                      aria-label={`Expand ${item.label}`}
                      className="p-2 text-stone"
                    >
                      <ChevronDown size={16} className={`transition ${expanded === item.label ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                {item.groups && expanded === item.label && (
                  <div className="animate-fade-in space-y-4 pb-4">
                    {item.groups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-1.5 text-[0.52rem] font-semibold uppercase tracking-[0.17em] text-stone">{group.title}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {group.links.map((link) => (
                            <Link key={link.href} href={link.href} className="text-[0.8rem] text-ink-soft">
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6 space-y-2">
              <Link href={loggedIn ? "/account" : "/login"} className="btn btn-outline w-full">
                {loggedIn ? `My account${userName ? ` · ${userName.split(" ")[0]}` : ""}` : "Sign in / Create account"}
              </Link>
              <Link href="/find-my-scent" className="btn btn-wine w-full">
                Find my scent
              </Link>
            </div>
          </div>
          <div className="border-t border-line px-5 py-4">
            <div className="flex items-center justify-between text-[0.62rem] text-stone">
              <a href={whatsappLink("Hello Maison du Scent, I have a question.", whatsappNumber)} target="_blank" rel="noreferrer" className="link-underline">
                WhatsApp
              </a>
              <span>{formatMoney(freeDeliveryThreshold)} · free delivery</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
