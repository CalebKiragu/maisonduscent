"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const options = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function SortSelect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";

  return (
    <label className="relative inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone">
      <ArrowUpDown size={13} />
      <span className="sr-only">Sort products</span>
      <select
        value={current}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value === "featured") params.delete("sort");
          else params.set("sort", event.target.value);
          const query = params.toString();
          router.push(`${basePath}${query ? `?${query}` : ""}`, { scroll: false });
        }}
        className="cursor-pointer appearance-none bg-transparent py-1 pr-5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
