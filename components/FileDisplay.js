"use client";

import { useEffect, useState } from "react";

function blockContextMenu(e) {
  e.preventDefault();
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }
  }, []);
  return isMobile;
}

/**
 * Menampilkan satu file: gambar tampil langsung, PDF tampil lewat proxy
 * milik aplikasi sendiri (`/api/drive-file/[fileId]`, lihat
 * `lib/google/driveClient.js`) — file baru yang diupload TIDAK lagi
 * ditampilkan lewat halaman viewer Google, jadi tombol "Pop-out" bawaan
 * Google Docs Viewer (yang mengarah ke sumber asli di Drive) tidak
 * muncul sama sekali. TIDAK ada tombol download, klik kanan dan seleksi
 * teks pada area viewer juga dinonaktifkan.
 *
 * Catatan khusus HP: viewer PDF bawaan Safari/Chrome di iOS & Android
 * TIDAK bisa diandalkan untuk menampilkan PDF banyak halaman di dalam
 * iframe (sering cuma tampil 1 halaman/terpotong, sulit di-scroll) —
 * ini keterbatasan browser mobile itu sendiri, bukan sesuatu yang bisa
 * diperbaiki lewat CSS. Solusinya: di HP, PDF dibuka di tab baru
 * (viewer native browser di situ bekerja penuh dengan semua halaman),
 * bukan di-embed di dalam iframe halaman. Di desktop, preview inline di
 * dalam kotak tetap dipakai seperti biasa.
 *
 * Catatan jujur: ini jauh lebih baik dari sekadar sembunyikan tombol di
 * CSS (karena URL Drive aslinya tidak lagi pernah dikirim ke browser
 * sama sekali), TAPI tetap bukan proteksi yang benar-benar kedap:
 * aplikasi ini belum punya sistem login berbasis session di server, jadi
 * URL proxy kita sendiri (`/api/drive-file/...`) masih bisa diakses
 * langsung tanpa login kalau seseorang menyalin URL-nya dari Network
 * tab browser. Proteksi tingkat ini menghilangkan cara paling mudah
 * (klik kanan, tombol download, tombol Pop-out Google) untuk pengguna
 * awam, bukan proteksi keamanan tingkat server.
 */
export function FileDisplay({ file }) {
  const [fullscreen, setFullscreen] = useState(false);
  const isMobile = useIsMobile();
  if (!file) return null;
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType?.startsWith("image/");

  if (isPdf) {
    const rawSrc = file.previewUrl || file.url;
    // Untuk PDF yang dilayani langsung (proxy kita sendiri atau data URL
    // lokal — bukan halaman viewer Google), minta browser sembunyikan
    // toolbar viewer PDF bawaannya sendiri juga (didukung Chrome/Edge,
    // sebagian besar juga oleh Firefox — di browser lain fragment ini
    // aman diabaikan begitu saja).
    const isOwnProxyOrLocal = !rawSrc.startsWith("https://docs.google.com");
    const embedSrc = isOwnProxyOrLocal ? `${rawSrc}#toolbar=0&navpanes=0` : rawSrc;

    if (isMobile) {
      return (
        <div className="mt-4">
          <div
            onContextMenu={blockContextMenu}
            className="w-full rounded-md border border-ink/10 bg-paper-dark/30 shadow-stamp px-5 py-8 flex flex-col items-center text-center select-none"
          >
            <span className="text-4xl mb-3">📄</span>
            <p className="text-sm font-semibold text-ink mb-1 break-all">{file.name || "Lampiran PDF"}</p>
            <p className="text-xs text-ink/45 mb-4">
              Dokumen ini hanya bisa dilihat di dalam Pocket Book. Ketuk tombol di bawah untuk membacanya —
              semua halaman akan tampil penuh di tab baru.
            </p>
            <a
              href={embedSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-paper text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-ink-light transition-colors"
            >
              ⤢ Buka PDF Layar Penuh
            </a>
          </div>
        </div>
      );
    }

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
