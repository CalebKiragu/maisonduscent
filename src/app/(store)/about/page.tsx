import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Droplets, Heart, MapPin } from "lucide-react";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Our story — hand-decanted in Mombasa",
  description: "Maison du Scent is a Mombasa perfume atelier built on a simple belief: try before you commit. Authentic decants, poured by hand.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The maison"
        title={<>A house built on <span className="italic text-wine">second thoughts.</span></>}
        description="Maison du Scent began with a full bottle we regretted buying. It became a way to try everything — properly, slowly, on skin — before committing."
        breadcrumbs={[{ label: "Our story" }]}
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
            <Image src="/images/editorial/boutique.jpg" alt="The Maison du Scent atelier in Mombasa" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute bottom-5 left-5 bg-parchment/95 px-5 py-4 backdrop-blur">
              <p className="font-display text-3xl leading-none">Mombasa</p>
              <p className="mt-1 text-[0.55rem] uppercase tracking-[0.18em] text-stone">The atelier · Est. 2021</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="eyebrow text-wine">Our belief</p>
            <h2 className="display-lg mt-3">The best perfume is the one you <span className="italic">actually wear.</span></h2>
            <div className="prose-editorial mt-5">
              <p>
                A department-store spritz tells you almost nothing. The opening is loud, the room is busy, and you are gone before the dry-down. Two weeks later, the full bottle sits untouched.
              </p>
              <p>
                We built Maison du Scent around a slower idea: live with a scent. Wear it to work, to dinner, in the rain. Learn how it behaves on your skin. Then choose — or choose again.
              </p>
              <p>
                Every decant is poured by hand from a sealed, full-sized bottle sourced through authorised retailers. No clones, no dupes, no inspired-by. The real juice, in sizes that make sense.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { value: "1,200+", label: "Bottles decanted" },
                { value: "40+", label: "Houses in the library" },
                { value: "12k+", label: "Orders delivered" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl leading-none text-wine">{stat.value}</p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-stone">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-deep/60 py-14 sm:py-20">
        <div className="shell">
          <div className="max-w-xl">
            <p className="eyebrow text-stone">What we stand for</p>
            <h2 className="display-lg mt-2">Four things we will not compromise.</h2>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BadgeCheck, title: "Authenticity", text: "Sealed bottles, authorised retailers, batch-verified. If it is not real, it does not enter the atelier." },
              { icon: Droplets, title: "Craft", text: "Hand-measured decants, clean vials, labels applied by hand. No shortcuts in the small things." },
              { icon: Heart, title: "Honesty", text: "We will tell you when a scent is not worth the hype. The library is edited, not exhaustive." },
              { icon: MapPin, title: "Mombasa", text: "Locally owned and operated. Same-day dispatch, countrywide delivery, real people on WhatsApp." },
            ].map((value) => (
              <div key={value.title} className="bg-parchment p-6">
                <value.icon size={20} strokeWidth={1.3} className="text-wine" />
                <h3 className="mt-3 font-display text-xl">{value.title}</h3>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-stone">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden bg-cream-deep">
            <Image src="/images/editorial/perfumer.jpg" alt="Decanting at the Maison du Scent atelier" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-wine">The process</p>
            <h2 className="display-lg mt-3">From sealed bottle to your shelf.</h2>
            <ol className="mt-6 space-y-5">
              {[
                { title: "Source", text: "We buy full-sized bottles through authorised retailers and verify batch codes." },
                { title: "Decant", text: "Each vial is filled by hand, labelled and rested before it leaves the atelier." },
                { title: "Wrap", text: "Orders are packed in a keepsake box with a mystery 2 ml sample and a handwritten note." },
                { title: "Deliver", text: "Same-day dispatch in Mombasa before 2pm; 2–4 working days countrywide." },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line font-display text-lg text-wine">{index + 1}</span>
                  <div>
                    <h3 className="font-display text-xl">{step.title}</h3>
                    <p className="mt-0.5 text-[0.8rem] leading-relaxed text-stone">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/best-sellers" className="btn btn-ink mt-7 w-fit">Shop the library <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
