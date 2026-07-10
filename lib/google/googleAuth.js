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

/**
 * Autentikasi khusus untuk Google Drive lewat OAuth2 memakai akun Google
 * ASLI (misalnya syam.rakhmany@gmail.com), bukan Service Account.
 *
 * Kenapa perlu ini padahal Sheets sudah jalan dengan Service Account?
 * Karena Service Account TIDAK punya kuota penyimpanan sendiri di Google
 * Drive biasa (akun personal/non-Workspace) — Google akan menolak upload
 * file baru dengan error "Service Accounts do not have storage quota".
 * Sheets tidak kena masalah ini karena kita cuma mengedit isi file yang
 * sudah ada (bukan membuat file baru), tapi upload foto ke Drive itu
 * selalu membuat file baru, jadi butuh identitas dengan kuota asli.
 *
 * Env yang dibutuhkan:
 *  - GOOGLE_OAUTH_CLIENT_ID
 *  - GOOGLE_OAUTH_CLIENT_SECRET
 *  - GOOGLE_OAUTH_REFRESH_TOKEN
 * (cara mendapatkan nilai-nilai ini ada di README.md bagian
 * "Menyambungkan ke Google Sheets & Google Drive")
 */
export function getGoogleDriveOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
