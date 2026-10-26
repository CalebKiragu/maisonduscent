import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getAddresses } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/checkout-form";
import { Breadcrumbs } from "@/components/store/page-hero";

export const metadata: Metadata = { title: "Checkout", description: "Secure checkout at Maison du Scent." };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const addresses = user ? getAddresses(user.id) : [];
  return (
    <>
      <div className="shell pt-5"><Breadcrumbs items={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} /></div>
      <CheckoutForm
        user={user}
        addresses={addresses}
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
        deliveryFee={settings.deliveryFee}
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  );
}
