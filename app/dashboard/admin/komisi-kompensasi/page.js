"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

export default function AdminKomisiKompensasiPage() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = store.getKomisiKompensasiInfo();
    if (existing) {
      setDescription(existing.description || "");
      setFiles(existing.files || []);
    }
  }, []);

  // Peringatkan kalau ada yang coba refresh/tutup tab persis saat data
  // masih dalam proses dikirim ke Google Sheets — supaya tidak ada
  // pengiriman yang terputus di tengah jalan (penyebab utama data
  // "hilang" setelah hard refresh).
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saving]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await store.saveKomisiKompensasiInfo({ description, files });
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    } catch (err) {
      setError(err.message || "Gagal menyimpan. Coba lagi.");
    }
    setSaving(false);
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

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        {saving && (
          <p className="text-xs text-ink/45 mt-2">
            Jangan tutup atau refresh halaman ini dulu — sedang mengirim ke Google Sheets…
          </p>
        )}
      </form>
    </div>
  );
}
