import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/store/auth-form";
import { AuthFrame } from "@/components/store/auth-frame";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Maison du Scent account to save your favourite decants, track orders and unlock member pricing.",
};

function safeNext(value?: string): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const target = safeNext(next);
  if (user) redirect(target ?? "/account");

  return (
    <AuthFrame
      image="/images/editorial/membership.jpg"
      imageAlt="An evening fragrance ritual"
      eyebrow="Join the Maison"
      title="Create your account"
      lead="Save the scents you love, follow every order and unlock member pricing across the collection."
      quote="The right perfume doesn't announce you. It remembers you."
      quoteBy="Notes from the atelier"
    >
      <AuthForm mode="register" next={target} />
    </AuthFrame>
  );
}
