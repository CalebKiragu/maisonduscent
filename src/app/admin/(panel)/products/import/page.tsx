import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/queries";
import { ImportPanel } from "@/components/admin/import-panel";
import { AdminPageHeader, Panel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Import & export" };
export const dynamic = "force-dynamic";

const columns = [
  ["sku", "Unique stock code. Matches existing products for updates."],
  ["name", "Product name (required for new rows)."],
  ["brand", "House name (required for new rows)."],
  ["type", "perfume, bundle, atomizer or giftcard."],
  ["gender", "her, him or unisex."],
  ["family", "Floral, Woody, Amber, Fresh, etc."],
  ["concentration", "Eau de Parfum, Extrait, etc."],
  ["description / story", "Storefront copy."],
  ["top_notes / heart_notes / base_notes", "Separate notes with | or commas."],
  ["price_2 / price_5 / price_8 / price_30", "Prices in KSh, whole numbers."],
  ["cost_price / stock", "Cost per unit and units available."],
  ["status", "in_stock, low_stock, out_of_stock, pending, held, discontinued."],
  ["badge", "Optional ribbon text."],
  ["bestseller / new_arrival / featured", "1 or 0."],
  ["image / gallery", "Image path or URL. Gallery separated by |."],
  ["collections / bundle_items", "Slugs separated by | or commas."],
  ["rating / review_count", "Display rating and number of reviews."],
];

export default async function AdminImportPage() {
  await requireAdmin();
  const total = getAllProducts("admin").length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Bulk operations"
        title="Import & export"
        description="Add or update the whole catalogue from a CSV or Excel sheet. Existing products are matched by SKU first, then by slug."
      >
        <Link href="/api/admin/import/template" className="btn btn-outline btn-sm"><Download size={13} /> Template</Link>
        <Link href="/api/admin/export/products" className="btn btn-ink btn-sm"><Download size={13} /> Export all {total}</Link>
      </AdminPageHeader>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <ImportPanel />

          <Panel title="How imports behave" description="Safe by default">
            <div className="space-y-3 px-5 py-4 text-[0.74rem] leading-relaxed text-stone">
              <p><strong className="text-ink">Matched by SKU.</strong> If a row has a SKU that already exists, that product is updated — prices, stock, status, notes and media included.</p>
              <p><strong className="text-ink">Matched by name + brand.</strong> Rows without a SKU fall back to the generated product slug, so re-importing the export updates rather than duplicates.</p>
              <p><strong className="text-ink">New products.</strong> Rows that match nothing are created. A SKU is generated if omitted, and the slug is made unique automatically.</p>
              <p><strong className="text-ink">Blank cells leave existing values alone.</strong> On updates, only the columns present in your file are changed. On new products, sensible defaults are used.</p>
              <p><strong className="text-ink">Storefront refresh.</strong> The catalogue, collections and analytics pages update immediately after import.</p>
            </div>
          </Panel>
        </div>

        <Panel title="Column reference" description="Headers must be in the first row">
          <div className="max-h-[36rem] overflow-y-auto">
            <table className="admin-table w-full">
              <tbody>
                {columns.map(([column, meaning]) => (
                  <tr key={column}>
                    <td className="w-2/5 align-top"><code className="text-[0.66rem] text-wine">{column}</code></td>
                    <td className="text-[0.7rem] leading-relaxed text-stone">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 border-t border-[#e4ddd0] px-5 py-3">
            <FileSpreadsheet size={16} className="text-wine/70" />
            <p className="text-[0.66rem] text-stone">Tip: export the current catalogue first, edit it in Excel or Sheets, then import it back.</p>
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Link href="/admin/products/new" className="btn btn-outline btn-sm"><Upload size={13} /> Or add a single product</Link>
      </div>
    </>
  );
}
