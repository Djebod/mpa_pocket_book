"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

export default function AdminKomisiKompensasiPage() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = store.getKomisiKompensasiInfo();
    if (existing) {
      setDescription(existing.description || "");
      setFiles(existing.files || []);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    store.saveKomisiKompensasiInfo({ description, files });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Komisi & Kompensasi</h1>
      <p className="text-sm text-ink/60 mb-8">
        Halaman ini akan ditampilkan ke seluruh member — isi deskripsi dan lampirkan file (PDF/foto) skema komisi
        & kompensasi, bisa lebih dari satu file.
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
          <label className="block text-sm font-semibold text-ink mb-1.5">
            Deskripsi <span className="font-normal text-ink/45">(opsional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Jelaskan skema komisi & kompensasi Mulia Putri Agency..."
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <p className="text-xs text-ink/45 mt-1">
            Link (http/https) di dalam teks ini otomatis jadi bisa diklik di halaman member.
          </p>
        </div>

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
