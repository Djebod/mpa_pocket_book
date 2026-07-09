import { google } from "googleapis";

/**
 * Autentikasi ke Google API pakai Service Account (bukan login Google
 * per-pengguna) — cocok untuk aplikasi internal seperti ini, di mana satu
 * "akun robot" yang dibuat lewat Google Cloud Console diberi akses ke satu
 * Google Sheet & satu folder Google Drive milik agency.
 *
 * Dua cara mengisi private key (pakai salah satu):
 *  1. GOOGLE_PRIVATE_KEY_B64 (DIREKOMENDASIKAN) — private key di-encode
 *     base64 dulu, jadi tidak ada karakter `\n` atau tanda kutip yang bisa
 *     salah ter-paste di form Environment Variables. Lihat README.md
 *     bagian "Menyambungkan ke Google Sheets & Google Drive" untuk cara
 *     membuat nilai ini.
 *  2. GOOGLE_PRIVATE_KEY — private key apa adanya (dengan `\n` literal).
 *     Lebih rawan salah paste (kutip ikut kebawa, dsb), tapi didukung
 *     untuk kompatibilitas lama.
 *
 * Env lain yang dibutuhkan:
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL
 */
export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = resolvePrivateKey();
  if (!email || !key) return null;

  return new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

function resolvePrivateKey() {
  const b64 = process.env.GOOGLE_PRIVATE_KEY_B64;
  if (b64) {
    try {
      const decoded = Buffer.from(b64.trim(), "base64").toString("utf8");
      if (decoded.includes("BEGIN PRIVATE KEY")) return decoded;
    } catch (err) {
      console.error("Gagal decode GOOGLE_PRIVATE_KEY_B64:", err);
    }
  }

  const raw = process.env.GOOGLE_PRIVATE_KEY;
  if (!raw) return null;

  let key = raw.trim();
  // Buang tanda kutip pembungkus kalau tidak sengaja ikut ter-paste
  // (umum terjadi saat copy dari file .env ke form Vercel).
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Private key yang disimpan sebagai env var biasanya escaped (\n literal),
  // jadi perlu dikembalikan jadi baris baru sungguhan.
  key = key.replace(/\\n/g, "\n");

  return key.includes("BEGIN PRIVATE KEY") ? key : null;
}
