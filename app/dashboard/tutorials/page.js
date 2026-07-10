"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";

export default function TutorialsPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(store.getTutorials());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Tutorial Digital</h1>
      <p className="text-sm text-ink/60 mb-8">Kumpulan tutorial digital — klik untuk membuka di Google Drive.</p>

      {list.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada tutorial saat ini.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((t) => (
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
