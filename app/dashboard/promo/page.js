"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";

const FILTERS = ["Semua", "Agen", "Nasabah"];

export default function PromoPage() {
  const [list, setList] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    setList(store.getPromoList());
  }, []);

  const visible = useMemo(() => {
    if (filter === "Semua") return list;
    return list.filter((p) => p.category === filter);
  }, [list, filter]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Promo & Kontes</h1>
      <p className="text-sm text-ink/60 mb-6">Materi promo terbaru dari Mulia Putri Agency.</p>

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-md border transition-colors ${
              filter === f ? "bg-ink text-paper border-ink" : "text-ink/60 border-ink/20 hover:border-brass"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          {list.length === 0 ? "Belum ada promo saat ini." : "Tidak ada promo untuk kategori ini."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => {
            const open = openId === p.id;
            return (
              <div key={p.id} className="bg-card border border-ink/10 rounded-lg shadow-stamp overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-display text-lg text-ink truncate">{p.typePromo}</span>
                    {p.category && (
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-brass bg-brass/10 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-ink/50 shrink-0 pl-2">{open ? "Tutup ▲" : "Lihat ▼"}</span>
                </button>
                {open && (
                  <div className="px-5 pb-5 border-t border-ink/10 pt-4">
                    <FileListDisplay files={p.files || []} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
