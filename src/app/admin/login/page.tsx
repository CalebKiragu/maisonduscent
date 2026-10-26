import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isPreview } from "@/lib/preview";
import { AuthForm } from "@/components/store/auth-form";
import { AuthFrame } from "@/components/store/auth-frame";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (isPreview()) redirect("/");

  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  return (
    <AuthFrame
      admin
      image="/images/editorial/niche.jpg"
      imageAlt="Maison du Scent atelier"
      eyebrow="Maison operations"
      title="Admin sign in"
      lead="Manage orders, inventory, collections and store performance from one place."
      quote="The details are the luxury."
      quoteBy="Maison du Scent · operations"
    >
      <AuthForm mode="admin" />
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 border border-dashed border-line bg-cream-deep/40 px-4 py-3 text-[0.7rem] leading-relaxed text-stone">
          <p className="font-semibold uppercase tracking-[0.12em] text-ink-soft">Demo administrator</p>
          <p className="mt-1">admin@maisonduscent.com · Admin@1234</p>
          <p className="mt-1 text-[0.65rem] text-mist">Access is restricted to administrator accounts.</p>
        </div>
      )}
    </AuthFrame>
  );
}
