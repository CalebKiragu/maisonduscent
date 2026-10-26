import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, getWishlistIds } from "@/lib/queries";
import { ProductGrid } from "@/components/store/product-card";
import { PageHero } from "@/components/store/page-hero";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Perfume gifts — beautifully wrapped, hand-decanted",
  description: "Discovery sets, travel atomizers and gift cards. Hand-wrapped in Mombasa with a handwritten note and a mystery sample.",
};

export default async function GiftsPage() {
  const user = await getCurrentUser();
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const all = getAllProducts("store");
  const bundles = all.filter((p) => p.type === "bundle");
  const atomizers = all.filter((p) => p.type === "atomizer");

  return (
    <>
      <PageHero
        eyebrow="The art of giving"
        title={<>A beautiful way<br />to say <span className="italic text-wine">it.</span></>}
        description="Discovery sets, travel cases and gift cards, wrapped by hand in our Mombasa atelier with a handwritten note and a complimentary mystery sample."
        image="/images/editorial/gifts.jpg"
        imageAlt="A Maison du Scent gift box tied with ribbon"
        breadcrumbs={[{ label: "Perfume gifts" }]}
        height="medium"
      >
        <Link href="#sets" className="btn btn-ink">Shop gift sets</Link>
        <Link href="/contact" className="btn btn-outline">Corporate gifting</Link>
      </PageHero>

      <section className="shell py-12 sm:py-16" id="sets">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">Wrapped and ready</p>
            <h2 className="display-lg mt-2">Discovery sets</h2>
          </div>
          <Link href="/bundles" className="link-underline hidden items-center gap-1.5 text-[0.63rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex">
            All bundles <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={bundles} wishlistIds={wishlistIds} />
        </div>
      </section>

      <section className="bg-cream-deep/60 py-14 sm:py-20">
        <div className="shell grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden bg-cream-deep">
            <Image src="/images/editorial/boutique.jpg" alt="Gift wrapping at the Maison du Scent atelier" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="max-w-lg">
            <p className="eyebrow text-wine">The finishing touch</p>
            <h2 className="display-lg mt-3">Every gift, considered.</h2>
            <ul className="mt-6 space-y-5">
              {[
                { icon: Gift, title: "Keepsake box", text: "Rigid box, tissue, wax seal and a hand-tied ribbon." },
                { icon: Sparkles, title: "Mystery 2 ml sample", text: "A little something extra, chosen by the maison." },
                { icon: ArrowRight, title: "Handwritten note", text: "Tell us what to write at checkout. We'll do the rest." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <item.icon size={18} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-display text-xl">{item.title}</h3>
                    <p className="mt-0.5 text-[0.8rem] leading-relaxed text-stone">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/gift-cards" className="btn btn-ink mt-7">Shop gift cards</Link>
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">For the well-travelled</p>
            <h2 className="display-lg mt-2">Travel cases</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {atomizers.map((product) => (
            <Link key={product.id} href={`/perfumes/${product.slug}`} className="group">
              <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-cream-deep">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
              </div>
              <p className="mt-3 font-display text-xl">{product.name}</p>
              <p className="text-[0.72rem] text-stone">{formatMoney(product.price_30)}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
