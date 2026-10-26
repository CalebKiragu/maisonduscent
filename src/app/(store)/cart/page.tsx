import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CartPage } from "@/components/store/cart-page";
import { Breadcrumbs } from "@/components/store/page-hero";

export const metadata: Metadata = { title: "Your bag", description: "Review your Maison du Scent selection before checkout." };

export default async function CartRoute() {
  const settings = await getSettings();
  return (
    <>
      <div className="shell pt-5"><Breadcrumbs items={[{ label: "Your bag" }]} /></div>
      <CartPage
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
        deliveryFee={settings.deliveryFee}
        whatsappNumber={settings.whatsappNumber}
      />
    </>
  );
}
