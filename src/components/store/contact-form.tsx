"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to send");
      setState("done");
      setMessage(data.message ?? "Message received.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to send");
    }
  }

  if (state === "done") {
    return (
      <div className="border border-line bg-parchment p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss"><Check size={20} /></span>
        <h3 className="mt-4 font-display text-2xl">Message received</h3>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-stone">{message} We reply within one working day — usually much sooner on WhatsApp.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">Name</label>
          <input id="contact-name" name="name" required className="field" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">Email</label>
          <input id="contact-email" name="email" type="email" required className="field" placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="label">Subject</label>
        <select id="contact-subject" name="subject" className="field">
          <option>General question</option>
          <option>Order help</option>
          <option>Corporate gifting</option>
          <option>Wholesale</option>
          <option>Press</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="label">Message</label>
        <textarea id="contact-message" name="message" required rows={5} className="field resize-y" placeholder="How can we help?" />
      </div>
      {state === "error" && <p className="text-[0.75rem] text-rose-700">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-wine w-full sm:w-auto">
        {state === "sending" ? "Sending…" : <><Send size={14} /> Send message</>}
      </button>
    </form>
  );
}
