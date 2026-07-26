"use client";

import { useRef, useState } from "react";
import { uploadFileSmart, isDriveHosted } from "@/lib/fileUpload";

/**
 * Input daftar file, tiap baris punya "Nama File" (label bebas dari
 * Admin) + "Upload File" sendiri-sendiri — beda dari MultiFileInput
 * yang otomatis memberi nama "File 1, File 2, dst" dari nama file
 * mentah hasil upload. Di sini nama file yang tampil ke member adalah
 * nama yang diketik Admin, bukan nama file aslinya.
 *
 * `value`: array of { namaFile: string, file: {url, mimeType, name, ...} | null }
 */
export default function NamedFileListInput({ value = [], onChange, label }) {
  const [processingIndex, setProcessingIndex] = useState(null);
  const [error, setError] = useState("");
  const inputRefs = useRef({});

  function addRow() {
    onChange([...value, { namaFile: "", file: null }]);
  }

  function removeRow(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function updateNamaFile(index, namaFile) {
    onChange(value.map((row, i) => (i === index ? { ...row, namaFile } : row)));
  }

  async function handleFileChange(index, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setProcessingIndex(index);

    const { result, error: uploadError } = await uploadFileSmart(file);
    if (uploadError) setError(uploadError);
    if (result) {
      onChange(
        value.map((row, i) =>
          i === index ? { ...row, file: result, namaFile: row.namaFile || result.name || "" } : row
        )
      );
    }

    setProcessingIndex(null);
    e.target.value = "";
  }

  function removeFile(index) {
    onChange(value.map((row, i) => (i === index ? { ...row, file: null } : row)));
  }

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-ink mb-2">{label}</label>}

      <div className="space-y-4">
        {value.map((row, i) => {
          const f = row.file;
          const isPdf = f?.mimeType === "application/pdf";
          const isImage = f?.mimeType?.startsWith("image/");
          const driveHosted = isDriveHosted(f);

          return (
            <div key={i} className="border border-ink/15 rounded-md px-4 py-3.5 bg-paper-dark/30">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">File {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-xs font-semibold text-rust/70 hover:text-rust"
                >
                  Hapus Baris
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-ink mb-1">Nama File</label>
                <input
                  value={row.namaFile}
                  onChange={(e) => updateNamaFile(i, e.target.value)}
                  placeholder="Contoh: Panduan Klaim Rawat Inap"
                  className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              {f ? (
                <div className="flex items-center gap-3 mb-2">
                  {isImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.url} alt="" className="w-12 h-12 rounded object-cover border border-ink/10" />
                  )}
                  {isPdf && (
                    <div className="w-12 h-12 rounded border border-ink/10 bg-paper flex items-center justify-center text-lg">
                      📄
                    </div>
                  )}
                  <div className="text-xs text-ink/60 min-w-0">
                    <p className="truncate max-w-[220px]">{f.name || "File terlampir"}</p>
                    {driveHosted ? (
                      <p className="text-sage font-semibold mt-0.5">✓ Tersimpan di Google Drive</p>
                    ) : (
                      <p className="text-rust font-semibold mt-0.5">⚠ Belum ter-upload ke Drive</p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-rust underline underline-offset-2 mt-1"
                    >
                      Hapus file
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-ink/45 mb-2">Belum ada file diunggah.</p>
              )}

              <button
                type="button"
                onClick={() => inputRefs.current[i]?.click()}
                disabled={processingIndex === i}
                className="text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5 disabled:opacity-60"
              >
                {processingIndex === i ? "Memproses…" : f ? "Ganti File" : "Unggah PDF / Foto"}
              </button>
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(i, e)}
              />
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-rust mt-2">{error}</p>}

      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-xs font-semibold bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink-light transition-colors"
      >
        + Tambah File
      </button>
    </div>
  );
}
