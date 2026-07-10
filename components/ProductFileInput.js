"use client";

import { useRef, useState } from "react";
import { uploadFileSmart, isDriveHosted } from "@/lib/fileUpload";

/**
 * Input lampiran foto ATAU PDF tunggal (dipakai untuk field Summary/
 * Ilustrasi/Cara Menjual produk). `value` berbentuk
 * { url, downloadUrl, previewUrl, mimeType, name } atau null.
 */
export default function ProductFileInput({ value, onChange, label = "Lampiran Foto / PDF (opsional)" }) {
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
    if (result) onChange(result);

    setProcessing(false);
    e.target.value = "";
  }

  const isPdfValue = value?.mimeType === "application/pdf";
  const isImageValue = value?.mimeType?.startsWith("image/");
  const driveHosted = isDriveHosted(value);

  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 mb-2">
          {isImageValue && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={value.name || ""} className="w-16 h-16 rounded object-cover border border-ink/10" />
          )}
          {isPdfValue && (
            <div className="w-16 h-16 rounded border border-ink/10 bg-paper-dark/40 flex items-center justify-center text-2xl">
              📄
            </div>
          )}
          <div className="text-xs text-ink/60 min-w-0">
            <p className="truncate max-w-[200px]">{value.name || "File terlampir"}</p>
            {driveHosted ? (
              <p className="text-sage font-semibold mt-0.5">✓ Tersimpan di Google Drive</p>
            ) : (
              <p className="text-rust font-semibold mt-0.5">⚠ Belum ter-upload ke Drive</p>
            )}
            <button type="button" onClick={() => onChange(null)} className="text-rust underline underline-offset-2 mt-1">
              Hapus lampiran
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink/45 mb-2">Belum ada file dilampirkan.</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5 disabled:opacity-60"
      >
        {processing ? "Memproses…" : value ? "Ganti File" : "Unggah Foto / PDF"}
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
