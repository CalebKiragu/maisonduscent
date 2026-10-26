import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getOrderActionCount } from "@/lib/analytics";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Maison Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const orderActionCount = getOrderActionCount();
  return (
    <AdminShell userName={user.name} orderActionCount={orderActionCount}>
      {children}
    </AdminShell>
  );
}
