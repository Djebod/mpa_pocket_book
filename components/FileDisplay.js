"use client";

import { useState } from "react";

/** Menampilkan satu file: gambar tampil langsung, PDF tampil via Google Docs Viewer + tombol download. */
export function FileDisplay({ file }) {
  const [fullscreen, setFullscreen] = useState(false);
  if (!file) return null;
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType?.startsWith("image/");

  if (isPdf) {
    const embedSrc = file.previewUrl || file.url;
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-xs text-ink/45">
            Kalau PDF tidak tampil, gunakan tombol download di bawah.
          </p>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="shrink-0 text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⤢ Perbesar
          </button>
        </div>
        <div className="w-full h-[70vh] min-h-[420px] max-h-[820px] rounded-md overflow-hidden border border-ink/10 bg-paper-dark/30 shadow-stamp">
          <iframe src={embedSrc} title={file.name || "Lampiran PDF"} className="w-full h-full" />
        </div>
        <a
          href={file.downloadUrl || file.url}
          target="_blank"
          rel="noopener noreferrer"
          download={file.name || undefined}
          className="mt-3 inline-flex items-center gap-2 bg-ink text-paper text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors"
        >
          📄 Download PDF{file.name ? ` — ${file.name}` : ""}
        </a>

        {fullscreen && (
          <div className="fixed inset-0 z-50 bg-ink/90 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-ink text-paper shrink-0">
              <p className="text-sm font-semibold truncate pr-3">{file.name || "Lampiran PDF"}</p>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Tutup"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md hover:bg-ink-light text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 bg-paper-dark/30">
              <iframe src={embedSrc} title={file.name || "Lampiran PDF"} className="w-full h-full" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isImage) {
    return (
      <>
        <button type="button" onClick={() => setFullscreen(true)} className="block mt-4 w-full text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.url}
            alt={file.name || "Lampiran"}
            className="max-w-full h-auto rounded-md border border-ink/10 shadow-stamp hover:opacity-90 transition-opacity"
          />
        </button>
        {fullscreen && (
          <div
            className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.url} alt={file.name || "Lampiran"} className="max-w-full max-h-full rounded-lg" />
          </div>
        )}
      </>
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
        <div className="flex gap-1.5 flex-wrap mb-3">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-xs font-semibold px-3 py-2 rounded-md border transition-colors ${
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
