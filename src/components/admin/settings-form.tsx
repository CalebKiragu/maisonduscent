"use client";

import { useActionState } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";
import { saveSettingsAction, type AdminFormState } from "@/lib/actions/admin";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveSettingsAction, {});

  return (
    <form action={action} className="space-y-4">
      <section className="admin-card p-4 sm:p-5">
        <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Store identity</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="store_name">Store name</label>
            <input id="store_name" name="store_name" defaultValue={settings.storeName} className="admin-field" />
          </div>
          <div>
            <label className="admin-label" htmlFor="city">City</label>
            <input id="city" name="city" defaultValue={settings.city} className="admin-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="announcement">Announcement bar</label>
            <input id="announcement" name="announcement" defaultValue={settings.announcement} className="admin-field" />
            <p className="mt-1 text-[0.6rem] text-stone">Shown at the top of every storefront page. Keep it short and useful.</p>
          </div>
        </div>
      </section>

      <section className="admin-card p-4 sm:p-5">
        <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Contact & social</h2>
        <p className="mt-1.5 text-[0.64rem] leading-relaxed text-stone">
          These values power every call, email and WhatsApp link on the storefront, including the header, footer, contact and legal pages.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="phone">Public phone number</label>
            <input id="phone" name="phone" type="tel" required defaultValue={settings.phone} className="admin-field" placeholder="+254 712 345 678" />
            <p className="mt-1 text-[0.6rem] text-stone">Shown in the footer and contact page. Used for click-to-call.</p>
          </div>
          <div>
            <label className="admin-label" htmlFor="whatsapp_number">WhatsApp number or username</label>
            <input id="whatsapp_number" name="whatsapp_number" type="text" required defaultValue={settings.whatsappNumber} className="admin-field" placeholder="maison_du_scent" />
            <p className="mt-1 text-[0.6rem] text-stone">Use a number with country code, or the wa.me handle. Every WhatsApp link uses this destination.</p>
          </div>
          <div>
            <label className="admin-label" htmlFor="email">Public email</label>
            <input id="email" name="email" type="email" required defaultValue={settings.email} className="admin-field" placeholder="hello@yourdomain.com" />
            <p className="mt-1 text-[0.6rem] text-stone">Shown in the footer, contact page, privacy policy and terms.</p>
          </div>
          <div>
            <label className="admin-label" htmlFor="instagram">Instagram handle</label>
            <input id="instagram" name="instagram" defaultValue={settings.instagram} className="admin-field" placeholder="@maisonduscent" />
          </div>
          <div>
            <label className="admin-label" htmlFor="tiktok">TikTok handle</label>
            <input id="tiktok" name="tiktok" defaultValue={settings.tiktok} className="admin-field" placeholder="@maisonduscent" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="opening_hours">Opening hours</label>
            <textarea id="opening_hours" name="opening_hours" rows={3} defaultValue={settings.openingHours} className="admin-field resize-y" />
            <p className="mt-1 text-[0.6rem] text-stone">One line per row. Shown on the contact page.</p>
          </div>
        </div>
      </section>

      <section className="admin-card p-4 sm:p-5">
        <h2 className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-stone">Delivery & membership</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="admin-label" htmlFor="delivery_fee">Delivery fee (KSh)</label>
            <input id="delivery_fee" name="delivery_fee" type="number" min={0} defaultValue={settings.deliveryFee} className="admin-field" />
          </div>
          <div>
            <label className="admin-label" htmlFor="free_delivery_threshold">Free delivery over (KSh)</label>
            <input id="free_delivery_threshold" name="free_delivery_threshold" type="number" min={0} defaultValue={settings.freeDeliveryThreshold} className="admin-field" />
          </div>
          <div>
            <label className="admin-label" htmlFor="returns_days">Returns window (days)</label>
            <input id="returns_days" name="returns_days" type="number" min={0} defaultValue={settings.returnsDays} className="admin-field" />
          </div>
          <div>
            <label className="admin-label" htmlFor="membership_price">Membership price (KSh/year)</label>
            <input id="membership_price" name="membership_price" type="number" min={0} defaultValue={settings.membershipPrice} className="admin-field" />
          </div>
        </div>
        <p className="mt-2 text-[0.62rem] text-stone">Checkout, product pages, the cart and the membership page all read from these values.</p>
      </section>

      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-4 py-3 text-[0.74rem] text-rose-800" role="alert"><AlertCircle size={14} className="mt-0.5 shrink-0" /> {state.error}</p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-[0.74rem] text-emerald-800" role="status"><Check size={14} /> {state.success}</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">
        <Save size={13} /> {pending ? "Saving…" : "Save store settings"}
      </button>
    </form>
  );
}
