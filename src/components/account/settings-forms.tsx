"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { User } from "@/lib/types";
import { changePasswordAction, updateProfileAction, type FormState } from "@/lib/actions/account";

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" required defaultValue={user.name} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input id="email" value={user.email} readOnly disabled className="field opacity-60" />
        <p className="mt-1 text-[0.62rem] text-stone">Contact us on WhatsApp to change your email address.</p>
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="field" placeholder="+254 7xx xxx xxx" />
      </div>
      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-[0.74rem] text-rose-800" role="alert">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.74rem] text-emerald-800" role="status">
          <Check size={13} /> {state.success}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">{pending ? "Saving…" : "Save details"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="current">Current password</label>
        <input id="current" name="current" type="password" autoComplete="current-password" required className="field" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm new password</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className="field" />
        </div>
      </div>
      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-[0.74rem] text-rose-800" role="alert">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.74rem] text-emerald-800" role="status">
          <Check size={13} /> {state.success}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-outline btn-sm disabled:opacity-60">{pending ? "Updating…" : "Change password"}</button>
    </form>
  );
}
