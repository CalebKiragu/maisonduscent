"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, Save } from "lucide-react";
import type { Collection } from "@/lib/types";
import { saveCollectionAction, type AdminFormState } from "@/lib/actions/admin";
import { MediaUploader } from "./media-uploader";

export function CollectionForm({ collection, compact = false }: { collection?: Collection; compact?: boolean }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(saveCollectionAction, {});
  const [image, setImage] = useState(collection?.image ?? "/images/editorial/hero.jpg");

  return (
    <form action={action} className="space-y-3">
      {collection ? <input type="hidden" name="id" value={collection.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="admin-label" htmlFor={`ctitle-${collection?.id ?? "new"}`}>Title *</label>
          <input id={`ctitle-${collection?.id ?? "new"}`} name="title" required defaultValue={collection?.title ?? ""} className="admin-field" placeholder="The Niche Room" />
        </div>
        <div>
          <label className="admin-label" htmlFor={`cslug-${collection?.id ?? "new"}`}>Slug</label>
          <input id={`cslug-${collection?.id ?? "new"}`} name="slug" defaultValue={collection?.slug ?? ""} className="admin-field font-mono text-[0.72rem]" placeholder="auto" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor={`csub-${collection?.id ?? "new"}`}>Subtitle</label>
          <input id={`csub-${collection?.id ?? "new"}`} name="subtitle" defaultValue={collection?.subtitle ?? ""} className="admin-field" placeholder="Rare houses, quietly confident" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor={`cdesc-${collection?.id ?? "new"}`}>Description</label>
          <textarea id={`cdesc-${collection?.id ?? "new"}`} name="description" rows={3} defaultValue={collection?.description ?? ""} className="admin-field" />
        </div>
        <div>
          <label className="admin-label" htmlFor={`ctheme-${collection?.id ?? "new"}`}>Accent colour</label>
          <div className="flex items-center gap-2">
            <input id={`ctheme-${collection?.id ?? "new"}`} name="theme" type="color" defaultValue={collection?.theme ?? "#b9a17d"} className="h-9 w-12 border border-[#ddd4c4] bg-[#fffdf9] p-0.5" />
            <span className="text-[0.64rem] text-stone">Used for collection accents</span>
          </div>
        </div>
        <div>
          <label className="admin-label" htmlFor={`csort-${collection?.id ?? "new"}`}>Sort order</label>
          <input id={`csort-${collection?.id ?? "new"}`} name="sort" type="number" min={0} defaultValue={collection?.sort ?? 0} className="admin-field" />
        </div>
      </div>

      <MediaUploader
        value={image}
        onChange={setImage}
        label="Cover image"
        hint={compact ? "Shown on collection cards" : "Used on the collection page"}
      />
      <input type="hidden" name="image" value={image} />

      {state.error ? <p className="flex items-center gap-2 text-[0.7rem] text-rose-700"><AlertCircle size={13} /> {state.error}</p> : null}
      {state.success ? <p className="flex items-center gap-2 text-[0.7rem] text-emerald-700"><Check size={13} /> {state.success}</p> : null}

      <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">
        <Save size={13} /> {pending ? "Saving…" : collection ? "Save collection" : "Create collection"}
      </button>
    </form>
  );
}
