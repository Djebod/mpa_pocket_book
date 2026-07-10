"use client";

import { useRef, useState } from "react";

const MAX_DIMENSION = 1600; // px, sisi terpanjang
const JPEG_QUALITY = 0.75;

/**
 * Mengompres gambar di browser (resize + re-encode ke JPEG) sebelum
 * dipakai. Foto asli dari kamera HP bisa 3-8MB — angka itu jauh melebihi
 * batas ukuran request server (menyebabkan error 413 Request Entity Too
 * Large saat upload ke Google Drive) dan juga cepat memenuhi localStorage.
 * Setelah dikompres, foto biasanya turun ke ratusan KB saja, cukup jelas
 * untuk bukti aktivitas.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat foto."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoInput({ value, onChange, required = true }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (err) {
      console.error("Gagal memproses foto:", err);
      // Fallback: tetap coba pakai file asli kalau kompresi gagal.
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result);
      reader.readAsDataURL(file);
    }
    setProcessing(false);
    e.target.value = "";
  }

  return (
    <div>
      <label className="block font-body text-sm font-semibold text-ink mb-2">
        Foto Bukti Aktivitas {required && <span className="text-rust">*</span>}
      </label>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="shrink-0 w-28 h-28 rounded-md border-2 border-dashed border-ink/30 bg-paper-dark/40 flex items-center justify-center text-ink/50 hover:border-brass hover:text-brass transition-colors overflow-hidden disabled:opacity-60"
        >
          {processing ? (
            <span className="text-xs text-center px-2">Memproses…</span>
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pratinjau foto aktivitas" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-center px-2">Ambil / Unggah Foto</span>
          )}
        </button>
        <div className="text-xs text-ink/60 leading-relaxed pt-1">
          Gunakan kamera atau pilih dari galeri. Foto otomatis dikompres
          supaya cepat diunggah. Foto ini menjadi bukti aktivitas yang
          tercatat di riwayat Anda.
          {value && !processing && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="block mt-2 text-rust underline underline-offset-2"
            >
              Hapus foto
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
