"use client";

import { useRef, useState } from "react";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;
// Batas ukuran file PDF sebelum diunggah. PDF tidak bisa dikompres
// otomatis seperti foto (tidak ada "resize" untuk dokumen), dan server
// (Vercel) punya batas ukuran request sekitar 4.5MB — di atas itu upload
// akan gagal dengan error "Request Entity Too Large".
const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
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
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * Input lampiran foto ATAU PDF untuk field produk (Summary/Ilustrasi/Cara
 * Menjual). `value` berbentuk { url, downloadUrl, mimeType, name } atau
 * null. Foto otomatis dikompres; PDF diunggah apa adanya. Kalau Google
 * Drive belum terkonfigurasi, tetap dipakai lokal (data URL) sebagai
 * fallback supaya fitur tidak rusak.
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

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setError("Hanya file foto atau PDF yang didukung.");
      setProcessing(false);
      e.target.value = "";
      return;
    }

    if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
      setError(
        `File PDF terlalu besar (${formatMB(file.size)}MB). Maksimal 4MB. Coba kompres dulu PDF-nya (misalnya lewat ilovepdf.com atau smallpdf.com), lalu upload ulang.`
      );
      setProcessing(false);
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = isImage ? await compressImage(file) : await readAsDataURL(file);
      let result = {
        url: dataUrl,
        downloadUrl: dataUrl,
        previewUrl: null,
        mimeType: isPdf ? "application/pdf" : "image/jpeg",
        name: file.name,
        hostedOnDrive: false,
      };

      try {
        const res = await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          // Respons bukan JSON — biasanya ini terjadi kalau ukuran file
          // melebihi batas server (Vercel menolak sebelum kode kita sempat
          // jalan, jadi jawabannya bukan JSON error buatan kita).
          throw new Error(
            res.status === 413
              ? "Ukuran file terlalu besar untuk server (maksimal ±4MB)."
              : `Server merespons tidak terduga (status ${res.status}).`
          );
        }

        if (data.ok && data.viewUrl) {
          result = {
            url: data.viewUrl,
            downloadUrl: data.downloadUrl || data.viewUrl,
            previewUrl: data.previewUrl || null,
            mimeType: data.mimeType || result.mimeType,
            name: file.name,
            hostedOnDrive: true,
          };
        } else {
          setError(
            `File tersimpan sementara di browser ini saja — gagal diunggah ke Google Drive (${
              data.error || "sebab tidak diketahui"
            }). Klik "Ganti File" untuk coba lagi setelah masalah Drive diperbaiki.`
          );
        }
      } catch (err) {
        setError(
          `File tersimpan sementara di browser ini saja — gagal terhubung ke Google Drive (${err.message}). PDF/foto berukuran besar yang tidak ter-upload ke Drive TIDAK akan ikut tersimpan ke Google Sheets.`
        );
      }

      onChange(result);
    } catch (err) {
      setError(err.message || "Gagal memproses file.");
    }
    setProcessing(false);
    e.target.value = "";
  }

  const isPdfValue = value?.mimeType === "application/pdf";
  const isImageValue = value?.mimeType?.startsWith("image/");
  const isDriveHosted =
    value?.hostedOnDrive === true ||
    (value?.hostedOnDrive === undefined && typeof value?.url === "string" && value.url.startsWith("https://drive.google.com"));

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
            {isDriveHosted ? (
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
