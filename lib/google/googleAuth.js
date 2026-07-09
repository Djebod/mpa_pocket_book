import { google } from "googleapis";

/**
 * Autentikasi ke Google API pakai Service Account (bukan login Google
 * per-pengguna) — cocok untuk aplikasi internal seperti ini, di mana satu
 * "akun robot" yang dibuat lewat Google Cloud Console diberi akses ke satu
 * Google Sheet & satu folder Google Drive milik agency.
 *
 * Env yang dibutuhkan (isi di file .env.local, lihat .env.example):
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  - GOOGLE_PRIVATE_KEY
 *
 * Lihat README.md bagian "Menyambungkan ke Google Sheets & Google Drive"
 * untuk panduan lengkap membuat Service Account ini.
 */
export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) return null;

  // Private key yang disimpan sebagai env var biasanya escaped (\n literal),
  // jadi perlu dikembalikan jadi baris baru sungguhan.
  const key = rawKey.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}
