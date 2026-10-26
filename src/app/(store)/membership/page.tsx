import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Gift, Sparkles, Star, Truck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { formatMoney, whatsappLink } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Maison+ membership",
  description: "Member pricing, early access, free delivery and a birthday scent. Join the Maison du Scent membership from KSh 1,500 a year.",
};

const benefits = [
  { icon: Star, title: "10% member pricing", text: "On every decant, every day — including new arrivals." },
  { icon: Sparkles, title: "Early access", text: "New decants and limited drops before they go public." },
  { icon: Truck, title: "Free delivery", text: "On every order, with no minimum spend." },
  { icon: Gift, title: "Birthday 8 ml", text: "A complimentary 8 ml decant of your choice, every year." },
];

export default async function MembershipPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const active = user?.membership_tier === "Circle" || user?.membership_tier === "Maison+";

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <Image src="/images/editorial/membership.jpg" alt="Maison du Scent membership" fill priority sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/20" />
        <div className="shell relative flex min-h-[30rem] flex-col justify-center py-20">
          <p className="eyebrow text-gold-soft">Maison+</p>
          <h1 className="display-hero mt-4 max-w-2xl text-balance">
            The people who <span className="italic text-gold-soft">always smell good.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-cream/70">
            A year of member pricing, early access and small luxuries — for the people who treat scent as part of getting dressed, not an afterthought.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {active ? (
              <Link href="/account" className="btn btn-light">Your membership</Link>
            ) : (
              <Link href={user ? "/account/settings?upgrade=1" : "/register?next=/membership"} className="btn btn-light">
                Join for {formatMoney(settings.membershipPrice)} / year
              </Link>
            )}
            <a
              href={whatsappLink("Hello Maison du Scent, I'd like to know more about Maison+ membership.", settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn border border-cream/35 text-cream hover:bg-cream hover:text-ink"
            >
              Ask a question
            </a>
          </div>
          <p className="mt-4 text-[0.6rem] uppercase tracking-[0.15em] text-cream/45">No auto-renewal · Cancel anytime</p>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-wine">What&apos;s included</p>
            <h2 className="display-lg mt-3">Small privileges,<br /><span className="italic">every day of the year.</span></h2>
            <p className="mt-4 max-w-md text-[0.88rem] leading-relaxed text-stone">
              Maison+ is for the collector and the curious. If you order more than three times a year, it pays for itself — and the birthday scent is a genuinely lovely thing to receive.
            </p>
            <div className="mt-6 border border-line bg-parchment p-5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-stone">Annual membership</p>
              <p className="mt-2 font-display text-4xl">{formatMoney(settings.membershipPrice)}<span className="text-base text-stone"> / year</span></p>
              <p className="mt-1 text-[0.7rem] text-stone">One payment. No auto-renewal.</p>
              <Link href={user ? "/account/settings?upgrade=1" : "/register?next=/membership"} className="btn btn-wine mt-4 w-full">
                {active ? "Manage membership" : "Become a member"}
              </Link>
            </div>
          </div>
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-parchment p-6">
                <benefit.icon size={20} strokeWidth={1.3} className="text-wine" />
                <h3 className="mt-3 font-display text-xl">{benefit.title}</h3>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-stone">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-deep/60 py-14">
        <div className="shell">
          <div className="text-center">
            <p className="eyebrow text-stone">The maths</p>
            <h2 className="display-lg mt-2">A year of better decisions</h2>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
            {[
              { value: "10%", label: "Off every order" },
              { value: "4×", label: "Free deliveries a year" },
              { value: "1", label: "Birthday 8 ml on us" },
            ].map((item) => (
              <div key={item.label} className="bg-parchment px-6 py-8 text-center">
                <p className="font-display text-4xl text-wine">{item.value}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-stone">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-xl">
            <ul className="space-y-3 text-[0.84rem] text-ink-soft">
              {[
                "Member pricing is applied automatically at checkout.",
                "Free delivery applies to all Kenyan addresses.",
                "Birthday decant can be claimed in the month of your birthday.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5"><Check size={14} className="mt-0.5 shrink-0 text-moss" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
