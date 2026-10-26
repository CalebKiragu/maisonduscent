import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAddresses } from "@/lib/queries";
import { deleteAddressAction, makeDefaultAddressAction } from "@/lib/actions/account";
import { AddressForm } from "@/components/account/address-form";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const metadata: Metadata = { title: "My addresses" };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = getAddresses(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Delivery addresses</h2>
        <p className="mt-1 text-[0.74rem] text-stone">Saved addresses appear automatically at checkout.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3">
          {addresses.length ? (
            addresses.map((address) => (
              <article key={address.id} className={`border p-5 ${address.is_default ? "border-wine/30 bg-parchment" : "border-line bg-parchment/70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} strokeWidth={1.4} className="mt-0.5 text-wine/70" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.84rem] font-medium">{address.label}</p>
                        {address.is_default ? <span className="badge border-wine/25 bg-wine/5 text-wine">Default</span> : null}
                      </div>
                      <p className="mt-1.5 text-[0.76rem] leading-relaxed text-stone">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                        <br />
                        {address.city}
                        <br />
                        {address.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                  {!address.is_default ? (
                    <form action={makeDefaultAddressAction}>
                      <input type="hidden" name="id" value={address.id} />
                      <button type="submit" className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-wine hover:text-ink">Make default</button>
                    </form>
                  ) : null}
                  <form action={deleteAddressAction}>
                    <input type="hidden" name="id" value={address.id} />
                    <ConfirmButton message="Remove this address?" className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-stone hover:text-rose-700">
                      Remove
                    </ConfirmButton>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-line bg-parchment/60 px-6 py-10 text-center">
              <MapPin size={22} strokeWidth={1.2} className="mx-auto text-mist" />
              <p className="mt-3 text-[0.85rem]">No saved addresses yet.</p>
              <p className="mt-1 text-[0.72rem] text-stone">Add one to make checkout quicker.</p>
            </div>
          )}
        </div>

        <section className="h-fit border border-line bg-parchment p-5">
          <AddressForm />
        </section>
      </div>
    </div>
  );
}
