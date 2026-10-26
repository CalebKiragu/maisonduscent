import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { faqs } from "@/lib/seed-data";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";
import { PageHero } from "@/components/store/page-hero";
import { FaqAccordion } from "@/components/store/accordion";

export const metadata: Metadata = {
  title: "FAQs — authenticity, delivery, returns",
  description: "Answers to the questions we hear most: are the perfumes authentic, how long does delivery take, and can I return an opened decant?",
};

export default async function FaqPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="Good to know"
        title={<>Questions, <span className="italic text-wine">answered.</span></>}
        description="Everything you might want to know before your first order. If your question is not here, WhatsApp us — a real person will reply."
        breadcrumbs={[{ label: "FAQs" }]}
      />
      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <p className="eyebrow text-stone">The essentials</p>
            <h2 className="display-lg mt-2">Before you order</h2>
            <p className="mt-4 text-[0.84rem] leading-relaxed text-stone">
              We have answered the questions we hear most. For anything else, the maison is one message away.
            </p>
            <a
              href={whatsappLink("Hello Maison du Scent, I have a question that isn't in the FAQs.", settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wine mt-6"
            >
              <MessageCircle size={14} /> Ask on WhatsApp
            </a>
            <div className="mt-8 border-t border-line pt-5 text-[0.76rem] text-stone">
              <p>Still deciding? <Link href="/find-my-scent" className="text-wine underline underline-offset-4">Take the scent quiz</Link>.</p>
              <p className="mt-2">New to decants? <Link href="/journal/the-case-for-decants" className="text-wine underline underline-offset-4">Read the case for decants</Link>.</p>
            </div>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
