"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { CustomerSummary } from "@/lib/queries";
import { updateCustomerAction, type AdminFormState } from "@/lib/actions/admin";

export function CustomerForm({ customer }: { customer: CustomerSummary }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(updateCustomerAction, {});
  return (
    <form action={action} className="mt-3 space-y-3 border-t border-[#eee7db] pt-3">
      <input type="hidden" name="id" value={customer.user.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor={`tier-${customer.user.id}`}>Membership tier</label>
          <select id={`tier-${customer.user.id}`} name="membership_tier" defaultValue={customer.user.membership_tier} className="admin-field">
            <option value="Guest">Guest</option>
            <option value="Circle">Circle</option>
            <option value="Maison+">Maison+</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor={`phone-${customer.user.id}`}>Phone</label>
          <input id={`phone-${customer.user.id}`} name="phone" defaultValue={customer.user.phone ?? ""} className="admin-field" />
        </div>
        <div>
          <label className="admin-label" htmlFor={`credit-${customer.user.id}`}>Store credit (KSh)</label>
          <input id={`credit-${customer.user.id}`} name="store_credit" type="number" min={0} defaultValue={customer.user.store_credit} className="admin-field" />
        </div>
        <div>
          <label className="admin-label" htmlFor={`points-${customer.user.id}`}>Points</label>
          <input id={`points-${customer.user.id}`} name="points" type="number" min={0} defaultValue={customer.user.points} className="admin-field" />
        </div>
      </div>
      {state.error ? <p className="flex items-center gap-2 text-[0.7rem] text-rose-700"><AlertCircle size={13} /> {state.error}</p> : null}
      {state.success ? <p className="flex items-center gap-2 text-[0.7rem] text-emerald-700"><Check size={13} /> {state.success}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">{pending ? "Saving…" : "Save customer"}</button>
    </form>
  );
}
