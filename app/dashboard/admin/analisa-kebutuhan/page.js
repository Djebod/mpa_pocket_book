"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import SingleFileInput from "@/components/SingleFileInput";

export default function AdminAnalisaKebutuhanPage() {
  const [description, setDescription] = useState("");
  const [materi, setMateri] = useState(null);
  const [flier, setFlier] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = store.getAnalisaKebutuhanInfo();
    if (existing) {
      setDescription(existing.description || "");
      setMateri(existing.materi || null);
      setFlier(existing.flier || null);
      setVideoUrl(existing.videoUrl || "");
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    store.saveAnalisaKebutuhanInfo({ description, materi, flier, videoUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Analisa Kebutuhan Asuransi</h1>
      <p className="text-sm text-ink/60 mb-8">
        Halaman ini akan ditampilkan ke seluruh member — isi deskripsi, lampirkan materi & flier, dan link video.
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
          <label className="block text-sm font-semibold text-ink mb-1.5">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Jelaskan konsep analisa kebutuhan asuransi, langkah-langkahnya, dsb."
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <p className="text-xs text-ink/45 mt-1">
            Link (http/https) di dalam teks ini otomatis jadi bisa diklik di halaman member.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <SingleFileInput label="Materi" value={materi} onChange={setMateri} />
          <SingleFileInput label="Flier" value={flier} onChange={setFlier} />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-ink mb-1.5">
            Video <span className="font-normal text-ink/45">(link YouTube)</span>
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=xxxxxxxx"
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <p className="text-xs text-ink/45 mt-1">
            Boleh paste link YouTube apa saja (watch, youtu.be, shorts) — otomatis disesuaikan.
          </p>
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
