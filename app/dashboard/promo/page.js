"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";

export default function PromoPage() {
  const [list, setList] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setList(store.getPromoList());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Promo</h1>
      <p className="text-sm text-ink/60 mb-8">Materi promo terbaru dari Mulia Putri Agency.</p>

      {list.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada promo saat ini.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const open = openId === p.id;
            return (
              <div key={p.id} className="bg-card border border-ink/10 rounded-lg shadow-stamp overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display text-lg text-ink">{p.typePromo}</span>
                  <span className="text-xs text-ink/50">{open ? "Tutup ▲" : "Lihat ▼"}</span>
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
