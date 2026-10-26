"use client";

import { useActionState } from "react";
import { AlertCircle, Check, Plus } from "lucide-react";
import { addAddressAction, type FormState } from "@/lib/actions/account";

export function AddressForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAddressAction, {});

  return (
    <form action={action} className="space-y-3">
      <div className="flex items-center gap-2">
        <Plus size={14} className="text-wine" />
        <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-stone">Add an address</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="label">Label</label>
          <input id="label" name="label" className="field" placeholder="Home, Office…" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="line1">Street address</label>
          <input id="line1" name="line1" required className="field" placeholder="Mama Ngina Drive, Mombasa Island" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="line2">Apartment, floor, landmark</label>
          <input id="line2" name="line2" className="field" placeholder="Apartment 4B" />
        </div>
        <div>
          <label className="label" htmlFor="city">City / town</label>
          <input id="city" name="city" required defaultValue="Mombasa" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required className="field" placeholder="+254 7xx xxx xxx" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[0.72rem] text-stone">
        <input type="checkbox" name="is_default" className="h-3.5 w-3.5 accent-wine" /> Make this my default address
      </label>

      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-[0.74rem] text-rose-800" role="alert">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.74rem] text-emerald-800" role="status">
          <Check size={13} /> {state.success}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-ink btn-sm w-full disabled:opacity-60">
        {pending ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
