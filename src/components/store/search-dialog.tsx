"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { trackEvent } from "./cart-provider";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
        if (res.ok) {
          const data = (await res.json()) as { products: Product[] };
          setResults(data.products ?? []);
        }
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query, open]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackEvent("search", { query: q });
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className={`fixed inset-0 z-[130] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[3px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute left-0 right-0 top-0 bg-cream shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="shell py-5 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow text-stone">Search the maison</p>
            <button onClick={onClose} aria-label="Close search" className="text-stone transition hover:text-ink">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={submit} className="mt-5 flex items-center gap-3 border-b border-ink pb-2">
            <Search size={20} strokeWidth={1.4} className="text-stone" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “Delina”, “oud”, “date night”…"
              className="w-full bg-transparent py-2 font-display text-2xl outline-none placeholder:text-mist sm:text-3xl"
              aria-label="Search products"
            />
            <button type="submit" className="shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone hover:text-ink">
              Search
            </button>
          </form>

          <div className="min-h-[4rem] pt-5">
            {loading && <p className="text-sm text-stone">Searching…</p>}
            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="text-sm text-stone">
                No matches for “{query.trim()}”. Try a brand, note or mood — or{" "}
                <Link href="/find-my-scent" onClick={onClose} className="text-wine underline underline-offset-4">
                  take the scent quiz
                </Link>
                .
              </div>
            )}
            {results.length > 0 && (
              <div className="grid gap-6 md:grid-cols-[1fr_15rem]">
                <div className="grid gap-1 sm:grid-cols-2">
                  {results.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/perfumes/${product.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-3 p-2 transition hover:bg-parchment"
                    >
                      <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-deep">
                        <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.52rem] font-semibold uppercase tracking-[0.15em] text-stone">{product.brand}</span>
                        <span className="block truncate font-display text-lg leading-tight group-hover:text-wine">{product.name}</span>
                        <span className="mt-0.5 block text-[0.68rem] text-stone">From {formatMoney(product.price_2 || product.price_5 || product.price_8)}</span>
                      </span>
                    </Link>
                  ))}
                  <Link href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={onClose} className="flex items-center gap-2 p-2 text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-wine">
                    See all results <ArrowRight size={13} />
                  </Link>
                </div>
                <div className="hidden md:block">
                  <p className="eyebrow mb-3 text-stone">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Delina", "Baccarat", "Oud", "Vanilla", "Fresh", "Gift"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="chip"
                        type="button"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {query.trim().length < 2 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone">
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink">Popular</span>
                {["Delina", "Baccarat Rouge", "Aventus", "Oud Wood", "Vanilla", "Gift sets"].map((term) => (
                  <button key={term} type="button" onClick={() => setQuery(term)} className="link-underline text-[0.82rem]">
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
