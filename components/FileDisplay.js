"use client";

import { useState } from "react";

function blockContextMenu(e) {
  e.preventDefault();
}

/**
 * Mengekstrak ID file Google Drive dari URL apa pun yang tersimpan di
 * objek file (previewUrl, url, atau downloadUrl) — dipakai supaya file
 * LAMA (diupload sebelum proxy `/api/drive-file/[fileId]` dibuat, jadi
 * field `previewUrl`-nya kosong) tetap bisa dialirkan lewat proxy kita
 * sendiri tanpa perlu diupload ulang. Tanpa ini, file lama akan
 * langsung memuat URL Google Drive asli di dalam iframe — yang di
 * banyak browser mobile (terutama Android) gagal dirender dan cuma
 * menampilkan kotak "stub" generik (ikon PDF + ID file mentah + tombol
 * "Open") alih-alih isi filenya.
 */
function extractDriveFileId(file) {
  if (!file) return null;
  const candidates = [file.previewUrl, file.url, file.downloadUrl].filter(Boolean);
  for (const url of candidates) {
    const proxyMatch = url.match(/\/api\/drive-file\/([a-zA-Z0-9_-]+)/);
    if (proxyMatch) return proxyMatch[1];
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch) return idParamMatch[1];
    const pathMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) return pathMatch[1];
  }
  return null;
}

/**
 * Menampilkan satu file: gambar tampil langsung, PDF tampil lewat proxy
 * milik aplikasi sendiri (`/api/drive-file/[fileId]`, lihat
 * `lib/google/driveClient.js`) — file baru yang diupload TIDAK lagi
 * ditampilkan lewat halaman viewer Google, jadi tombol "Pop-out" bawaan
 * Google Docs Viewer (yang mengarah ke sumber asli di Drive) tidak
 * muncul sama sekali. Ada tombol **Download** dan **Perbesar**; klik
 * kanan dan seleksi teks pada area viewer tetap dinonaktifkan.
 */
export function FileDisplay({ file }) {
  const [fullscreen, setFullscreen] = useState(false);
  if (!file) return null;
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType?.startsWith("image/");

  if (isPdf) {
    const driveFileId = extractDriveFileId(file);
    // Kalau ID file Drive-nya ketemu (dari field mana pun), SELALU pakai
    // proxy kita sendiri — ini yang membuat file lama (belum punya
    // previewUrl) ikut dapat manfaat proxy tanpa perlu diupload ulang.
    // Kalau tidak ketemu (file lokal murni / data URL base64), baru
    // pakai previewUrl/url apa adanya.
    const rawSrc = driveFileId ? `/api/drive-file/${driveFileId}` : file.previewUrl || file.url;
    // Untuk PDF yang dilayani langsung (proxy kita sendiri atau data URL
    // lokal — bukan halaman viewer Google), minta browser sembunyikan
    // toolbar viewer PDF bawaannya sendiri juga (didukung Chrome/Edge,
    // sebagian besar juga oleh Firefox — di browser lain fragment ini
    // aman diabaikan begitu saja).
    const isOwnProxyOrLocal = !rawSrc.startsWith("https://docs.google.com");
    const embedSrc = isOwnProxyOrLocal ? `${rawSrc}#toolbar=0&navpanes=0` : rawSrc;
    const downloadSrc = file.downloadUrl || rawSrc;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-end gap-2 flex-wrap mb-2">
          <a
            href={downloadSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⬇ Download
          </a>
          <a
            href={rawSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⤴ Buka di Tab Baru
          </a>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⤢ Perbesar
          </button>
        </div>
        <p className="text-xs text-ink/40 mb-2">
          Kalau preview di bawah tidak tampil (kadang terjadi di sebagian browser Android), pakai tombol
          "Buka di Tab Baru" — filenya akan tampil penuh di tab baru.
        </p>
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
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={rawSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-paper/80 hover:text-paper underline underline-offset-2"
                >
                  ⤴ Buka di Tab Baru
                </a>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  aria-label="Tutup"
                  className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-ink-light text-2xl leading-none"
                >
                  ×
                </button>
              </div>
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
    const imgDriveFileId = extractDriveFileId(file);
    const downloadSrc = file.downloadUrl || (imgDriveFileId ? `/api/drive-file/${imgDriveFileId}` : file.url);
    return (
      <div className="mt-4">
        <div className="flex items-center justify-end mb-2">
          <a
            href={downloadSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            ⬇ Download
          </a>
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          onContextMenu={blockContextMenu}
          className="block w-full text-left select-none"
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
      </div>
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

  const sorted = [...files].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    if (!nameA && !nameB) return 0;
    if (!nameA) return 1;
    if (!nameB) return -1;
    return nameA.localeCompare(nameB, "id", { numeric: true, sensitivity: "base" });
  });

  return (
    <div>
      {sorted.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {sorted.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-xs font-semibold px-3 py-2 rounded-md border transition-colors break-all text-left ${
                active === i ? "bg-ink text-paper border-ink" : "text-ink/60 border-ink/20 hover:border-brass"
              }`}
            >
              {f.name || `File ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <FileDisplay file={sorted[active]} />
    </div>
  );
}
