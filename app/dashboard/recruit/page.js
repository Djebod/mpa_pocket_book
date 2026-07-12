"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";
import Linkified from "@/components/Linkified";

export default function RecruitPage() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    setData(store.getRecruitInfo());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Recruit</h1>
      <p className="text-sm text-ink/60 mb-8">Panduan lengkap proses recruit agen baru Mulia Putri Agency.</p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 perforated">
        <FileListDisplay files={data?.files || []} />
        {data?.description && (
          <Linkified text={data.description} className="text-sm leading-relaxed text-charcoal/85 mt-6" />
        )}
        {!data?.description && (!data?.files || data.files.length === 0) && (
          <p className="text-sm text-ink/50">Belum ada materi recruit yang ditambahkan.</p>
        )}
      </div>
    </div>
  );
}
