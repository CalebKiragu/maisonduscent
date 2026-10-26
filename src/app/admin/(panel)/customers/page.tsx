import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Search, UserRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCustomers, getDashboardCustomerCount } from "@/lib/queries";
import { formatDate, formatMoney, initials } from "@/lib/utils";
import { CustomerForm } from "@/components/admin/customer-form";
import { AdminPageHeader, EmptyState, KpiCard, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  const q = (query.q ?? "").trim().toLowerCase();
  const customers = getCustomers();
  const counts = getDashboardCustomerCount();
  const filtered = customers.filter((customer) =>
    q ? `${customer.user.name} ${customer.user.email} ${customer.user.phone ?? ""}`.toLowerCase().includes(q) : true,
  );
  const members = customers.filter((customer) => ["Circle", "Maison+"].includes(customer.user.membership_tier)).length;
  const totalSpent = customers.reduce((sum, customer) => sum + customer.spent, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Relationships"
        title="Customers"
        description="Membership status, lifetime value and contact details. Adjust tiers, points and store credit for any member."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Customers" value={String(counts.total)} hint={`${counts.newThisMonth} joined this month`} icon={<UserRound size={15} />} />
        <KpiCard label="Members" value={String(members)} hint="Circle or Maison+" />
        <KpiCard label="Lifetime revenue" value={formatMoney(totalSpent)} hint="paid orders only" />
        <KpiCard label="Average value" value={formatMoney(customers.length ? totalSpent / customers.length : 0)} hint="per customer" />
      </div>

      <div className="mt-4">
        <Panel
          title={`${filtered.length} customers`}
          description="Sorted by lifetime spend"
          action={
            <form method="get" className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 border border-[#ddd4c4] bg-[#fffdf9] px-2.5 py-1.5">
                <Search size={13} className="text-stone" />
                <input name="q" defaultValue={query.q ?? ""} placeholder="Name, email or phone" className="w-32 bg-transparent text-[0.72rem] outline-none sm:w-44" />
              </label>
              <button type="submit" className="btn btn-outline btn-sm">Search</button>
            </form>
          }
        >
          {filtered.length ? (
            <div className="grid gap-px bg-[#eee7db] md:grid-cols-2">
              {filtered.map((customer) => (
                <article key={customer.user.id} className="bg-[#fffdf9] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wine/10 font-display text-base text-wine">
                      {initials(customer.user.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[0.84rem] font-medium">{customer.user.name}</p>
                        <span className={`badge ${["Circle", "Maison+"].includes(customer.user.membership_tier) ? "border-wine/25 bg-wine/5 text-wine" : "border-[#e4ddd0] bg-[#faf7f1] text-stone"}`}>
                          {customer.user.membership_tier}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[0.68rem] text-stone">{customer.user.email}</p>
                      <p className="text-[0.66rem] text-stone">{customer.user.phone ?? "No phone"}</p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[#eee7db] pt-3 text-[0.66rem]">
                    <div>
                      <dt className="text-stone">Orders</dt>
                      <dd className="mt-0.5 font-medium">{customer.orderCount}</dd>
                    </div>
                    <div>
                      <dt className="text-stone">Spent</dt>
                      <dd className="mt-0.5 font-medium">{formatMoney(customer.spent)}</dd>
                    </div>
                    <div>
                      <dt className="text-stone">Last order</dt>
                      <dd className="mt-0.5 font-medium">{customer.lastOrder ? formatDate(customer.lastOrder) : "—"}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.1em]">
                    <a href={`mailto:${customer.user.email}`} className="inline-flex items-center gap-1 text-stone hover:text-ink"><Mail size={12} /> Email</a>
                    <Link href={`/admin/orders?q=${encodeURIComponent(customer.user.email)}`} className="text-stone hover:text-ink">Orders</Link>
                    <span className="ml-auto text-[0.6rem] font-normal normal-case tracking-normal text-mist">Joined {formatDate(customer.user.created_at)}</span>
                  </div>

                  <details className="mt-1">
                    <summary className="mt-2 cursor-pointer text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-wine">Manage customer</summary>
                    <CustomerForm customer={customer} />
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No customers found" description="Try a different search term." action={<Link href="/admin/customers" className="btn btn-outline btn-sm">Clear search</Link>} />
          )}
        </Panel>
      </div>
    </>
  );
}
