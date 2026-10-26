"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "footer" | "panel" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <p className={`mt-4 flex items-center gap-2 text-[0.72rem] ${variant === "footer" ? "text-gold-soft" : "text-moss"}`}>
        <Check size={14} /> {message}
      </p>
    );
  }

  const dark = variant === "footer";
  return (
    <form onSubmit={submit} className="mt-4">
      <div className={`flex items-center border-b ${dark ? "border-cream/25" : "border-ink/25"}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className={`w-full bg-transparent py-2.5 text-[0.8rem] outline-none ${dark ? "text-cream placeholder:text-cream/35" : "text-ink placeholder:text-stone/70"}`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          aria-label="Subscribe"
          className={`flex h-9 w-9 shrink-0 items-center justify-center transition ${dark ? "text-cream/70 hover:text-cream" : "text-ink hover:text-wine"}`}
        >
          <ArrowRight size={15} />
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-[0.68rem] text-rose-500">{message}</p>}
      <p className={`mt-2 text-[0.58rem] ${dark ? "text-cream/35" : "text-stone"}`}>
        By subscribing you agree to our privacy policy. Unsubscribe anytime.
      </p>
    </form>
  );
}
