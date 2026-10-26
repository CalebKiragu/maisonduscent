import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { normalizePhoneNumber, phoneHref, whatsappLink } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";
import { ContactForm } from "@/components/store/contact-form";

export const metadata: Metadata = {
  title: "Contact — talk to the maison",
  description: "Questions about an order, a scent, corporate gifting or wholesale? Message Maison du Scent in Mombasa on WhatsApp or by email.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsappDigits = normalizePhoneNumber(settings.whatsappNumber);
  const whatsappDisplay = whatsappDigits
    ? whatsappDigits === normalizePhoneNumber(settings.phone)
      ? settings.phone
      : `+${whatsappDigits}`
    : `@${settings.whatsappNumber.replace(/^@/, "")}`;

  return (
    <>
      <PageHero
        eyebrow="We're here"
        title={<>Talk to the <span className="italic text-wine">maison.</span></>}
        description="For scent advice, order questions, corporate gifting or a note about something we could do better — WhatsApp is usually fastest."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl">The quickest ways</h2>
            <div className="mt-6 space-y-4">
              <a
                href={whatsappLink("Hello Maison du Scent, I have a question.", settings.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 border border-line bg-parchment p-5 transition hover:border-ink/30"
              >
                <MessageCircle size={18} className="mt-0.5 shrink-0 text-[#1f7a53]" />
                <span>
                  <span className="block font-display text-xl">WhatsApp</span>
                  <span className="mt-0.5 block text-[0.78rem] text-stone">{whatsappDisplay} · replies within the hour</span>
                </span>
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-start gap-4 border border-line bg-parchment p-5 transition hover:border-ink/30">
                <Mail size={18} className="mt-0.5 shrink-0 text-wine" />
                <span>
                  <span className="block font-display text-xl">Email</span>
                  <span className="mt-0.5 block text-[0.78rem] text-stone">{settings.email}</span>
                </span>
              </a>
              <a href={phoneHref(settings.phone)} className="flex items-start gap-4 border border-line bg-parchment p-5 transition hover:border-ink/30">
                <Phone size={18} className="mt-0.5 shrink-0 text-wine" />
                <span>
                  <span className="block font-display text-xl">Phone</span>
                  <span className="mt-0.5 block text-[0.78rem] text-stone">{settings.phone}</span>
                </span>
              </a>
              <div className="flex items-start gap-4 border border-line bg-parchment p-5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-wine" />
                <span>
                  <span className="block font-display text-xl">The atelier</span>
                  <span className="mt-0.5 block text-[0.78rem] text-stone">{settings.city}, Kenya · pickup by appointment</span>
                </span>
              </div>
            </div>
            <div className="mt-6 border border-line bg-cream-deep/40 p-5">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-stone">Opening hours</p>
              <div className="mt-2 space-y-1 text-[0.82rem] text-ink-soft">
                {settings.openingHours.split("\n").filter(Boolean).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl">Send a note</h2>
            <p className="mt-2 text-[0.84rem] text-stone">We read every message. For urgent order issues, WhatsApp is best.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
