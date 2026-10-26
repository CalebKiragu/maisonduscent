"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: { title: string; content: React.ReactNode }[];
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => (
        <div key={item.title}>
          <button
            onClick={() => setOpen(open === index ? null : index)}
            className="flex w-full items-center justify-between gap-4 py-4 text-left"
            aria-expanded={open === index}
          >
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.13em]">{item.title}</span>
            {open === index ? <Minus size={14} className="shrink-0 text-stone" /> : <Plus size={14} className="shrink-0 text-stone" />}
          </button>
          {open === index && <div className="animate-fade-in pb-5 text-[0.83rem] leading-relaxed text-stone">{item.content}</div>}
        </div>
      ))}
    </div>
  );
}

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, index) => (
        <div key={item.q}>
          <button onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={open === index}>
            <span className="font-display text-xl leading-tight">{item.q}</span>
            {open === index ? <Minus size={16} className="shrink-0 text-wine" /> : <Plus size={16} className="shrink-0 text-stone" />}
          </button>
          {open === index && <p className="animate-fade-in pb-5 pr-8 text-[0.86rem] leading-relaxed text-stone">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
