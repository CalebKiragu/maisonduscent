"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Check, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  errors?: { row: number; message: string }[];
}

export function ImportPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as ImportResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Import failed.");
      setResult(data);
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="admin-card p-5">
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition ${file ? "border-wine/40 bg-[#faf7f1]" : "border-[#ddd4c4] bg-[#fffdf9]"}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const dropped = event.dataTransfer.files?.[0];
            if (dropped) setFile(dropped);
          }}
        >
          <FileSpreadsheet size={26} strokeWidth={1.2} className="text-wine/70" />
          {file ? (
            <>
              <p className="mt-3 text-[0.82rem] font-medium">{file.name}</p>
              <p className="mt-1 text-[0.66rem] text-stone">{(file.size / 1024).toFixed(1)} KB · ready to import</p>
              <div className="mt-4 flex items-center gap-2">
                <button type="button" onClick={submit} disabled={busy} className="btn btn-ink btn-sm disabled:opacity-60">
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {busy ? "Importing…" : "Import products"}
                </button>
                <button type="button" onClick={() => setFile(null)} disabled={busy} className="btn btn-outline btn-sm"><X size={13} /> Remove</button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-[0.82rem] font-medium">Drop your CSV or spreadsheet here</p>
              <p className="mt-1 text-[0.66rem] text-stone">or choose a file — .csv, .xlsx or .xls up to 12 MB</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-outline btn-sm mt-4"><Upload size={13} /> Choose file</button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              if (chosen) {
                setFile(chosen);
                setResult(null);
                setError("");
              }
              event.target.value = "";
            }}
          />
        </div>

        {error ? (
          <p className="mt-4 flex items-start gap-2 border border-rose-200 bg-rose-50 px-4 py-3 text-[0.74rem] text-rose-800" role="alert">
            <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-4 border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-2 text-[0.78rem] font-medium text-emerald-900">
              <Check size={14} /> Import complete — {result.total} rows processed.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Created", value: result.created },
                { label: "Updated", value: result.updated },
                { label: "Skipped", value: result.skipped },
                { label: "Errors", value: result.errors?.length ?? 0 },
              ].map((stat) => (
                <div key={stat.label} className="border border-emerald-200 bg-[#fffdf9] px-3 py-2">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-stone">{stat.label}</p>
                  <p className="mt-0.5 font-display text-xl leading-none">{stat.value}</p>
                </div>
              ))}
            </div>
            {result.errors?.length ? (
              <div className="mt-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-rose-800">Rows needing attention</p>
                <ul className="mt-2 space-y-1 text-[0.72rem] text-rose-900">
                  {result.errors.map((item) => (
                    <li key={item.row}>Row {item.row}: {item.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Link href="/admin/products" className="btn btn-ink btn-sm">View inventory</Link>
              <button type="button" onClick={() => setResult(null)} className="btn btn-outline btn-sm">Import another file</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
