"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatMoney, getVariants, startingPrice, whatsappLink } from "@/lib/utils";
import { trackEvent } from "./cart-provider";

type Answer = "her" | "him" | "any" | "fresh" | "warm" | "floral" | "woody" | "everyday" | "evening" | "office" | "date" | "close" | "noticeable" | "statement";

const questions: {
  key: string;
  eyebrow: string;
  title: string;
  helper: string;
  options: { value: Answer; label: string; note: string }[];
}[] = [
  {
    key: "who",
    eyebrow: "01 — For whom",
    title: "Who is this scent for?",
    helper: "We'll lean the edit toward the right side of the library.",
    options: [
      { value: "her", label: "For her", note: "Feminine signatures" },
      { value: "him", label: "For him", note: "Masculine signatures" },
      { value: "any", label: "Anyone", note: "Open to everything" },
    ],
  },
  {
    key: "mood",
    eyebrow: "02 — The feeling",
    title: "What should it feel like?",
    helper: "Think of the impression left in a room, not the ingredient list.",
    options: [
      { value: "fresh", label: "Fresh & clean", note: "Citrus, tea, white musk" },
      { value: "floral", label: "Floral & romantic", note: "Rose, peony, jasmine" },
      { value: "woody", label: "Woody & grounded", note: "Cedar, oud, vetiver" },
      { value: "warm", label: "Warm & amber", note: "Vanilla, spice, resin" },
    ],
  },
  {
    key: "occasion",
    eyebrow: "03 — The occasion",
    title: "When will you wear it most?",
    helper: "The same perfume reads differently at 9am and 9pm.",
    options: [
      { value: "everyday", label: "Every day", note: "A new signature" },
      { value: "office", label: "Work", note: "Close-wearing, composed" },
      { value: "date", label: "Date night", note: "Compliment bait" },
      { value: "evening", label: "Evenings out", note: "After dark" },
    ],
  },
  {
    key: "intensity",
    eyebrow: "04 — The presence",
    title: "How much space should it take?",
    helper: "There is no wrong answer — only a different kind of confidence.",
    options: [
      { value: "close", label: "Close to the skin", note: "Only for those who lean in" },
      { value: "noticeable", label: "Noticeable", note: "A beautiful arm's length" },
      { value: "statement", label: "A statement", note: "They will remember you" },
    ],
  },
];

