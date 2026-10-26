import type { Metadata } from "next";
import { getAllProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { ScentQuiz } from "@/components/store/scent-quiz";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Find my scent — the fragrance quiz",
  description: "Answer four questions and find the perfumes that fit the way you want to be remembered. Hand-decanted, authentic, delivered in Mombasa.",
};

export const dynamic = "force-dynamic";

export default async function FindMyScentPage() {
  const products = getAllProducts("store").filter((p) => p.type === "perfume");
  const settings = getSettings();

  return (
    <>
      <PageHero
        eyebrow="The scent quiz"
        title={<>Find the one that feels <span className="italic text-wine">like you.</span></>}
        description="Four questions. No jargon. We will match you to three fragrances worth sampling — and tell you exactly why."
        align="center"
        breadcrumbs={[{ label: "Find my scent" }]}
      />
      <section className="shell py-12 sm:py-16">
        <ScentQuiz products={products} whatsappNumber={settings.whatsappNumber} />
      </section>
      <section className="border-t border-line bg-cream-deep/50 py-12">
        <div className="shell grid gap-6 text-center sm:grid-cols-3">
          {[
            { number: "01", title: "Wear it first", text: "Order 2 ml of each match. Skin chemistry beats any quiz." },
            { number: "02", title: "Live with it", text: "Give each scent a full day — opening, heart and dry-down." },
            { number: "03", title: "Commit to the one", text: "Move to 8 ml or 30 ml only when it earns a permanent place." },
          ].map((step) => (
            <div key={step.number}>
              <p className="font-display text-3xl text-gold">{step.number}</p>
              <h3 className="mt-2 font-display text-xl">{step.title}</h3>
              <p className="mx-auto mt-1 max-w-xs text-[0.78rem] leading-relaxed text-stone">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
