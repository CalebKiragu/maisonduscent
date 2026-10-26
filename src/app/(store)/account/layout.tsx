import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const member = user.membership_tier === "Circle" || user.membership_tier === "Maison+";

  return (
    <div className="shell py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="eyebrow text-wine">My account</p>
          <h1 className="display-lg mt-2">{user.name.split(" ")[0]}&apos;s Maison</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${member ? "border-wine/25 bg-wine/5 text-wine" : "border-line bg-parchment text-stone"}`}>
            {member ? `${user.membership_tier} member` : "Guest"}
          </span>
          <Link href="/best-sellers" className="btn btn-outline btn-sm hidden sm:inline-flex">Continue shopping</Link>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 hidden items-center gap-3 border border-line bg-parchment p-4 lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-wine font-display text-base text-cream">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.8rem] font-medium">{user.name}</p>
              <p className="truncate text-[0.66rem] text-stone">{user.email}</p>
            </div>
          </div>

          <AccountNav />

          <div className="mt-4 hidden border-t border-line pt-4 lg:block">
            <dl className="space-y-2 px-1 text-[0.68rem] text-stone">
              <div className="flex justify-between">
                <dt>Points</dt>
                <dd className="font-medium text-ink">{user.points.toLocaleString("en-KE")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Store credit</dt>
                <dd className="font-medium text-ink">KSh {user.store_credit.toLocaleString("en-KE")}</dd>
              </div>
            </dl>
            <form action={logoutAction} className="mt-4">
              <button type="submit" className="px-1 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-stone transition hover:text-wine">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="mt-7 min-w-0 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
