import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Droplets,
  Gift,
  PackageCheck,
  Quote,
  RotateCcw,
  Sparkles,
  Truck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllProducts,
  getBestsellers,
  getCollections,
  getNewArrivals,
  getWishlistIds,
} from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatMoney, whatsappLink } from "@/lib/utils";
import { ProductGrid } from "@/components/store/product-card";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { testimonials, journalArticles } from "@/lib/seed-data";
import { Stars } from "@/components/ui/stars";

export const dynamic = "force-dynamic";

const categories = [
  {
    label: "For Her",
    note: "Rose, amber, soft power",
    href: "/perfumes/for-women",
    image: "/images/editorial/for-her.jpg",
  },
  {
    label: "For Him",
    note: "Woods, citrus, quiet confidence",
    href: "/perfumes/for-men",
    image: "/images/editorial/for-him.jpg",
  },
  {
    label: "Best Sellers",
    note: "The ones you keep coming back to",
    href: "/best-sellers",
    image: "/images/products/p01.jpg",
  },
  {
    label: "New Arrivals",
    note: "Just decanted this week",
    href: "/new-arrivals",
    image: "/images/editorial/niche.jpg",
  },
];

function getPromises(freeDeliveryThreshold: number, returnsDays: number) {
  return [
    { icon: BadgeCheck, title: "100% authentic", text: "Poured from sealed, full-sized bottles. Never dupes." },
    { icon: Droplets, title: "Hand-decanted", text: "Measured by hand in our Mombasa atelier." },
    { icon: Truck, title: "Free delivery", text: `Complimentary countrywide over ${formatMoney(freeDeliveryThreshold)}.` },
    { icon: RotateCcw, title: `${returnsDays}-day returns`, text: "Unopened decants, no questions asked." },
  ];
}

