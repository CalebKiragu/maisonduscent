import type { Metadata } from "next";
import { PageHero } from "@/components/store/page-hero";
import { getSettings } from "@/lib/settings";
import { phoneHref } from "@/lib/utils";

export const metadata: Metadata = { title: "Privacy policy", description: "How Maison du Scent collects, uses and protects your personal information." };

export default function PrivacyPage() {
  const settings = getSettings();

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" description="Last updated 26 October 2026. This policy explains what we collect, why, and the choices you have." breadcrumbs={[{ label: "Privacy" }]} height="short" />
      <article className="shell prose-editorial max-w-3xl py-12 pb-20">
        <h2 className="mb-4 font-display text-2xl">What we collect</h2>
        <p>We collect the information you give us when you create an account, place an order or contact us: your name, email address, phone number, delivery address and order history. Payment details are processed by our payment partners and are never stored on our servers.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">How we use it</h2>
        <p>To fulfil orders, provide customer support, manage your account and membership, and — if you opt in — send you occasional emails about new arrivals and private sales. We also collect anonymous, aggregated analytics about how the site is used, so we can improve it.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Cookies and analytics</h2>
        <p>We use a first-party analytics cookie to understand visits, pages viewed and campaign performance. We do not sell your data, and we do not use third-party advertising cookies on this site. You can clear cookies at any time in your browser settings.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Sharing</h2>
        <p>We share only what is necessary with delivery partners (name, phone, address) and payment processors. We never sell, rent or trade your personal information.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Your rights</h2>
        <p>You can request a copy of your data, ask us to correct it, or ask us to delete your account by emailing <a href={`mailto:${settings.email}`} className="text-wine underline decoration-wine/30 underline-offset-2 hover:decoration-wine">{settings.email}</a>. We will respond within 30 days.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Contact</h2>
        <p>Questions about this policy? Email <a href={`mailto:${settings.email}`} className="text-wine underline decoration-wine/30 underline-offset-2 hover:decoration-wine">{settings.email}</a>, call <a href={phoneHref(settings.phone)} className="text-wine underline decoration-wine/30 underline-offset-2 hover:decoration-wine">{settings.phone}</a>, or message us on WhatsApp. Maison du Scent, {settings.city}, Kenya.</p>
      </article>
    </>
  );
}
