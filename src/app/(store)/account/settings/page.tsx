import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, Gift, Sparkles, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { logoutAction } from "@/lib/actions/auth";
import { upgradeMembershipAction } from "@/lib/actions/account";
import { formatMoney } from "@/lib/utils";
import { ProfileForm, PasswordForm } from "@/components/account/settings-forms";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const metadata: Metadata = { title: "Account settings" };
export const dynamic = "force-dynamic";

const benefits = [
  { icon: Sparkles, label: "10% member pricing on every order" },
  { icon: Truck, label: "Free delivery, no minimum spend" },
  { icon: Gift, label: "Complimentary birthday 8 ml decant" },
  { icon: Crown, label: "Early access to new arrivals and drops" },
];

export default async function AccountSettingsPage({ searchParams }: { searchParams: Promise<{ upgrade?: string }> }) {
  const [user, { upgrade }, settings] = await Promise.all([requireUser(), searchParams, Promise.resolve(getSettings())]);
  const member = user.membership_tier === "Circle" || user.membership_tier === "Maison+";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Account settings</h2>
        <p className="mt-1 text-[0.74rem] text-stone">Your details, password and membership.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="border border-line bg-parchment p-5">
          <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Personal details</h3>
          <div className="mt-4"><ProfileForm user={user} /></div>
        </section>

        <section className="border border-line bg-parchment p-5">
          <h3 className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-stone">Password</h3>
          <p className="mt-2 text-[0.7rem] text-stone">Use at least 8 characters. You&apos;ll stay signed in on this device.</p>
          <div className="mt-4"><PasswordForm /></div>
        </section>
      </div>

      <section className="relative overflow-hidden border border-wine/20 bg-wine text-cream">
        <div className="absolute -right-10 -top-16 font-display text-[13rem] leading-none text-cream/5">+</div>
        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold-soft">{member ? `${user.membership_tier} membership` : "Maison+ membership"}</p>
            <h3 className="mt-2 font-display text-3xl">
              {member ? "Everything is unlocked." : `Join for ${formatMoney(settings.membershipPrice)} a year.`}
            </h3>
            <p className="mt-2 max-w-md text-[0.78rem] leading-relaxed text-cream/70">
              {member
                ? "Member pricing is applied automatically at checkout. Your points and store credit are shown in the account menu."
                : "If you order more than three times a year, Maison+ pays for itself — and the birthday decant is a genuinely lovely thing to receive."}
            </p>
            <dl className="mt-4 flex flex-wrap gap-6 text-[0.7rem]">
              <div>
                <dt className="text-cream/50">Points balance</dt>
                <dd className="mt-0.5 text-base text-cream">{user.points.toLocaleString("en-KE")}</dd>
              </div>
              <div>
                <dt className="text-cream/50">Store credit</dt>
                <dd className="mt-0.5 text-base text-cream">{formatMoney(user.store_credit)}</dd>
              </div>
            </dl>

            {upgrade === "done" ? (
              <p className="mt-4 flex items-center gap-2 border border-cream/25 bg-cream/10 px-3 py-2 text-[0.74rem]">
                <Check size={14} className="text-gold-soft" /> Welcome to Maison+. Your member pricing is now active.
              </p>
            ) : null}
            {upgrade === "active" ? (
              <p className="mt-4 border border-cream/25 bg-cream/10 px-3 py-2 text-[0.74rem]">Your membership is already active.</p>
            ) : null}
            {upgrade === "1" && !member ? (
              <form action={upgradeMembershipAction} className="mt-4">
                <ConfirmButton
                  message={`Activate Maison+ for ${formatMoney(settings.membershipPrice)}? The fee is deducted from your store credit where available.`}
                  className="btn btn-light btn-sm"
                >
                  Activate membership
                </ConfirmButton>
                <p className="mt-2 text-[0.64rem] text-cream/50">No auto-renewal. Cancel anytime.</p>
              </form>
            ) : null}
          </div>

          <ul className="space-y-2.5">
            {benefits.map((benefit) => (
              <li key={benefit.label} className="flex items-center gap-2.5 text-[0.76rem] text-cream/80">
                <benefit.icon size={15} strokeWidth={1.4} className="shrink-0 text-gold-soft" /> {benefit.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-parchment px-5 py-4">
        <div>
          <p className="text-[0.78rem] font-medium">Sign out of this device</p>
          <p className="mt-0.5 text-[0.68rem] text-stone">Your bag on this device will be kept for next time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/membership" className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">Membership details</Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-outline btn-sm">Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );
}
