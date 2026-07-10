"use client";

import { useState } from "react";

/** Menampilkan satu file: gambar tampil langsung, PDF tampil via Google Docs Viewer + tombol download. */
export function FileDisplay({ file }) {
  if (!file) return null;
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType?.startsWith("image/");

  if (isPdf) {
    const embedSrc = file.previewUrl || file.url;
    return (
      <div className="mt-4">
        <div className="w-full aspect-[4/5] sm:aspect-[16/10] rounded-md overflow-hidden border border-ink/10 bg-paper-dark/30">
          <iframe src={embedSrc} title={file.name || "Lampiran PDF"} className="w-full h-full" />
        </div>
        <p className="text-xs text-ink/45 mt-2">
          Kalau PDF tidak tampil di atas, gunakan tombol download di bawah ini.
        </p>
        <a
          href={file.downloadUrl || file.url}
          target="_blank"
          rel="noopener noreferrer"
          download={file.name || undefined}
          className="mt-2 inline-flex items-center gap-2 bg-ink text-paper text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors"
        >
          📄 Download PDF{file.name ? ` — ${file.name}` : ""}
        </a>
      </div>
    );
  }

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name || "Lampiran"}
        className="mt-4 max-w-full h-auto rounded-md border border-ink/10"
      />
    );
  }

  return null;
}

/**
 * Menampilkan daftar lampiran (banyak file) sebagai tab bernomor —
 * dipakai di halaman Komisi & Kompensasi dan Promo yang bisa punya
 * beberapa Attach File sekaligus.
 */
export function FileListDisplay({ files = [] }) {
  const [active, setActive] = useState(0);

  if (!files || files.length === 0) {
    return <p className="text-sm text-ink/50">Belum ada file dilampirkan.</p>;
  }

  return (
    <div>
      {files.length > 1 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
                active === i ? "bg-ink text-paper border-ink" : "text-ink/60 border-ink/20 hover:border-brass"
              }`}
            >
              File {i + 1}
            </button>
          ))}
        </div>
      )}
      <FileDisplay file={files[active]} />
    </div>
  );
}
