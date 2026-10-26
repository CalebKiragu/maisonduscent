import type { Metadata } from "next";
import { PageHero } from "@/components/store/page-hero";
import { getSettings } from "@/lib/settings";
import { formatMoney, phoneHref } from "@/lib/utils";

export const metadata: Metadata = { title: "Terms of service", description: "The terms that apply when you shop with Maison du Scent." };

export default function TermsPage() {
  const settings = getSettings();

  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of service" description="Last updated 26 October 2026. By shopping with Maison du Scent you agree to the terms below." breadcrumbs={[{ label: "Terms" }]} height="short" />
      <article className="shell prose-editorial max-w-3xl py-12 pb-20">
        <h2 className="mb-4 font-display text-2xl">Products</h2>
        <p>All fragrances sold by Maison du Scent are authentic designer or niche perfumes, decanted by hand from sealed, full-sized bottles. Decants are not manufacturer-sealed retail products and do not carry the original bottle or packaging. Batch codes belong to the original bottles.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Pricing</h2>
        <p>All prices are in Kenyan shillings and include VAT where applicable. We reserve the right to change prices and to correct pricing errors. Delivery is free on orders over {formatMoney(settings.freeDeliveryThreshold)}; otherwise a flat fee of {formatMoney(settings.deliveryFee)} applies.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Orders</h2>
        <p>An order is confirmed once payment is received (or, for cash on delivery, once we confirm by phone or WhatsApp). We may cancel an order if a product is unavailable or if we suspect fraud, and will refund any payment in full.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Returns</h2>
        <p>Unopened, sealed decants may be returned within {settings.returnsDays} days. Opened fragrance cannot be returned for hygiene reasons, except where faulty. See our delivery and returns page for the full process.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Membership</h2>
        <p>Maison+ membership is valid for 12 months from purchase and does not auto-renew. Member benefits are personal and non-transferable. We may update benefits with reasonable notice.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Liability</h2>
        <p>Fragrance may cause irritation in rare cases. Always patch-test and discontinue use if irritation occurs. To the extent permitted by law, our liability is limited to the value of the goods purchased.</p>
        <h2 className="mb-4 mt-8 font-display text-2xl">Contact</h2>
        <p>Maison du Scent, {settings.city}, Kenya · <a href={`mailto:${settings.email}`} className="text-wine underline decoration-wine/30 underline-offset-2 hover:decoration-wine">{settings.email}</a> · <a href={phoneHref(settings.phone)} className="text-wine underline decoration-wine/30 underline-offset-2 hover:decoration-wine">{settings.phone}</a></p>
      </article>
    </>
  );
}
