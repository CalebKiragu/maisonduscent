import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-provider";
import { isPreview } from "@/lib/preview";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const preview = isPreview();
  const freeDelivery = formatMoney(settings.freeDeliveryThreshold);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: "Maison du Scent — Authentic Perfume Decants, Mombasa",
      template: "%s | Maison du Scent",
    },
    description: `Authentic designer and niche perfume decants, hand-poured in Mombasa. Try before you commit in 2 ml, 5 ml, 8 ml and 30 ml sizes. Free delivery over ${freeDelivery}.`,
    keywords: [
      "perfume decants Kenya",
      "authentic perfume Mombasa",
      "designer perfume samples",
      "niche fragrance Kenya",
      "Maison du Scent",
    ],
    openGraph: {
      title: "Maison du Scent — Every love story has a perfume",
      description: `Authentic designer and niche fragrances, hand-decanted in Mombasa. Discovery sets, travel atomizers and free delivery over ${freeDelivery}.`,
      type: "website",
      locale: "en_KE",
      siteName: "Maison du Scent",
      images: ["/images/editorial/hero.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Maison du Scent",
      description: "Authentic perfume decants, hand-poured in Mombasa.",
      images: ["/images/editorial/hero.jpg"],
    },
    robots: preview
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f2e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