export default async function HomePage() {
  const [bestsellers, newArrivals, collections, allProducts, user, settings] = await Promise.all([
    getBestsellers(8),
    getNewArrivals(4),
    getCollections(),
    getAllProducts("store"),
    getCurrentUser(),
    getSettings(),
  ]);
  const wishlistIds = user ? getWishlistIds(user.id) : [];
  const bundles = allProducts.filter((p) => p.type === "bundle").slice(0, 3);
  const featureCollection = collections.find((c) => c.slug === "niche") ?? collections[0];
  const heroProduct = bestsellers[0];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <Image
            src="/images/editorial/hero.jpg"
            alt="A Maison du Scent perfume bottle in warm afternoon light"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/35 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10" />
        </div>

        <div className="shell relative flex min-h-[82vh] flex-col justify-end pb-12 pt-24 sm:min-h-[86vh] sm:pb-16 lg:min-h-[88vh] lg:pb-20">
          <div className="max-w-3xl text-cream">
            <p className="eyebrow text-cream/65 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <span className="h-px w-8 bg-gold-soft" /> Authentic perfume decants · Mombasa
            </p>
            <h1 className="display-hero mt-5 text-balance animate-fade-up" style={{ animationDelay: "160ms" }}>
              Every love story
              <br />
              has a <span className="italic text-gold-soft">perfume.</span>
            </h1>
            <p
              className="mt-6 max-w-lg text-[0.92rem] leading-relaxed text-cream/75 sm:text-base animate-fade-up"
              style={{ animationDelay: "260ms" }}
            >
              Designer and niche fragrances, hand-decanted in Mombasa. Try before you commit — in 2 ml, 5 ml, 8 ml and 30 ml.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "340ms" }}>
              <Link href="/best-sellers" className="btn btn-light">
                Shop best sellers <ArrowRight size={14} />
              </Link>
              <Link href="/find-my-scent" className="btn border border-cream/35 text-cream transition hover:bg-cream hover:text-ink">
                Find my scent
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-cream/15 pt-5 text-[0.62rem] uppercase tracking-[0.15em] text-cream/55 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <span className="flex items-center gap-2"><BadgeCheck size={13} className="text-gold-soft" /> 100% authentic</span>
              <span className="flex items-center gap-2"><Truck size={13} className="text-gold-soft" /> Free delivery over {formatMoney(settings.freeDeliveryThreshold)}</span>
              <span className="hidden items-center gap-2 sm:flex"><Sparkles size={13} className="text-gold-soft" /> Try before you commit</span>
            </div>
          </div>

          {heroProduct && (
            <Link
              href={`/perfumes/${heroProduct.slug}`}
              className="absolute bottom-20 right-8 hidden w-[15.5rem] items-center gap-3 border border-cream/20 bg-cream/10 p-3 backdrop-blur-md transition hover:bg-cream/15 xl:flex"
            >
              <span className="relative h-20 w-16 shrink-0 overflow-hidden">
                <Image src={heroProduct.image} alt={heroProduct.name} fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 text-cream">
                <span className="text-[0.5rem] uppercase tracking-[0.18em] text-cream/60">Most loved this week</span>
                <span className="mt-1 block truncate font-display text-lg leading-tight">{heroProduct.name}</span>
                <span className="mt-1 flex items-center gap-1 text-[0.6rem] text-cream/70">Shop from {formatMoney(heroProduct.price_2)} <ArrowUpRight size={11} /></span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Category cards */}
      <section className="shell -mt-1 pt-12 sm:pt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">Begin here</p>
            <h2 className="display-lg mt-2">Find your corner of the maison</h2>
          </div>
          <Link href="/perfumes" className="link-underline hidden text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink sm:inline-flex sm:items-center sm:gap-1.5">
            Shop all scents <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link key={category.label} href={category.href} className="img-zoom group relative aspect-[4/5] overflow-hidden bg-cream-deep sm:aspect-[3/4]">
              <Image
                src={category.image}
                alt={category.label}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-cream sm:p-5">
                <p className="text-[0.52rem] uppercase tracking-[0.18em] text-cream/60">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-display text-2xl leading-none sm:text-[1.7rem]">{category.label}</h3>
                <p className="mt-1.5 text-[0.64rem] text-cream/65">{category.note}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-cream/90">
                  Shop now <ArrowUpRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promise marquee */}
      <section className="mt-14 border-y border-line bg-cream-deep/50 py-3.5">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
            {[...Array(2)].map((_, group) => (
              <div key={group} className="flex items-center gap-10">
                {["100% Authentic", "Hand-decanted in Mombasa", "Try before you commit", `Free delivery over ${formatMoney(settings.freeDeliveryThreshold)}`, `${settings.returnsDays}-day returns`, "Real bottles. Real juice."].map((item) => (
                  <span key={`${group}-${item}`} className="flex items-center gap-10 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-stone">
                    {item} <span className="text-gold">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="shell pt-16 sm:pt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">The most loved</p>
            <h2 className="display-xl mt-2">Best sellers</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">
              Eight fragrances our clients return to, bottle after bottle. Start with a decant; fall in love with the dry-down.
            </p>
          </div>
          <Link href="/best-sellers" className="btn btn-outline btn-sm hidden shrink-0 sm:inline-flex">
            View all 8 <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={bestsellers} wishlistIds={wishlistIds} />
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/best-sellers" className="btn btn-outline">View all best sellers</Link>
        </div>
      </section>

      {/* Editorial split */}
      <section className="shell mt-20 sm:mt-28">
        <div className="grid items-stretch gap-0 overflow-hidden bg-parchment lg:grid-cols-2">
          <div className="relative min-h-[22rem] lg:min-h-[34rem]">
            <Image
              src="/images/editorial/perfumer.jpg"
              alt="A perfumer's table with glass vials and amber bottles"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 border border-cream/25 bg-ink/40 px-4 py-3 text-cream backdrop-blur-md">
              <p className="font-display text-3xl leading-none">1,200+</p>
              <p className="mt-1 text-[0.55rem] uppercase tracking-[0.16em] text-cream/65">Bottles decanted</p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
            <p className="eyebrow text-wine">Why decants</p>
            <h2 className="display-lg mt-4 text-balance">
              A full bottle is a commitment.<br />
              <span className="italic text-wine">A decant is a conversation.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-stone">
              Wear it to work. Wear it to dinner. Wear it in the rain. A decant lets you live with a scent before you decide it deserves a permanent place on your shelf — and lets you own a wardrobe of fragrances for the price of one bottle.
            </p>
            <ul className="mt-6 space-y-3 text-[0.82rem] text-ink-soft">
              {[
                "Poured by hand from sealed, authentic bottles",
                "2 ml ≈ 30 sprays · 8 ml ≈ 120 sprays",
                "Every order includes a mystery 2 ml sample",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-ink">Our story</Link>
              <Link href="/bundles" className="btn btn-outline">Shop discovery sets</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="mt-20 overflow-hidden sm:mt-28">
        <div className="shell flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">Shop by feeling</p>
            <h2 className="display-xl mt-2">The collections</h2>
          </div>
          <Link href="/collections" className="link-underline hidden text-[0.64rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex sm:items-center sm:gap-1.5">
            All collections <ArrowRight size={13} />
          </Link>
        </div>
        <div className="no-scrollbar mt-7 flex gap-4 overflow-x-auto px-5 pb-3 sm:px-10 lg:px-16">
          {collections.filter((c) => c.slug !== "gifting" && c.slug !== "accessories").map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group relative aspect-[3/4] w-[72vw] shrink-0 overflow-hidden bg-cream-deep sm:w-[17rem]">
              <Image src={collection.image} alt={collection.title} fill sizes="(max-width: 640px) 72vw, 272px" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <p className="text-[0.52rem] uppercase tracking-[0.17em] text-cream/60">{collection.subtitle}</p>
                <h3 className="mt-1 font-display text-[1.75rem] leading-none">{collection.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-cream/80 transition group-hover:text-cream">
                  Explore <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bundles */}
      <section className="shell mt-20 sm:mt-28">
        <div className="grid gap-8 bg-wine px-6 py-10 text-cream sm:px-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:px-14 lg:py-14">
          <div>
            <p className="eyebrow text-gold-soft">Build your own</p>
            <h2 className="display-xl mt-4 text-balance">
              Five scents.<br />
              <span className="italic text-gold-soft">One beautiful box.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-cream/70">
              Our discovery edits are the easiest way into the maison. Five 8 ml decants, packed by hand in a keepsake box — with a complimentary mystery sample.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/bundles" className="btn btn-light">Shop all bundles</Link>
              <a
                href={whatsappLink("Hello Maison du Scent, I'd like help building a custom bundle.", settings.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="btn border border-cream/35 text-cream hover:bg-cream hover:text-wine"
              >
                Build a custom set
              </a>
            </div>
            <p className="mt-5 text-[0.6rem] uppercase tracking-[0.14em] text-cream/45">Save 10% on every curated set</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {bundles.map((bundle) => (
              <Link key={bundle.id} href={`/perfumes/${bundle.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-cream-deep">
                <Image src={bundle.image} alt={bundle.name} fill sizes="(max-width: 640px) 100vw, 200px" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <p className="font-display text-lg leading-tight text-cream">{bundle.name}</p>
                  <p className="mt-1 text-[0.62rem] text-cream/60">From {formatMoney(bundle.price_30)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="shell mt-20 sm:mt-28">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-stone">Just decanted</p>
              <h2 className="display-xl mt-2">New arrivals</h2>
            </div>
            <Link href="/new-arrivals" className="btn btn-outline btn-sm hidden shrink-0 sm:inline-flex">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={newArrivals} wishlistIds={wishlistIds} />
          </div>
        </section>
      )}

      {/* Niche editorial */}
      {featureCollection && (
        <section className="mt-20 sm:mt-28">
          <div className="relative isolate overflow-hidden">
            <Image src={featureCollection.image} alt={featureCollection.title} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="shell relative flex min-h-[26rem] flex-col items-center justify-center py-20 text-center text-cream sm:min-h-[32rem]">
              <p className="eyebrow text-gold-soft">The Niche Room</p>
              <h2 className="display-xl mt-4 max-w-2xl text-balance">For the endlessly curious.</h2>
              <p className="mt-4 max-w-lg text-[0.9rem] leading-relaxed text-cream/70">
                Amouage, Xerjoff, Nishane, Byredo, Initio, Frédéric Malle — rare houses, singular points of view, poured by hand.
              </p>
              <Link href="/collections/niche" className="btn btn-light mt-7">
                Enter the room <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promises */}
      <section className="shell mt-20 sm:mt-28">
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {getPromises(settings.freeDeliveryThreshold, settings.returnsDays).map((promise) => (
            <div key={promise.title} className="bg-parchment px-6 py-8 text-center">
              <promise.icon size={22} strokeWidth={1.2} className="mx-auto text-wine" />
              <h3 className="mt-3 font-display text-xl">{promise.title}</h3>
              <p className="mt-1.5 text-[0.74rem] leading-relaxed text-stone">{promise.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-20 bg-cream-deep/60 py-16 sm:mt-28 sm:py-20">
        <div className="shell">
          <div className="text-center">
            <p className="eyebrow text-stone">In their words</p>
            <h2 className="display-xl mt-2">Loved, worn, repeated</h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Stars rating={4.9} size={13} />
              <span className="text-[0.7rem] text-stone">from 12,000+ orders</span>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <figure key={testimonial.name} className="flex flex-col bg-parchment p-6 sm:p-7">
                <Quote size={20} strokeWidth={1.2} className="text-gold" />
                <blockquote className="mt-4 flex-1 font-display text-[1.28rem] leading-[1.35] text-ink">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em]">{testimonial.name}</p>
                  <p className="mt-0.5 text-[0.65rem] text-stone">{testimonial.city} · {testimonial.scent}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Journal */}
      <section className="shell mt-20 sm:mt-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">Notes from the maison</p>
            <h2 className="display-xl mt-2">The Journal</h2>
          </div>
          <Link href="/journal" className="link-underline hidden text-[0.64rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex sm:items-center sm:gap-1.5">
            Read the journal <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-8 grid gap-7 sm:grid-cols-3">
          {journalArticles.slice(0, 3).map((article) => (
            <Link key={article.slug} href={`/journal/${article.slug}`} className="group">
              <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-cream-deep">
                <Image src={article.image} alt={article.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-wine">{article.category} · {article.read}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight transition group-hover:text-wine">{article.title}</h3>
              <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-stone">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Membership + newsletter */}
      <section className="shell mt-20 sm:mt-28">
        <div className="grid overflow-hidden bg-ink text-cream lg:grid-cols-2">
          <div className="relative min-h-[20rem]">
            <Image src="/images/editorial/membership.jpg" alt="Maison du Scent membership" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/30" />
          </div>
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="eyebrow text-gold-soft">Maison+ membership</p>
            <h2 className="display-lg mt-4 text-balance">
              The people who <span className="italic text-gold-soft">always smell good.</span>
            </h2>
            <p className="mt-4 text-[0.87rem] leading-relaxed text-cream/65">
              Member pricing, early access to new decants, a birthday 8 ml, and free delivery on every order. From KSh {settings.membershipPrice.toLocaleString("en-KE")} a year.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-[0.72rem] text-cream/70">
              {["10% member pricing", "Early access", "Free delivery", "Birthday scent"].map((perk) => (
                <span key={perk} className="flex items-center gap-2"><Gift size={13} className="text-gold-soft" /> {perk}</span>
              ))}
            </div>
            <Link href="/membership" className="btn btn-light mt-7">Explore membership</Link>
          </div>
        </div>
      </section>

      <section className="shell mt-16 pb-4">
        <div className="flex flex-col items-start justify-between gap-6 border-y border-line py-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-wine">The list</p>
            <h2 className="mt-2 font-display text-3xl leading-tight">New decants, quietly announced.</h2>
            <p className="mt-1 text-[0.8rem] text-stone">First access, private sales and notes worth reading. No noise.</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <NewsletterForm variant="panel" />
          </div>
        </div>
      </section>
    </>
  );
}
