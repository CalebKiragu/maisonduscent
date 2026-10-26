import type { Metadata } from "next";
import Image from "next/image";
import { Gift, MessageCircle, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { formatMoney, whatsappLink } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Gift cards",
  description: "A Maison du Scent gift card — for the person who should choose their own scent. Delivered by email or WhatsApp.",
};

const amounts = [2500, 5000, 10000, 15000];

export default async function GiftCardsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="The safest beautiful gift"
        title={<>Let them <span className="italic text-wine">choose.</span></>}
        description="A gift card is the kindest way to give perfume. No guessing, no wrong notes — just the pleasure of choosing something that feels like them."
        image="/images/editorial/gifts.jpg"
        imageAlt="A Maison du Scent gift"
        breadcrumbs={[{ label: "Gift cards" }]}
      />
      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {amounts.map((amount, index) => (
                <a
                  key={amount}
                  href={whatsappLink(
                    `Hello Maison du Scent, I'd like to buy a gift card for ${formatMoney(amount)}.`,
                    settings.whatsappNumber,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative overflow-hidden p-6 transition ${index === 0 ? "bg-wine text-cream" : "border border-line bg-parchment text-ink hover:border-ink/40"}`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[0.52rem] font-semibold uppercase tracking-[0.2em] ${index === 0 ? "text-cream/60" : "text-stone"}`}>Maison du Scent</span>
                    <Gift size={16} className={index === 0 ? "text-gold-soft" : "text-gold"} />
                  </div>
                  <p className="mt-8 font-display text-4xl leading-none">{formatMoney(amount)}</p>
                  <p className={`mt-2 text-[0.62rem] uppercase tracking-[0.13em] ${index === 0 ? "text-cream/55" : "text-stone"}`}>Gift card · no expiry</p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${index === 0 ? "text-cream" : "text-wine"}`}>
                    Order on WhatsApp <MessageCircle size={12} />
                  </span>
                  {index === 0 && <span className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full border border-cream/15" />}
                </a>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 border border-line bg-cream-deep/40 p-5">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-[0.8rem] leading-relaxed text-stone">
                Gift cards are delivered by email or WhatsApp within one working day, with a handwritten note if you would like one. They can be used on any product, including sale items, and never expire.
              </p>
            </div>
          </div>

          <div>
            <div className="relative aspect-[5/4] overflow-hidden bg-cream-deep">
              <Image src="/images/editorial/boutique.jpg" alt="Gift wrapping at Maison du Scent" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
            </div>
            <h2 className="mt-6 font-display text-2xl">Corporate &amp; bulk gifting</h2>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-stone">
              Looking after clients, a team or a wedding party? We create bespoke discovery sets with your branding, a handwritten card and coordinated delivery. Minimum 10 sets.
            </p>
            <a
              href={whatsappLink("Hello Maison du Scent, I'd like to discuss corporate gifting.", settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ink mt-4"
            >
              <MessageCircle size={14} /> Discuss corporate gifting
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
