import Link from "next/link";

export function Logo({
  className = "",
  compact = false,
  tone = "dark",
}: {
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const wordmark = tone === "light" ? "text-cream" : "text-ink";
  const accent = tone === "light" ? "text-gold-soft" : "text-wine";
  const subline = tone === "light" ? "text-cream/55" : "text-stone";

  return (
    <Link href="/" aria-label="Maison du Scent — home" className={`group inline-flex flex-col leading-none ${className}`}>
      <span className={`font-display text-[1.65rem] tracking-[0.01em] sm:text-[1.85rem] ${wordmark}`}>
        Maison <span className={`italic ${accent}`}>du</span> Scent
      </span>
      {!compact && (
        <span className={`mt-1 text-[0.46rem] font-semibold uppercase tracking-[0.36em] ${subline}`}>
          Parfums · Mombasa
        </span>
      )}
    </Link>
  );
}
