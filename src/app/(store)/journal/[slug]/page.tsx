import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { journalArticles } from "@/lib/seed-data";
import { Breadcrumbs } from "@/components/store/page-hero";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = journalArticles.find((a) => a.slug === slug);
  if (!article) return { title: "Journal" };
  return { title: article.title, description: article.excerpt };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = journalArticles.find((a) => a.slug === slug);
  if (!article) notFound();
  const others = journalArticles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <div className="shell pt-6">
        <Breadcrumbs items={[{ label: "The Journal", href: "/journal" }, { label: article.title }]} />
      </div>

      <article className="shell py-10 sm:py-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-wine">{article.category} · {article.read}</p>
          <h1 className="display-xl mt-4 text-balance">{article.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-relaxed text-stone">{article.excerpt}</p>
          <p className="mt-4 text-[0.6rem] uppercase tracking-[0.15em] text-mist">{formatDate(article.date, { day: "numeric", month: "long", year: "numeric" })}</p>
        </header>

        <div className="relative mx-auto mt-9 aspect-[16/9] max-w-4xl overflow-hidden bg-cream-deep">
          <Image src={article.image} alt={article.title} fill priority sizes="(max-width: 1024px) 100vw, 56rem" className="object-cover" />
        </div>

        <div className="prose-editorial mx-auto mt-10 max-w-2xl">
          {article.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <div className="mt-8 border-l-2 border-gold pl-5">
            <p className="font-display text-2xl italic leading-snug text-ink">
              “The best perfume is the one you stop noticing — because it has become part of you.”
            </p>
            <p className="mt-2 text-[0.6rem] uppercase tracking-[0.15em] text-stone">The Maison du Scent</p>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Link href="/journal" className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-stone hover:text-ink">
            <ArrowLeft size={13} /> All journal entries
          </Link>
          <Link href="/find-my-scent" className="btn btn-wine">Find my scent</Link>
        </div>
      </article>

      <section className="border-t border-line bg-cream-deep/40 py-12">
        <div className="shell">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl">Keep reading</h2>
            <Link href="/journal" className="link-underline text-[0.6rem] font-semibold uppercase tracking-[0.13em]">The Journal</Link>
          </div>
          <div className="mt-7 grid gap-7 sm:grid-cols-3">
            {others.map((other) => (
              <Link key={other.slug} href={`/journal/${other.slug}`} className="group">
                <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-cream-deep">
                  <Image src={other.image} alt={other.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                </div>
                <p className="mt-3 text-[0.52rem] font-semibold uppercase tracking-[0.15em] text-wine">{other.category}</p>
                <h3 className="mt-1.5 font-display text-xl leading-tight group-hover:text-wine">{other.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.13em] text-stone">Read <ArrowRight size={10} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
