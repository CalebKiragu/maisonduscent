import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsAppFloat } from "@/components/store/whatsapp-float";
import { AnalyticsTracker } from "@/components/store/analytics-tracker";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader
        announcement={settings.announcement}
        loggedIn={Boolean(user)}
        userName={user?.name ?? null}
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
        whatsappNumber={settings.whatsappNumber}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <CartDrawer freeDeliveryThreshold={settings.freeDeliveryThreshold} whatsappNumber={settings.whatsappNumber} />
      <WhatsAppFloat phone={settings.whatsappNumber} />
      <AnalyticsTracker />
    </div>
  );
}
