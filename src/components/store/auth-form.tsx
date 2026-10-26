"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { adminLoginAction, loginAction, registerAction, type AuthState } from "@/lib/actions/auth";

type Mode = "login" | "register" | "admin";

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to the Maison",
    lead: "Your orders, wishlist and member privileges, all in one place.",
    submit: "Sign in",
    switchText: "New to Maison du Scent?",
    switchLabel: "Create an account",
    switchHref: "/register",
  },
  register: {
    eyebrow: "Join the Maison",
    title: "Create your account",
    lead: "Save your favourite decants, track orders and unlock member pricing.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
  admin: {
    eyebrow: "Maison operations",
    title: "Admin sign in",
    lead: "Manage orders, inventory, collections and store performance.",
    submit: "Enter dashboard",
    switchText: "Storefront customer?",
    switchLabel: "Customer sign in",
    switchHref: "/login",
  },
} satisfies Record<Mode, Record<string, string>>;

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const action = mode === "register" ? registerAction : mode === "admin" ? adminLoginAction : loginAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const labels = copy[mode];

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === "register" ? (
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" autoComplete="name" required className="field" placeholder="Amara Njoroge" />
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder={mode === "admin" ? "admin@maisonduscent.com" : "you@example.com"}
        />
      </div>

      {mode === "register" ? (
        <div>
          <label className="label" htmlFor="phone">Phone <span className="normal-case tracking-normal text-mist">(optional)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" placeholder="+254 7xx xxx xxx" />
        </div>
      ) : null}

      <div>
        <div className="flex items-baseline justify-between">
          <label className="label" htmlFor="password">Password</label>
          {mode === "login" ? (
            <span className="mb-1 text-[0.62rem] text-stone">At least 8 characters</span>
          ) : null}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
          className="field"
          placeholder="••••••••"
        />
      </div>

      {mode === "register" ? (
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className="field" placeholder="••••••••" />
        </div>
      ) : null}

      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2.5 text-[0.78rem] text-rose-800" role="alert">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-ink w-full disabled:opacity-60">
        {pending ? "Please wait…" : labels.submit}
        {!pending ? <ArrowRight size={14} /> : null}
      </button>

      {mode === "register" ? (
        <p className="text-[0.68rem] leading-relaxed text-stone">
          By creating an account you agree to our <Link href="/terms" className="underline hover:text-ink">terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-ink">privacy policy</Link>.
        </p>
      ) : null}

      <p className="border-t border-line pt-4 text-center text-[0.75rem] text-stone">
        {labels.switchText}{" "}
        <Link href={labels.switchHref} className="font-medium text-wine underline underline-offset-4 hover:text-ink">
          {labels.switchLabel}
        </Link>
      </p>
    </form>
  );
}
