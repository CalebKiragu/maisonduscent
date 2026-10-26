import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isPreview } from "@/lib/preview";
import { AuthForm } from "@/components/store/auth-form";
import { AuthFrame } from "@/components/store/auth-frame";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Maison du Scent account to track orders, save favourites and access member pricing.",
};

function safeNext(value?: string): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const preview = isPreview();
  const target = safeNext(next);
  if (user) redirect(target ?? (user.role === "admin" && !preview ? "/admin" : "/account"));

  return (
    <AuthFrame
      image="/images/editorial/hero.jpg"
      imageAlt="Perfume bottles in warm evening light"
      eyebrow="Welcome back"
      title="Sign in to the Maison"
      lead="Your orders, wishlist and member privileges, all in one place."
      quote="A scent remembered is a moment kept."
      quoteBy="The Maison journal"
    >
      <AuthForm mode="login" next={target} />
      {(preview || process.env.NODE_ENV !== "production") && (
        <div className="mt-6 border border-dashed border-line bg-cream-deep/40 px-4 py-3 text-[0.7rem] leading-relaxed text-stone">
          <p className="font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {preview ? "Preview account" : "Demo account"}
          </p>
          <p className="mt-1">amara@example.com · Member@1234</p>
          <p className="mt-1 text-[0.65rem] text-mist">
            {preview ? (
              "Admin access is disabled on the public preview."
            ) : (
              <>Administrators sign in at <a href="/admin/login" className="underline">/admin/login</a>.</>
            )}
          </p>
        </div>
      )}
    </AuthFrame>
  );
}
