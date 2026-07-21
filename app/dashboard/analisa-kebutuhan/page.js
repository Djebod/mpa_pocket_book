"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { FileDisplay } from "@/components/FileDisplay";
import Linkified from "@/components/Linkified";

export default function AnalisaKebutuhanPage() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    setData(store.getAnalisaKebutuhanInfo());
  }, []);

  const isEmpty = data && !data.description && !data.materi && !data.flier && !data.videoUrl;

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Analisa Kebutuhan Asuransi</h1>
      <p className="text-sm text-ink/60 mb-8">Panduan analisa kebutuhan asuransi untuk nasabah.</p>

      <div className="bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp perforated">
        {data?.description && (
          <Linkified text={data.description} className="text-[15px] sm:text-sm leading-relaxed text-charcoal/85 mb-6" />
        )}

        {data?.materi && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Materi</p>
            <FileDisplay file={data.materi} />
          </div>
        )}

        {data?.flier && (
          <div className="mb-8 pt-6 border-t border-ink/10">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Flier</p>
            <FileDisplay file={data.flier} />
          </div>
        )}

        {data?.videoUrl && (
          <div className="pt-6 border-t border-ink/10">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Video</p>
            <div className="aspect-video w-full rounded-md overflow-hidden bg-ink/10">
              <iframe
                src={toYouTubeEmbedUrl(data.videoUrl)}
                title="Video Analisa Kebutuhan Asuransi"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {(!data || isEmpty) && (
          <p className="text-sm text-ink/50">Belum ada konten Analisa Kebutuhan Asuransi yang ditambahkan.</p>
        )}
      </div>
    </div>
  );
}
