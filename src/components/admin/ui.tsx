import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import type { SeriesPoint } from "@/lib/analytics";
import { formatMoney, formatMoneyShort } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-wine">{eyebrow}</p> : null}
        <h1 className="mt-1.5 font-display text-3xl leading-none sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[0.78rem] leading-relaxed text-stone">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const positive = value > 0;
  const neutral = Math.abs(value) < 0.05;
  const Icon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 text-[0.62rem] font-medium ${neutral ? "text-stone" : positive ? "text-moss" : "text-rose-700"}`}>
      <Icon size={11} />
      {neutral ? "0" : `${positive ? "+" : ""}${value.toFixed(1)}`}%{suffix}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  change,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  change?: number;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-stone">{label}</p>
        {icon ? <span className="text-wine/60">{icon}</span> : null}
      </div>
      <p className="mt-3 font-display text-[2rem] leading-none tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {typeof change === "number" ? <Delta value={change} /> : null}
        {hint ? <span className="text-[0.62rem] text-stone">{hint}</span> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="admin-card group block p-4 transition hover:border-[#c9bda8] hover:shadow-[0_16px_40px_-30px_rgba(42,32,20,0.4)] sm:p-5">
        {body}
      </Link>
    );
  }
  return <div className="admin-card p-4 sm:p-5">{body}</div>;
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ddd0] px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-stone">{title}</h2>
          {description ? <p className="mt-1 text-[0.68rem] text-stone">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function RangeTabs({ basePath, days }: { basePath: string; days: number }) {
  const options = [
    { value: 7, label: "7D" },
    { value: 30, label: "30D" },
    { value: 90, label: "90D" },
  ];
  return (
    <div className="inline-flex border border-[#ddd4c4] bg-[#fffdf9] p-0.5">
      {options.map((option) => (
        <Link
          key={option.value}
          href={`${basePath}?days=${option.value}`}
          className={`px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition ${
            days === option.value ? "bg-ink text-cream" : "text-stone hover:text-ink"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-display text-xl">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-[0.74rem] leading-relaxed text-stone">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TrendChart({ points, metric }: { points: SeriesPoint[]; metric: "revenue" | "visitors" }) {
  const values = points.map((point) => (metric === "revenue" ? point.revenue : point.visitors));
  const max = Math.max(...values, 1);
  const width = 860;
  const height = 240;
  const pad = { top: 14, right: 12, bottom: 30, left: 46 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const xFor = (index: number) => pad.left + (points.length <= 1 ? 0 : (index / (points.length - 1)) * innerW);
  const yFor = (value: number) => pad.top + innerH - (value / max) * innerH;
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${xFor(index).toFixed(1)},${yFor(values[index]).toFixed(1)}`).join(" ");
  const area = `${line} L${xFor(points.length - 1).toFixed(1)},${pad.top + innerH} L${pad.left},${pad.top + innerH} Z`;
  const gridValues = [1, 0.66, 0.33, 0];
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const total = values.reduce((sum, value) => sum + value, 0);
  const peak = Math.max(...values);

  return (
    <div className="px-3 pb-3 pt-4 sm:px-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
        <div>
          <p className="font-display text-2xl leading-none">{metric === "revenue" ? formatMoney(total) : total.toLocaleString("en-KE")}</p>
          <p className="mt-1 text-[0.62rem] text-stone">{metric === "revenue" ? "Revenue in period" : "Visitors in period"}</p>
        </div>
        <p className="text-[0.62rem] text-stone">Peak {metric === "revenue" ? formatMoney(peak) : peak.toLocaleString("en-KE")}</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${metric} trend`}>
        <defs>
          <linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5d2030" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#5d2030" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridValues.map((fraction) => {
          const y = pad.top + innerH * (1 - fraction);
          return (
            <g key={fraction}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e4ddd0" strokeWidth="1" strokeDasharray={fraction === 0 ? "0" : "3 4"} />
              <text x={pad.left - 8} y={y + 3.5} textAnchor="end" fontSize="9" fill="#756e63">
                {metric === "revenue" ? formatMoneyShort(max * fraction) : Math.round(max * fraction).toLocaleString("en-KE")}
              </text>
            </g>
          );
        })}
        <path d={area} fill={`url(#area-${metric})`} />
        <path d={line} fill="none" stroke="#5d2030" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => {
          if (index % labelEvery !== 0 && index !== points.length - 1) return null;
          return (
            <text key={point.date} x={xFor(index)} y={height - 9} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} fontSize="9" fill="#756e63">
              {point.label}
            </text>
          );
        })}
        {points.map((point, index) => (
          <circle key={`dot-${point.date}`} cx={xFor(index)} cy={yFor(values[index])} r="6" fill="transparent">
            <title>{`${point.label}: ${metric === "revenue" ? formatMoney(point.revenue) : `${point.visitors} visitors`}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export function BarRow({ label, value, max, display, sub }: { label: string; value: number; max: number; display: string; sub?: string }) {
  const width = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[0.74rem]">{label}</p>
          <p className="shrink-0 text-[0.68rem] font-medium">{display}</p>
        </div>
        <div className="mt-1.5 h-1 w-full bg-[#eee7db]">
          <div className="h-full bg-wine/70" style={{ width: `${width}%` }} />
        </div>
        {sub ? <p className="mt-1 truncate text-[0.6rem] text-stone">{sub}</p> : null}
      </div>
    </div>
  );
}

export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-stone transition hover:text-ink">
      {children} <ArrowRight size={11} />
    </Link>
  );
}
