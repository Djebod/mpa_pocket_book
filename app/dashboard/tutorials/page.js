"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";

export default function TutorialsPage() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setList(store.getTutorials());
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? list.filter((t) => t.title.toLowerCase().includes(q)) : list;
    return [...filtered].sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
  }, [list, search]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Tutorial Digital</h1>
      <p className="text-sm text-ink/60 mb-6">Kumpulan tutorial digital — klik untuk membuka di Google Drive.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari judul tutorial..."
        className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm mb-6 focus:border-brass focus:outline-none"
      />

      {visible.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          {list.length === 0 ? "Belum ada tutorial saat ini." : "Tidak ada tutorial yang cocok dengan pencarian."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((t) => (
            <li key={t.id}>
              <a
                href={t.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp hover:border-brass transition-colors"
              >
                <span className="font-display text-lg text-ink">{t.title}</span>
                <span className="text-brass text-sm font-semibold shrink-0">Buka 🔗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
