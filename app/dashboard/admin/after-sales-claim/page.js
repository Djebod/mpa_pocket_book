"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

export default function AdminAfterSalesClaimPage() {
  const [files, setFiles] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = store.getAfterSalesClaimInfo();
    if (existing) {
      setFiles(existing.files || []);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    store.saveAfterSalesClaimInfo({ files });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola After Sales & Claim</h1>
      <p className="text-sm text-ink/60 mb-8">
        Halaman ini akan ditampilkan ke seluruh member — lampirkan file (PDF/foto), bisa lebih dari satu.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 perforated relative"
      >
        {saved && (
          <div className="absolute top-5 right-6 stamp text-sage px-3 py-1 text-xs font-semibold uppercase">
            Tersimpan ✓
          </div>
        )}

        <div className="mb-6">
          <MultiFileInput
            value={files}
            onChange={setFiles}
            label="Lampiran (PDF / Foto) — Attach File 1, 2, dst"
          />
        </div>

        <button
          type="submit"
          className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
