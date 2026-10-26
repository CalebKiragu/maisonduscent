import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCollections } from "@/lib/queries";
import { PageHero } from "@/components/store/page-hero";

export const metadata: Metadata = {
  title: "Perfume collections — shop by mood",
  description: "Summer, clean, floral, woody, evening and more. Explore the Maison du Scent collections, curated by mood and moment.",
};

export default function CollectionsPage() {
  const collections = getCollections();
  return (
    <>
      <PageHero
        eyebrow="Shop by feeling"
        title={<>The <span className="italic text-wine">collections</span></>}
        description="Scent is memory before it is perfume. Find the corner of the maison that feels like the moment you are dressing for — sun, rain, candlelight, or a Tuesday morning."
        breadcrumbs={[{ label: "Collections" }]}
      />

      <section className="shell py-12 sm:py-16">
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className={`group ${index === 0 || index === 5 ? "sm:col-span-2" : ""}`}
            >
              <div className={`img-zoom relative overflow-hidden bg-cream-deep ${index === 0 || index === 5 ? "aspect-[16/9] sm:aspect-[2/1]" : "aspect-[4/5]"}`}>
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes={index === 0 || index === 5 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                  className="object-cover"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream sm:p-6">
                  <p className="text-[0.52rem] uppercase tracking-[0.18em] text-cream/60">{collection.subtitle}</p>
                  <h2 className="mt-1 font-display text-3xl leading-none">{collection.title}</h2>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-cream/85 transition group-hover:text-cream">
                    Explore <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 max-w-md text-[0.8rem] leading-relaxed text-stone">{collection.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
