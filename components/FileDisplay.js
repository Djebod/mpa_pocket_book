"use client";

import { useState } from "react";

function blockContextMenu(e) {
  e.preventDefault();
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
 * Catatan soal HP: viewer PDF di dalam iframe kadang tidak sempurna di
 * sebagian browser mobile (semua browser di iOS — termasuk Chrome —
 * wajib pakai mesin WebKit dari Apple, jadi punya batasan yang sama
 * seperti Safari). Preview inline tetap ditampilkan seperti biasa di
 * semua device, TAPI selalu disediakan juga tombol "⤢ Buka PDF Layar
 * Penuh" yang membuka file di tab baru — di situ viewer PDF bawaan
 * browser bekerja penuh (semua halaman, bisa di-scroll/zoom normal),
 * jadi selalu ada jalan pasti kalau preview inline-nya kurang optimal.
 *
 * Catatan jujur soal proteksi: ini jauh lebih baik dari sekadar
 * sembunyikan tombol di CSS (karena URL Drive aslinya tidak lagi pernah
 * dikirim ke browser sama sekali), TAPI tetap bukan proteksi yang
 * benar-benar kedap: aplikasi ini belum punya sistem login berbasis
 * session di server, jadi URL proxy kita sendiri (`/api/drive-file/...`)
 * masih bisa diakses langsung tanpa login kalau seseorang menyalin
 * URL-nya dari Network tab browser. Proteksi tingkat ini menghilangkan
 * cara paling mudah (klik kanan, tombol download, tombol Pop-out
 * Google) untuk pengguna awam, bukan proteksi keamanan tingkat server.
 */
export function FileDisplay({ file }) {
  const [fullscreen, setFullscreen] = useState(false);
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
    // Link "buka tab baru" pakai URL polos (tanpa fragment toolbar=0)
    // supaya viewer PDF native browser di tab baru tampil dengan
    // toolbar/kontrol lengkapnya sendiri.
    const openSrc = rawSrc;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <p className="text-xs text-ink/45">Dokumen ini hanya bisa dilihat di dalam Pocket Book.</p>
          <div className="flex gap-2 shrink-0">
            <a
              href={openSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
            >
              ⤢ Buka PDF Layar Penuh
            </a>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
            >
              ⤢ Perbesar
            </button>
          </div>
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
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={openSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-paper/80 hover:text-paper underline underline-offset-2"
                >
                  ⤢ Buka di Tab Baru
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
