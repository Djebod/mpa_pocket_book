"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";
import Linkified from "@/components/Linkified";

export default function CommissionPage() {
  const [commission, setCommission] = useState(undefined);

  useEffect(() => {
    setCommission(store.getCommissionInfo());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Komisi Produk & Kompensasi</h1>
      <p className="text-sm text-ink/60 mb-8">Informasi skema komisi dan kompensasi Mulia Putri Agency.</p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-6 py-6 perforated">
        {commission?.description && (
          <Linkified text={commission.description} className="text-sm leading-relaxed text-charcoal/85 mb-4" />
        )}
        <FileListDisplay files={commission?.files || []} />
        {!commission?.description && (!commission?.files || commission.files.length === 0) && (
          <p className="text-sm text-ink/50">Belum ada informasi komisi & kompensasi yang ditambahkan.</p>
        )}
      </div>
    </div>
  );
}
