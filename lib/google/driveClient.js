import { google } from "googleapis";
import { Readable } from "stream";
import { getGoogleAuth, getGoogleDriveOAuthClient } from "./googleAuth";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Pilih cara autentikasi untuk Drive: OAuth2 (akun Google asli, punya
 * kuota) kalau tersedia, kalau tidak fallback ke Service Account (hanya
 * akan berhasil kalau memakai Shared Drive — lihat catatan di
 * getGoogleDriveOAuthClient untuk penjelasan lengkap kenapa OAuth2 lebih
 * disarankan untuk akun Google personal).
 */
function getDriveAuth() {
  return getGoogleDriveOAuthClient() || getGoogleAuth();
}

export function isDriveConfigured() {
  return Boolean(getDriveAuth() && FOLDER_ID);
}

function dataUrlToBuffer(dataUrl) {
  const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || "");
  if (!match) throw new Error("Format data URL foto tidak valid.");
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

/**
 * Mengunggah satu file (data URL base64 — foto ATAU PDF) ke folder Google
 * Drive milik agency, lalu mengembalikan info yang dibutuhkan untuk
 * menampilkannya: `viewUrl` (bisa dipakai sebagai <img src> kalau file-nya
 * gambar) dan `downloadUrl` (link download langsung, dipakai untuk tombol
 * "Download PDF" atau file non-gambar lainnya).
 */
export async function uploadPhotoToDrive(dataUrl, filename) {
  const auth = getDriveAuth();
  if (!auth) {
    throw new Error(
      "Kredensial Google Drive belum diatur. Butuh salah satu: GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN (disarankan), atau GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_PRIVATE_KEY + Shared Drive."
    );
  }
  if (!FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID belum diatur di environment variables.");
  }

  const drive = google.drive({ version: "v3", auth });
  const { mime, buffer } = dataUrlToBuffer(dataUrl);

  const created = await drive.files.create({
    requestBody: { name: filename, parents: [FOLDER_ID] },
    media: { mimeType: mime, body: Readable.from(buffer) },
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  // Jadikan file bisa diakses lewat link (read-only) supaya bisa ditampilkan
  // langsung di halaman admin/member tanpa perlu login Google tiap kali.
  await drive.permissions.create({
    fileId: created.data.id,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
  });

  const downloadUrl =
    created.data.webContentLink || `https://drive.google.com/uc?id=${created.data.id}&export=download`;

  return {
    id: created.data.id,
    mimeType: mime,
    // webContentLink (link "download") tidak reliable dipakai sebagai
    // src <img> — Google sering mengarahkannya ke halaman preview/HTML,
    // bukan file gambar langsung, sehingga muncul ikon "foto rusak" di
    // UI. Format /thumbnail ini didukung resmi oleh Google Drive untuk
    // ditampilkan langsung sebagai gambar di halaman web.
    viewUrl: `https://drive.google.com/thumbnail?id=${created.data.id}&sz=w1000`,
    // Dipakai untuk tombol "Download PDF" lama — link ini memang sengaja
    // memicu download (Content-Disposition: attachment dari Google).
    // Tidak lagi dipakai untuk preview inline maupun tombol download
    // (tombol download sudah dihapus dari UI), tapi tetap disimpan
    // sebagai cadangan/referensi.
    downloadUrl,
    // Proxy milik aplikasi sendiri (lihat app/api/drive-file/[fileId])
    // yang mengalirkan isi file langsung dari server kita — BUKAN lewat
    // halaman viewer Google. Ini menghindari tombol "Pop-out" bawaan
    // Google Docs Viewer yang mengarah ke sumber asli file di Drive.
    previewUrl: `/api/drive-file/${created.data.id}`,
  };
}
