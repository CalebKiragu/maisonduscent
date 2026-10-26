import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getBrands } from "@/lib/queries";
import { PageHero } from "@/components/store/page-hero";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Perfume brands — designer & niche houses",
  description: "Explore every designer and niche fragrance house in the Maison du Scent library, from Creed and Tom Ford to Amouage and Xerjoff.",
};

export default function BrandsPage() {
  const brands = getBrands();
  const grouped = brands.reduce<Record<string, typeof brands>>((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    acc[letter] = [...(acc[letter] ?? []), brand];
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="The houses"
        title={<>Designer & <span className="italic text-wine">niche</span></>}
        description="From the icons you know by name to the rare houses worth seeking out. Every bottle is sourced through authorised retailers and decanted by hand in Mombasa."
        breadcrumbs={[{ label: "Brands" }]}
      />

      <section className="shell py-12 sm:py-16">
        <div className="mb-10 flex flex-wrap gap-1.5 border-b border-line pb-6">
          {Object.keys(grouped).sort().map((letter) => (
            <a key={letter} href={`#brand-${letter}`} className="flex h-8 w-8 items-center justify-center border border-line text-[0.66rem] font-semibold transition hover:border-ink hover:bg-ink hover:text-cream">
              {letter}
            </a>
          ))}
        </div>

        {Object.keys(grouped).sort().map((letter) => (
          <div key={letter} id={`brand-${letter}`} className="mb-12 scroll-mt-28">
            <div className="mb-5 flex items-center gap-4">
              <span className="font-display text-3xl text-gold">{letter}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {grouped[letter].map((brand) => (
                <Link key={brand.slug} href={`/brands/${brand.slug}`} className="group flex items-center gap-3 border border-line bg-parchment p-3 transition hover:border-ink/30 hover:shadow-soft">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream-deep">
                    <Image src={brand.image} alt={brand.name} fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[1.12rem] leading-tight group-hover:text-wine">{brand.name}</span>
                    <span className="mt-0.5 block text-[0.6rem] text-stone">{brand.count} scents · from {formatMoney(brand.from)}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[0.54rem] uppercase tracking-[0.12em] text-wine opacity-0 transition group-hover:opacity-100">
                      Shop <ArrowUpRight size={10} />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
