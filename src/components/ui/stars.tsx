import { Star } from "lucide-react";

export function Stars({
  rating,
  size = 12,
  count,
  className = "",
}: {
  rating: number;
  size?: number;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-mist" strokeWidth={1.2} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-gold" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </span>
      <span className="text-[0.65rem] tracking-wide text-stone">
        {rating.toFixed(1)}
        {count !== undefined && <span className="ml-1 text-mist">({count.toLocaleString("en-KE")})</span>}
      </span>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
    </span>
  );
}
