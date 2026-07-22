"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";
import Linkified from "@/components/Linkified";

export default function KomisiKompensasiPage() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    setData(store.getKomisiKompensasiInfo());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Komisi & Kompensasi</h1>
      <p className="text-sm text-ink/60 mb-8">Informasi skema komisi dan kompensasi Mulia Putri Agency.</p>

      <div className="bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp perforated">
        {data?.description && (
          <Linkified text={data.description} className="text-[15px] sm:text-sm leading-relaxed text-charcoal/85 mb-4" />
        )}
        <FileListDisplay files={data?.files || []} />
        {!data?.description && (!data?.files || data.files.length === 0) && (
          <p className="text-sm text-ink/50">Belum ada informasi komisi & kompensasi yang ditambahkan.</p>
        )}
      </div>
    </div>
  );
}
