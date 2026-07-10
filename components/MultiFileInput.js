"use client";

import { useRef, useState } from "react";
import { uploadFileSmart, isDriveHosted } from "@/lib/fileUpload";

/**
 * Input lampiran banyak file (foto/PDF) sekaligus. `value` adalah array
 * dari { url, downloadUrl, previewUrl, mimeType, name }. Dipakai di
 * halaman Komisi & Kompensasi dan Promo yang butuh "Attach File 1, Attach
 * File 2, dst".
 */
export default function MultiFileInput({ value = [], onChange, label = "Lampiran (Foto / PDF)" }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setProcessing(true);

    const { result, error: uploadError } = await uploadFileSmart(file);
    if (uploadError) setError(uploadError);
    if (result) onChange([...value, result]);

    setProcessing(false);
    e.target.value = "";
  }

  function removeAt(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>

      {value.length > 0 && (
        <ul className="space-y-2 mb-3">
          {value.map((f, i) => {
            const isPdf = f.mimeType === "application/pdf";
            const isImage = f.mimeType?.startsWith("image/");
            const driveHosted = isDriveHosted(f);
            return (
              <li key={i} className="flex items-center gap-3 bg-paper border border-ink/10 rounded-md px-3 py-2">
                {isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.name || ""} className="w-10 h-10 rounded object-cover border border-ink/10 shrink-0" />
                )}
                {isPdf && (
                  <div className="w-10 h-10 rounded border border-ink/10 bg-paper-dark/40 flex items-center justify-center text-lg shrink-0">
                    📄
                  </div>
                )}
                <div className="text-xs text-ink/60 min-w-0 flex-1">
                  <p className="truncate">{f.name || `File ${i + 1}`}</p>
                  {driveHosted ? (
                    <p className="text-sage font-semibold">✓ Google Drive</p>
                  ) : (
                    <p className="text-rust font-semibold">⚠ Belum ke Drive</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-xs text-rust/70 hover:text-rust shrink-0"
                >
                  Hapus
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5 disabled:opacity-60"
      >
        {processing ? "Memproses…" : `+ Tambah File ${value.length + 1}`}
      </button>
      {error && <p className="text-xs text-rust mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
