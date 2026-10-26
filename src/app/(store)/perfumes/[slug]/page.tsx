import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Leaf, MessageCircle, Sparkles, Wine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getBrandBySlug,
  getBundleContents,
  getCollections,
  getProductBySlug,
  getRelatedProducts,
  getReviews,
  getWishlistIds,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/site";
import { formatMoney, slugify, startingPrice, whatsappLink } from "@/lib/utils";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { Accordion } from "@/components/store/accordion";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/page-hero";
import { Stars } from "@/components/ui/stars";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Perfume" };
  return {
    title: `${product.name} by ${product.brand} — decants from ${formatMoney(startingPrice(product))}`,
    description: `Shop authentic ${product.name} decants in 2 ml, 5 ml, 8 ml and 30 ml. ${product.description}`,
    openGraph: {
      title: `${product.name} by ${product.brand}`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product || product.status === "discontinued") notFound();

  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const reviews = getReviews(product.id, 4);
  const related = getRelatedProducts(product, 4);
  const bundleContents = getBundleContents(product);
  const collections = getCollections().filter((c) => product.collections.includes(c.slug));
  const brandSlug = slugify(product.brand);
  const brandPage = getBrandBySlug(brandSlug) ? `/brands/${brandSlug}` : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [absoluteUrl(product.image)],
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KES",
      lowPrice: startingPrice(product),
      highPrice: product.price_30 || product.price_8,
      availability: product.status === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="shell pt-5">
        <Breadcrumbs
          items={[
            { label: "Perfumes", href: "/perfumes" },
            { label: product.brand, href: brandPage },
            { label: product.name },
          ]}
        />
      </div>

      <section className="shell grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <ProductGallery images={product.gallery.length ? product.gallery : [product.image]} name={product.name} badge={product.badge} />
        <div className="lg:pt-1">
          <ProductPurchase
            product={product}
            whatsappNumber={settings.whatsappNumber}
            freeDeliveryThreshold={settings.freeDeliveryThreshold}
            returnsDays={settings.returnsDays}
            wishlisted={wishlistIds.includes(product.id)}
          />

          <div className="mt-7">
            <Accordion
              defaultOpen={0}
              items={[
                {
                  title: "The composition",
                  content: (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Top", notes: product.top_notes },
                        { label: "Heart", notes: product.heart_notes },
                        { label: "Base", notes: product.base_notes },
                      ].map((tier) => (
                        <div key={tier.label}>
                          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-wine">{tier.label}</p>
                          <ul className="mt-1.5 space-y-1">
                            {tier.notes.map((note) => (
                              <li key={note} className="text-[0.76rem] leading-snug text-ink-soft">{note}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  title: "Story & provenance",
                  content: <p>{product.story}</p>,
                },
                {
                  title: "Sizes & how to wear",
                  content: (
                    <div>
                      <p>Our 2 ml gives roughly 30 sprays, 5 ml roughly 75, 8 ml roughly 120 and 30 ml roughly 450. The 8 ml is designed to fit our refillable travel cases.</p>
                      <p className="mt-2">Apply to pulse points — wrists, throat, behind the ears — on moisturised skin. Do not rub. Store away from direct sun and heat.</p>
                    </div>
                  ),
                },
                {
                  title: "Delivery & returns",
                  content: (
                    <div>
                      <p>Free countrywide delivery over {formatMoney(settings.freeDeliveryThreshold)}; otherwise {formatMoney(settings.deliveryFee)}. Mombasa orders typically arrive in 1–2 working days, other counties in 2–4. Orders placed before 2pm ship the same working day.</p>
                      <p className="mt-2">Unopened, sealed decants can be returned within {settings.returnsDays} days. For hygiene reasons opened fragrance cannot be returned — but if something is wrong, message us and we will make it right.</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {bundleContents.length > 0 && (
        <section className="shell border-t border-line py-10">
          <p className="eyebrow text-wine">Inside the box</p>
          <h2 className="display-lg mt-2">Five full-size decants, 8 ml each</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {bundleContents.map((item) => (
              <Link key={item.id} href={`/perfumes/${item.slug}`} className="group flex items-center gap-3 border border-line bg-parchment p-2.5">
                <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-deep">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.5rem] uppercase tracking-[0.14em] text-stone">{item.brand}</span>
                  <span className="block truncate font-display text-[1.02rem] leading-tight group-hover:text-wine">{item.name}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Story band */}
      <section className="mt-8 bg-cream-deep/70 py-14 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden bg-cream-deep">
            <Image
              src={collections[0]?.image ?? "/images/editorial/perfumer.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-ink/65 px-4 py-3 text-cream backdrop-blur">
              <p className="font-display text-2xl leading-none">Hand-decanted</p>
              <p className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-cream/65">Mombasa atelier</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="eyebrow text-wine">The notes</p>
            <h2 className="display-lg mt-3">A scent that <span className="italic">unfolds.</span></h2>
            <p className="mt-4 text-[0.9rem] leading-relaxed text-stone">{product.story}</p>
            <div className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { icon: Sparkles, label: "Top", value: product.top_notes[0] },
                { icon: Leaf, label: "Heart", value: product.heart_notes[0] },
                { icon: Wine, label: "Base", value: product.base_notes[0] },
              ].map((note) => (
                <div key={note.label}>
                  <note.icon size={15} className="text-gold" />
                  <p className="mt-2 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-stone">{note.label}</p>
                  <p className="mt-0.5 font-display text-lg leading-tight">{note.value}</p>
                </div>
              ))}
            </div>
            {collections.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {collections.map((collection) => (
                  <Link key={collection.id} href={`/collections/${collection.slug}`} className="chip">
                    {collection.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr]">
          <div>
            <p className="eyebrow text-stone">In their words</p>
            <h2 className="display-lg mt-2">Worn & reviewed</h2>
            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-5xl leading-none">{product.rating.toFixed(1)}</span>
              <div className="pb-1">
                <Stars rating={product.rating} size={13} />
                <p className="mt-1 text-[0.66rem] text-stone">{product.review_count.toLocaleString("en-KE")} verified reviews</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {[5, 4, 3].map((star) => {
                const pct = star === 5 ? 82 : star === 4 ? 14 : 4;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-3 text-[0.62rem] text-stone">{star}</span>
                    <div className="h-1 flex-1 bg-line">
                      <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-7 text-right text-[0.58rem] text-stone">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <a
              href={whatsappLink(`Hello Maison du Scent, I'd like to leave a review for ${product.name}.`, settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm mt-6"
            >
              <MessageCircle size={13} /> Write a review
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <figure key={review.id} className="border border-line bg-parchment p-5">
                <Stars rating={review.rating} size={11} />
                <figcaption className="mt-3">
                  <p className="font-display text-lg leading-tight">{review.title}</p>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-stone">{review.body}</p>
                  <p className="mt-3 border-t border-line pt-2 text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                    {review.name} · Verified buyer
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="shell border-t border-line py-14 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-stone">You may also love</p>
              <h2 className="display-lg mt-2">Complete the wardrobe</h2>
            </div>
            <Link href="/perfumes" className="link-underline hidden items-center gap-1.5 text-[0.63rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex">
              Shop all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={related} wishlistIds={wishlistIds} />
          </div>
        </section>
      )}
    </>
  );
}
