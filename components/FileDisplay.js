"use client";

import { useState } from "react";

function blockContextMenu(e) {
  e.preventDefault();
}

/**
 * Menampilkan satu file: gambar tampil langsung, PDF tampil via Google
 * Docs Viewer. TIDAK ada tombol download (disengaja — dokumen ini hanya
 * dimaksudkan untuk dilihat di dalam Pocket Book), klik kanan dan seleksi
 * teks pada area viewer juga dinonaktifkan.
 *
 * Catatan jujur: ini mengurangi kemudahan orang iseng menyimpan/copy
 * file lewat UI kita, TAPI bukan proteksi yang tidak bisa ditembus.
 * Konten di dalam iframe Google Docs Viewer berasal dari domain Google
 * (cross-origin) sehingga kita tidak bisa mengontrol interaksi di
 * dalamnya (mis. tombol download bawaan Google Docs Viewer, kalau ada,
 * tetap di luar kendali kita), dan siapa pun yang memeriksa Network tab
 * di browser tetap bisa melihat URL file aslinya. Proteksi berbasis
 * front-end seperti ini menaikkan sedikit "friksi" untuk pengguna
 * awam/tidak sengaja, bukan proteksi keamanan yang benar-benar kedap.
 */
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
          <p className="text-xs text-ink/45">Dokumen ini hanya bisa dilihat di dalam Pocket Book.</p>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="shrink-0 text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⤢ Perbesar
          </button>
        </div>
        <div
          onContextMenu={blockContextMenu}
          className="w-full h-[70vh] min-h-[420px] max-h-[820px] rounded-md overflow-hidden border border-ink/10 bg-paper-dark/30 shadow-stamp select-none"
        >
          <iframe src={embedSrc} title={file.name || "Lampiran PDF"} className="w-full h-full pointer-events-auto" />
        </div>

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
            <div className="flex-1 bg-paper-dark/30 select-none" onContextMenu={blockContextMenu}>
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
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          onContextMenu={blockContextMenu}
          className="block mt-4 w-full text-left select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.url}
            alt={file.name || "Lampiran"}
            draggable={false}
            className="max-w-full h-auto rounded-md border border-ink/10 shadow-stamp hover:opacity-90 transition-opacity select-none"
          />
        </button>
        {fullscreen && (
          <div
            className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
            onContextMenu={blockContextMenu}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={file.name || "Lampiran"}
              draggable={false}
              className="max-w-full max-h-full rounded-lg select-none"
            />
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
