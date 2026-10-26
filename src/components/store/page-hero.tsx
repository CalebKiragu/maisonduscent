import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.13em] text-stone">
      <Link href="/" className="transition hover:text-ink">Home</Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          <ChevronRight size={10} className="text-mist" />
          {item.href ? (
            <Link href={item.href} className="transition hover:text-ink">{item.label}</Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  breadcrumbs,
  align = "left",
  height = "medium",
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  image?: string;
  imageAlt?: string;
  breadcrumbs?: { label: string; href?: string }[];
  align?: "left" | "center";
  height?: "short" | "medium" | "tall";
  children?: React.ReactNode;
}) {
  const heights = {
    short: "min-h-[15rem] sm:min-h-[17rem]",
    medium: "min-h-[20rem] sm:min-h-[24rem]",
    tall: "min-h-[26rem] sm:min-h-[32rem]",
  };
  return (
    <section className="border-b border-line bg-cream">
      <div className="shell">
        {breadcrumbs && <div className="pt-5">{<Breadcrumbs items={breadcrumbs} />}</div>}
        <div className={`grid items-center gap-8 py-10 sm:py-14 ${image ? "lg:grid-cols-[1.1fr_0.9fr]" : ""} ${heights[height]}`}>
          <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
            {eyebrow && <p className="eyebrow text-wine">{eyebrow}</p>}
            <h1 className="display-xl mt-4 text-balance">{title}</h1>
            {description && (
              <p className={`mt-5 max-w-xl text-[0.9rem] leading-relaxed text-stone ${align === "center" ? "mx-auto" : ""}`}>
                {description}
              </p>
            )}
            {children && <div className={`mt-6 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>{children}</div>}
          </div>
          {image && (
            <div className="relative hidden aspect-[4/3] overflow-hidden bg-cream-deep lg:block">
              <Image src={image} alt={imageAlt ?? ""} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  action?: { label: string; href: string };
  center?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${center ? "text-center sm:flex-col sm:items-center" : ""}`}>
      <div className={center ? "mx-auto max-w-2xl" : ""}>
        {eyebrow && <p className="eyebrow text-stone">{eyebrow}</p>}
        <h2 className="display-lg mt-2 text-balance">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-[0.86rem] leading-relaxed text-stone">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="link-underline inline-flex w-fit items-center gap-1.5 text-[0.63rem] font-semibold uppercase tracking-[0.14em]">
          {action.label} <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}
