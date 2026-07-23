"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";

const CATEGORY_OPTIONS = ["After Sales", "Claim"];

export default function AfterSalesClaimPage() {
  const [list, setList] = useState([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORY_OPTIONS[0]);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setList(store.getAfterSalesClaimList());
  }, []);

  const visible = useMemo(() => {
    let result = list.filter((entry) => entry.category === activeCategory);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((entry) => (entry.files || []).some((f) => (f.name || "").toLowerCase().includes(q)));
    }
    return result;
  }, [list, activeCategory, search]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">After Sales & Claim</h1>
      <p className="text-sm text-ink/60 mb-6">Materi & panduan After Sales dan Claim Mulia Putri Agency.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama file lampiran..."
        className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none mb-4"
      />

      <div className="flex gap-2 mb-6">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenId(null);
            }}
            className={`text-sm font-semibold px-4 py-2.5 rounded-md border transition-colors ${
              activeCategory === cat ? "bg-ink text-paper border-ink" : "text-ink/60 border-ink/20 hover:border-brass"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          {search.trim() ? "Tidak ada file yang cocok." : `Belum ada data untuk kategori ${activeCategory}.`}
        </div>
      ) : visible.length === 1 ? (
        <div className="bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp perforated">
          <FileListDisplay files={visible[0].files || []} />
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((entry, i) => {
            const open = openId === entry.id;
            return (
              <div key={entry.id} className="bg-card border border-ink/10 rounded-lg shadow-stamp overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : entry.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display text-lg text-ink">
                    {activeCategory} — Data {i + 1}
                  </span>
                  <span className="text-xs text-ink/50">{open ? "Tutup ▲" : "Lihat ▼"}</span>
                </button>
                {open && (
                  <div className="px-5 pb-5 border-t border-ink/10 pt-4">
                    <FileListDisplay files={entry.files || []} />
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
