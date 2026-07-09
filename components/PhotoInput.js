"use client";

import { useRef } from "react";

export default function PhotoInput({ value, onChange, required = true }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
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
          className="shrink-0 w-28 h-28 rounded-md border-2 border-dashed border-ink/30 bg-paper-dark/40 flex items-center justify-center text-ink/50 hover:border-brass hover:text-brass transition-colors overflow-hidden"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pratinjau foto aktivitas" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-center px-2">Ambil / Unggah Foto</span>
          )}
        </button>
        <div className="text-xs text-ink/60 leading-relaxed pt-1">
          Gunakan kamera atau pilih dari galeri. Foto ini menjadi bukti aktivitas
          yang tercatat di riwayat Anda.
          {value && (
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
