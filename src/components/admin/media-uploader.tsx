"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export function MediaUploader({
  value,
  onChange,
  label = "Product image",
  hint = "JPG, PNG or WebP · up to 8 MB",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    setError("");
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed. Try a smaller image.");
        return;
      }
      onChange(data.url);
    });
  }

  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative h-32 w-24 shrink-0 overflow-hidden border border-[#ddd4c4] bg-[#f3f0e9]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[0.58rem] uppercase tracking-[0.1em] text-stone">No image</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="admin-field"
            placeholder="/images/products/p01.jpg or https://…"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
            />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="btn btn-outline btn-sm disabled:opacity-60">
              {pending ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              {pending ? "Uploading…" : "Upload image"}
            </button>
            <span className="text-[0.6rem] text-stone">{hint}</span>
          </div>
          {error ? <p className="text-[0.66rem] text-rose-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
