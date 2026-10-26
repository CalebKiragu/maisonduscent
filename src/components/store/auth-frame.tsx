import Image from "next/image";
import Link from "next/link";

export function AuthFrame({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  quote,
  quoteBy,
  children,
  admin = false,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  quote: string;
  quoteBy: string;
  children: React.ReactNode;
  admin?: boolean;
}) {
  return (
    <section className="lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image src={image} alt={imageAlt} fill priority sizes="52vw" className="object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <p className="font-display text-3xl leading-tight text-cream xl:text-4xl">&ldquo;{quote}&rdquo;</p>
          <p className="mt-4 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold-soft">{quoteBy}</p>
        </div>
        <Link href="/" className="absolute left-10 top-10 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-cream/70 transition hover:text-cream xl:left-14">
          Maison du Scent
        </Link>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
        <div className="w-full max-w-md">
          <p className={`eyebrow ${admin ? "text-gold" : "text-wine"}`}>{eyebrow}</p>
          <h1 className="display-xl mt-3 text-balance">{title}</h1>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-stone">{lead}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
