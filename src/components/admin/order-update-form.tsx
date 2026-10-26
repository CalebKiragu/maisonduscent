"use client";

import { useActionState } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, type OrderStatus, type PaymentStatus } from "@/lib/types";
import { updateOrderAction, type AdminFormState } from "@/lib/actions/admin";

const couriers = ["Bolt", "Uber", "Sendy", "Pickup Mtaani", "DHL", "G4S", "In-house rider", "Customer pickup"];

export function OrderUpdateForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(updateOrderAction, {});

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="order_number" value={order.order_number} />

      <div>
        <label className="admin-label" htmlFor="status">Order status</label>
        <select id="status" name="status" defaultValue={order.status} className="admin-field">
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => (
            <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="payment_status">Payment status</label>
          <select id="payment_status" name="payment_status" defaultValue={order.payment_status} className="admin-field">
            {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((status) => (
              <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="payment_method">Payment method</label>
          <select id="payment_method" name="payment_method" defaultValue={order.payment_method} className="admin-field">
            <option value="mpesa">M-PESA</option>
            <option value="card">Card</option>
            <option value="cod">Cash on delivery</option>
            <option value="whatsapp">WhatsApp arrangement</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor="courier">Courier</label>
          <input id="courier" name="courier" list="courier-options" defaultValue={order.courier ?? ""} className="admin-field" placeholder="Bolt, Sendy, pickup…" />
          <datalist id="courier-options">{couriers.map((courier) => <option key={courier} value={courier} />)}</datalist>
        </div>
        <div>
          <label className="admin-label" htmlFor="tracking_number">Tracking / waybill</label>
          <input id="tracking_number" name="tracking_number" defaultValue={order.tracking_number ?? ""} className="admin-field font-mono text-[0.72rem]" placeholder="Tracking reference" />
        </div>
        <div>
          <label className="admin-label" htmlFor="rider">Rider / driver</label>
          <input id="rider" name="rider" defaultValue={order.rider ?? ""} className="admin-field" placeholder="Name and phone" />
        </div>
        <div>
          <label className="admin-label" htmlFor="amount_collected">Amount collected (KSh)</label>
          <input id="amount_collected" name="amount_collected" type="number" min={0} defaultValue={order.amount_collected} className="admin-field" />
        </div>
      </div>

      <div>
        <label className="admin-label" htmlFor="note">Internal note / customer update</label>
        <textarea id="note" name="note" rows={2} className="admin-field" placeholder="This note appears on the customer timeline." />
      </div>

      {state.error ? (
        <p className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-[0.72rem] text-rose-800" role="alert">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /> {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.72rem] text-emerald-800" role="status">
          <Check size={13} /> {state.success}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-ink btn-sm w-full disabled:opacity-60">
        <Save size={13} /> {pending ? "Saving…" : "Save order update"}
      </button>
    </form>
  );
}
