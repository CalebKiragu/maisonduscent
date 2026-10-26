import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { journalArticles } from "@/lib/seed-data";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "The Journal — scent notes from Mombasa",
  description: "Guides, edits and notes from the Maison du Scent atelier. How to wear perfume in the heat, the case for decants, and more.",
};

export default function JournalPage() {
  const [featured, ...rest] = journalArticles;
  return (
    <>
      <PageHero
        eyebrow="Notes from the maison"
        title={<>The <span className="italic text-wine">Journal</span></>}
        description="On scent, skin and the small rituals of getting dressed. Written in Mombasa, for anyone who believes perfume is part of the story."
        breadcrumbs={[{ label: "The Journal" }]}
      />

      <section className="shell py-12 sm:py-16">
        <Link href={`/journal/${featured.slug}`} className="group grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-cream-deep">
            <Image src={featured.image} alt={featured.title} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow text-wine">{featured.category} · {featured.read}</p>
            <h2 className="display-lg mt-4 text-balance transition group-hover:text-wine">{featured.title}</h2>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-stone">{featured.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.15em]">
              Read the story <ArrowRight size={13} />
            </span>
          </div>
        </Link>

        <div className="mt-14 grid gap-x-5 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <Link key={article.slug} href={`/journal/${article.slug}`} className="group">
              <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-cream-deep">
                <Image src={article.image} alt={article.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-wine">{article.category} · {article.read}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight transition group-hover:text-wine">{article.title}</h2>
              <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-stone">{article.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.13em] text-stone transition group-hover:text-ink">
                Read <ArrowUpRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
