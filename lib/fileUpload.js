"use client";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;
const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024; // 4MB — batas request server

export function formatMB(bytes) {
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
 * Memproses & mengunggah satu file (foto ATAU PDF) ke Google Drive.
 * Mengembalikan { result, error } — `result` selalu terisi (fallback ke
 * data lokal kalau Drive gagal), `error` terisi kalau ada pesan yang
 * perlu ditampilkan ke pengguna (upload gagal, file terlalu besar, dst).
 */
export async function uploadFileSmart(file) {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  if (!isPdf && !isImage) {
    return { result: null, error: "Hanya file foto atau PDF yang didukung." };
  }

  if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
    return {
      result: null,
      error: `File PDF terlalu besar (${formatMB(file.size)}MB). Maksimal 4MB. Kompres dulu lewat ilovepdf.com atau smallpdf.com, lalu upload ulang.`,
    };
  }

  let dataUrl;
  try {
    dataUrl = isImage ? await compressImage(file) : await readAsDataURL(file);
  } catch (err) {
    return { result: null, error: err.message || "Gagal memproses file." };
  }

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
      return {
        result,
        error:
          res.status === 413
            ? "Ukuran file terlalu besar untuk server (maksimal ±4MB)."
            : `Server merespons tidak terduga (status ${res.status}). File tersimpan lokal saja.`,
      };
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
      return { result, error: null };
    }

    return {
      result,
      error: `File tersimpan sementara di browser ini saja — gagal diunggah ke Google Drive (${
        data.error || "sebab tidak diketahui"
      }).`,
    };
  } catch (err) {
    return {
      result,
      error: `File tersimpan sementara di browser ini saja — gagal terhubung ke Google Drive (${err.message}).`,
    };
  }
}

export function isDriveHosted(file) {
  return (
    file?.hostedOnDrive === true ||
    (file?.hostedOnDrive === undefined && typeof file?.url === "string" && file.url.startsWith("https://drive.google.com"))
  );
}
