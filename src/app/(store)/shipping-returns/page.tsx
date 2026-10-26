import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Package, RotateCcw, Truck } from "lucide-react";
import { PageHero } from "@/components/store/page-hero";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description: "Free countrywide delivery over KSh 5,000, same-day dispatch in Mombasa, and 30-day returns on unopened decants.",
};

const sections = [
  {
    icon: Truck,
    title: "Delivery",
    body: [
      "Mombasa: 1–2 working days. Orders placed before 2pm are dispatched the same working day.",
      "Countrywide: 2–4 working days via Pickup Mtaani, G4S, Bolt Courier or Sendy.",
      `Free delivery on orders over ${formatMoney(5000)}. Below that, a flat fee of ${formatMoney(350)} applies.`,
      "Atelier pickup is available by appointment in Mombasa — choose pickup at checkout and we will send directions.",
    ],
  },
  {
    icon: Package,
    title: "Packing",
    body: [
      "Every order is packed in a keepsake box with tissue, a wax seal and a hand-tied ribbon.",
      "Each order includes a complimentary mystery 2 ml sample, chosen by the maison.",
      "If you are sending a gift, add a note at checkout and we will hand-write it for you.",
      "Decants are wrapped individually and cushioned to survive the journey.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returns",
    body: [
      "Unopened, sealed decants can be returned within 30 days of delivery for a full refund.",
      "For hygiene reasons, opened fragrance cannot be returned — unless the item is faulty or not as described.",
      "If something is wrong, message us on WhatsApp within 48 hours of delivery and we will make it right.",
      "Refunds are processed to the original payment method within 5–7 working days of the returned item arriving.",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment",
    body: [
      "M-PESA, Visa, Mastercard and cash on delivery are accepted.",
      "Orders are confirmed once payment is received. For M-PESA, you will receive a payment prompt after checkout.",
      "Cash on delivery is available in Mombasa only, on orders under KSh 15,000.",
      "You can also complete your order on WhatsApp if you prefer to speak to a person.",
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <>
      <PageHero
        eyebrow="The practicalities"
        title={<>Delivery & <span className="italic text-wine">returns.</span></>}
        description="Hand-decanted in Mombasa, delivered countrywide. Here is exactly what to expect, and what happens if something is not right."
        breadcrumbs={[{ label: "Delivery & returns" }]}
      />
      <section className="shell py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="border-t border-line pt-6">
              <section.icon size={20} strokeWidth={1.3} className="text-wine" />
              <h2 className="mt-3 font-display text-3xl">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.body.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-[0.84rem] leading-relaxed text-stone">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" /> {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border border-line bg-parchment p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl">A question we did not answer?</h2>
          <p className="mt-2 text-[0.82rem] text-stone">WhatsApp the maison — a real person replies, usually within the hour.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-ink">Contact us</Link>
            <Link href="/faq" className="btn btn-outline">Read the FAQs</Link>
          </div>
        </div>
      </section>
    </>
  );
}