export function ScentQuiz({ products, whatsappNumber }: { products: Product[]; whatsappNumber: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<string, Answer>>>({});
  const done = step >= questions.length;

  const results = useMemo(() => {
    if (!done) return [];
    const scored = products.map((product) => {
      let score = product.rating * 2;
      const family = product.family.toLowerCase();
      const collections = product.collections.join(" ");
      const notes = [...product.top_notes, ...product.heart_notes, ...product.base_notes].join(" ").toLowerCase();

      if (answers.who === "her" && product.gender === "her") score += 8;
      if (answers.who === "him" && product.gender === "him") score += 8;
      if (answers.who === "any" && product.gender === "unisex") score += 5;
      if (answers.who !== "any" && product.gender === "unisex") score += 3;

      if (answers.mood === "floral" && /floral|rose|jasmine|peony/.test(`${family} ${notes}`)) score += 10;
      if (answers.mood === "woody" && /woody|oud|cedar|sandalwood|vetiver/.test(`${family} ${notes}`)) score += 10;
      if (answers.mood === "warm" && /amber|vanilla|spice|gourmand|warm/.test(`${family} ${notes}`)) score += 10;
      if (answers.mood === "fresh" && /fresh|citrus|aquatic|clean|aromatic|green/.test(`${family} ${notes}`)) score += 10;

      if (answers.occasion === "date" && collections.includes("date-night")) score += 7;
      if (answers.occasion === "office" && collections.includes("office")) score += 7;
      if (answers.occasion === "evening" && collections.includes("evening")) score += 7;
      if (answers.occasion === "everyday" && (collections.includes("clean") || collections.includes("office"))) score += 5;

      if (answers.intensity === "close" && (collections.includes("clean") || collections.includes("office"))) score += 5;
      if (answers.intensity === "noticeable" && (collections.includes("date-night") || collections.includes("floral"))) score += 4;
      if (answers.intensity === "statement" && (collections.includes("evening") || collections.includes("niche"))) score += 5;

      if (product.bestseller) score += 2;
      return { product, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.product);
  }, [answers, done, products]);

  function choose(value: Answer) {
    const key = questions[step].key;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step + 1 >= questions.length) {
      trackEvent("quiz_completed", { answers: next });
    }
    setTimeout(() => setStep(step + 1), 180);
  }

  function reset() {
    setStep(0);
    setAnswers({});
  }

  if (done) {
    return (
      <div className="animate-fade-up">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
            <Sparkles size={20} strokeWidth={1.4} />
          </span>
          <p className="eyebrow mt-4 text-wine">Your edit</p>
          <h2 className="display-lg mt-2">Three scents, chosen for you.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[0.86rem] leading-relaxed text-stone">
            Based on your answers, this is where we would start. Try all three in 2 ml before committing to a larger decant.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {results.map((product, index) => {
            const variants = getVariants(product);
            return (
              <div key={product.id} className="border border-line bg-parchment">
                <Link href={`/perfumes/${product.slug}`} className="group block">
                  <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-cream-deep">
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    <span className="absolute left-3 top-3 bg-parchment/95 px-2 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-wine">
                      {index === 0 ? "Best match" : `Match 0${index + 1}`}
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone">{product.brand}</p>
                  <Link href={`/perfumes/${product.slug}`} className="mt-1 block font-display text-xl leading-tight hover:text-wine">{product.name}</Link>
                  <p className="mt-1.5 line-clamp-2 text-[0.74rem] leading-relaxed text-stone">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[0.72rem]">From {formatMoney(startingPrice(product))}</span>
                    <Link href={`/perfumes/${product.slug}`} className="inline-flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-wine">
                      {variants.length} sizes <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink("Hello Maison du Scent, I took the scent quiz and would love help choosing between my matches.", whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-wine"
          >
            <MessageCircle size={14} /> Ask the maison
          </a>
          <button onClick={reset} className="btn btn-outline">
            <RotateCcw size={14} /> Start again
          </button>
        </div>
        <p className="mt-4 text-center text-[0.62rem] text-stone">
          Tip: order 2 ml of all three. Your nose will know within a week.
        </p>
      </div>
    );
  }

  const question = questions[step];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="h-1 flex-1 bg-line">
          <div className="h-full bg-wine transition-all duration-500" style={{ width: `${(step / questions.length) * 100}%` }} />
        </div>
        <span className="text-[0.58rem] uppercase tracking-[0.13em] text-stone">{step + 1} / {questions.length}</span>
      </div>

      <div key={step} className="animate-fade-up mt-8">
        <p className="eyebrow text-wine">{question.eyebrow}</p>
        <h2 className="display-lg mt-3">{question.title}</h2>
        <p className="mt-2 text-[0.83rem] text-stone">{question.helper}</p>
        <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option) => {
            const active = answers[question.key] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => choose(option.value)}
                className={`flex items-center justify-between gap-4 border px-5 py-4 text-left transition ${active ? "border-wine bg-wine text-cream" : "border-line bg-parchment hover:border-ink/40 hover:bg-cream-deep/40"}`}
              >
                <span>
                  <span className="block font-display text-xl leading-tight">{option.label}</span>
                  <span className={`mt-0.5 block text-[0.68rem] ${active ? "text-cream/65" : "text-stone"}`}>{option.note}</span>
                </span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${active ? "border-cream/40 bg-cream/10" : "border-line"}`}>
                  {active ? <Check size={12} /> : <ArrowRight size={12} className="text-stone" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-stone disabled:opacity-30"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <span className="text-[0.6rem] text-stone">Takes about 40 seconds</span>
      </div>
    </div>
  );
}
