import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = getSettings();

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="The single source of truth for delivery pricing, contact links, announcements and membership."
      >
        <Link href="/" target="_blank" className="btn btn-outline btn-sm"><ExternalLink size={13} /> View storefront</Link>
      </AdminPageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <SettingsForm settings={settings} />

        <div className="space-y-4">
          <Panel title="Who has access" description="Administrator accounts">
            <div className="px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wine/10 text-wine"><ShieldCheck size={16} /></span>
                <div>
                  <p className="text-[0.8rem] font-medium">{admin.name}</p>
                  <p className="text-[0.66rem] text-stone">{admin.email}</p>
                </div>
              </div>
              <p className="mt-3 text-[0.68rem] leading-relaxed text-stone">
                You are signed in as an administrator. Member accounts cannot access <code>/admin</code>. Sign out from the sidebar when using a shared device.
              </p>
            </div>
          </Panel>

          <Panel title="Operational notes" description="Local demo environment">
            <div className="space-y-2 px-4 py-4 text-[0.7rem] leading-relaxed text-stone sm:px-5">
              <p>Orders, stock and analytics are stored in a local SQLite database under <code className="text-wine">data/maison.db</code>.</p>
              <p>Uploaded images are written to <code className="text-wine">public/uploads</code> and served immediately.</p>
              <p>Product imports accept CSV, XLSX and XLS. Export first to get a clean template with every column.</p>
              <p>Payment collection is manual — M-PESA, card and cash are recorded by the team after confirmation.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
