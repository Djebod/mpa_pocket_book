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
 * Mengunggah satu foto (data URL base64, hasil dari <PhotoInput />) ke
 * folder Google Drive milik agency, lalu mengembalikan URL publiknya untuk
 * disimpan di kolom `photoUrl` pada Activities sheet — supaya foto tidak
 * lagi disimpan sebagai teks base64 raksasa di dalam data aktivitas.
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

  return {
    id: created.data.id,
    url: created.data.webContentLink || created.data.webViewLink,
  };
}
