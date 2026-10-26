import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, Heart, MapPin, Package, Sparkles, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAddresses, getUserOrders, getWishlistProducts } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, wishlist, addresses] = await Promise.all([
    Promise.resolve(getUserOrders(user.id)),
    Promise.resolve(getWishlistProducts(user.id)),
    Promise.resolve(getAddresses(user.id)),
  ]);

  const paid = orders.filter((order) => order.payment_status === "paid");
  const spent = paid.reduce((sum, order) => sum + order.total, 0);
  const active = orders.filter((order) => ["pending", "confirmed", "packing", "ready", "out_for_delivery"].includes(order.status));
  const member = user.membership_tier === "Circle" || user.membership_tier === "Maison+";
  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];
  const recent = orders.slice(0, 4);

  const stats = [
    { label: "Orders placed", value: String(orders.length), icon: Package },
    { label: "On the way", value: String(active.length), icon: Sparkles },
    { label: "Lifetime spend", value: formatMoney(spent), icon: Wallet },
    { label: "Maison points", value: user.points.toLocaleString("en-KE"), icon: Gift },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-parchment p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.57rem] font-semibold uppercase tracking-[0.15em] text-stone">{stat.label}</p>
              <stat.icon size={15} strokeWidth={1.4} className="text-wine/70" />
            </div>
            <p className="mt-3 font-display text-3xl leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Recent orders</h2>
            <p className="mt-1 text-[0.74rem] text-stone">Track packing, dispatch and delivery in real time.</p>
          </div>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">
            All orders <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length ? (
          <div className="mt-4 divide-y divide-line border border-line bg-parchment">
            {recent.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.order_number}`} className="flex flex-wrap items-center gap-3 px-4 py-4 transition hover:bg-cream-deep/40 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8rem] font-medium">{order.order_number}</p>
                  <p className="mt-0.5 text-[0.66rem] text-stone">
                    {formatDate(order.created_at)} · Delivering to {order.city}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
                <p className="w-24 text-right text-[0.8rem] font-medium">{formatMoney(order.total)}</p>
                <ArrowRight size={14} className="hidden text-mist sm:block" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 border border-dashed border-line bg-parchment/60 px-6 py-10 text-center">
            <Package size={22} strokeWidth={1.2} className="mx-auto text-mist" />
            <p className="mt-3 text-[0.85rem]">No orders yet.</p>
            <p className="mt-1 text-[0.72rem] text-stone">Start with a 2 ml decant — it is the easiest way to find your signature.</p>
            <Link href="/best-sellers" className="btn btn-ink btn-sm mt-4">Shop best sellers</Link>
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="border border-line bg-parchment p-5">
          <div className="flex items-start justify-between">
            <h2 className="font-display text-xl">Default delivery</h2>
            <MapPin size={16} strokeWidth={1.4} className="text-wine/70" />
          </div>
          {defaultAddress ? (
            <>
              <p className="mt-3 text-[0.8rem] font-medium">{defaultAddress.label}</p>
              <p className="mt-1 text-[0.76rem] leading-relaxed text-stone">
                {defaultAddress.line1}
                {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}
                <br />
                {defaultAddress.city} · {defaultAddress.phone}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[0.76rem] leading-relaxed text-stone">Save an address for faster checkout.</p>
          )}
          <Link href="/account/addresses" className="mt-4 inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-wine hover:text-ink">
            Manage addresses <ArrowRight size={12} />
          </Link>
        </section>

        <section className="relative overflow-hidden border border-wine/20 bg-wine p-5 text-cream">
          <div className="absolute -right-6 -top-8 font-display text-[9rem] text-cream/5">+</div>
          <div className="relative">
            <p className="eyebrow text-gold-soft">{member ? `${user.membership_tier} membership` : "Maison+"}</p>
            <h2 className="mt-2 font-display text-2xl">
              {member ? "Your privileges are active." : "Ten percent, every order."}
            </h2>
            <p className="mt-2 max-w-sm text-[0.74rem] leading-relaxed text-cream/70">
              {member
                ? `You have ${user.points.toLocaleString("en-KE")} points and ${formatMoney(user.store_credit)} in store credit. Member pricing is applied automatically at checkout.`
                : "Join Maison+ for member pricing, early access, free delivery and a birthday decant."}
            </p>
            <Link href={member ? "/membership" : "/account/settings?upgrade=1"} className="btn btn-light btn-sm mt-4">
              {member ? "View benefits" : "Upgrade membership"}
            </Link>
          </div>
        </section>
      </div>

      {wishlist.length ? (
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">Your wishlist</h2>
              <p className="mt-1 text-[0.74rem] text-stone">The ones you keep coming back to.</p>
            </div>
            <Link href="/account/wishlist" className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-ink">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {wishlist.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} wishlisted compact />
            ))}
          </div>
        </section>
      ) : (
        <section className="border border-line bg-cream-deep/30 px-5 py-6">
          <div className="flex items-start gap-3">
            <Heart size={17} strokeWidth={1.4} className="mt-0.5 text-wine" />
            <div>
              <p className="text-[0.85rem] font-medium">Nothing saved yet</p>
              <p className="mt-1 text-[0.74rem] text-stone">Tap the heart on any scent to keep it here for later.</p>
              <Link href="/perfumes" className="btn btn-outline btn-sm mt-3">Browse the collection</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
