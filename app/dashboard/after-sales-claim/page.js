"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";

export default function AfterSalesClaimPage() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    setData(store.getAfterSalesClaimInfo());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">After Sales & Claim</h1>
      <p className="text-sm text-ink/60 mb-8">Materi & panduan After Sales dan Claim Mulia Putri Agency.</p>

      <div className="bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp perforated">
        <FileListDisplay files={data?.files || []} />
      </div>
    </div>
  );
}
