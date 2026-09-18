import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Kolom setiap tab (sheet) di Google Spreadsheet. Baris pertama tiap tab
// harus berisi header persis seperti ini (dibuat otomatis oleh writeSheet
// kalau tab masih kosong).
const SHEET_HEADERS = {
  Members: ["id", "name", "email", "password", "role", "phone", "directLeaderId", "joinedAt"],
  Products: [
    "id",
    "name",
    "category",
    "subCategory",
    "materiTrainingManulife",
    "materiTrainingMPA",
    "tabelPremi",
    "tabelPremiLinkUrl",
    "resume",
    "tabelMedical",
    "fileKetsusUrl",
    "videoUrl",
  ],
  Activities: [
    "id",
    "memberId",
    "memberName",
    "category",
    "method",
    "type",
    "points",
    "contactId",
    "contactName",
    "contactProfession",
    "productSold",
    "premiumNominal",
    "note",
    "photoUrl",
    "date",
    "validated",
    "validatedAt",
    "validatedBy",
    "invalid",
    "invalidAt",
    "invalidBy",
    "createdAt",
  ],
  Contacts: ["id", "memberId", "name", "profession", "category", "createdAt"],
  Promo: ["id", "typePromo", "category", "files", "createdAt"],
  Tutorials: ["id", "title", "driveLink", "createdAt"],
  Recruit: ["id", "description", "files"],
  AnalisaKebutuhan: ["id", "description", "materi", "flier", "videoUrl"],
  KomisiKompensasi: ["id", "description", "files"],
  AfterSalesClaim: ["id", "category", "files", "createdAt"],
};

export function isSheetsConfigured() {
  return Boolean(getGoogleAuth() && SHEET_ID);
}

async function getSheetsApi() {
  const auth = getGoogleAuth();
  if (!auth) {
    throw new Error(
      "Kredensial Google Service Account belum diatur (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)."
    );
  }
  if (!SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID belum diatur di environment variables.");
  }
  return google.sheets({ version: "v4", auth });
}

/**
 * Membaca semua baris pada satu tab sheet sebagai array of object.
 *
 * PENTING: pemetaan kolom memakai **baris header asli di Sheet** (baris 1),
 * bukan urutan di SHEET_HEADERS. Ini disengaja — dulu pemetaannya
 * posisional, sehingga begitu ada kolom baru disisipkan di tengah daftar
 * SHEET_HEADERS, seluruh data lama di Sheet ikut bergeser satu kolom
 * (mis. kolom Tanggal jadi menampilkan nilai `validated`). Dengan
 * memetakan berdasarkan nama kolom, urutan kolom di Sheet boleh berbeda
 * dari SHEET_HEADERS dan data lama tetap terbaca benar.
 *
 * Kolom yang ada di SHEET_HEADERS tapi belum ada di Sheet (mis. kolom
 * baru yang belum pernah ditulis) otomatis diisi string kosong.
 */
export async function readSheet(sheetName) {
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) throw new Error(`Sheet tidak dikenal: ${sheetName}`);

  const sheets = await getSheetsApi();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: sheetName, // seluruh data terpakai, termasuk baris header
  });

  const rows = res.data.values || [];
  if (rows.length === 0) return [];

  // Baris pertama = header asli di Sheet. Kalau kosong/tidak terbaca,
  // jatuh kembali ke urutan kanonik supaya tidak error.
  const sheetHeaders = (rows[0] || []).map((h) => String(h || "").trim());
  const usable = sheetHeaders.some(Boolean) ? sheetHeaders : headers;

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
    .map((row) => {
      const obj = {};
      // Isi dulu semua kolom kanonik sebagai string kosong, supaya kolom
      // baru yang belum ada di Sheet tetap terdefinisi.
      headers.forEach((h) => {
        obj[h] = "";
      });
      usable.forEach((h, i) => {
        if (!h) return;
        obj[h] = row[i] ?? "";
      });
      return obj;
    });
}

/**
 * Menimpa seluruh isi satu tab sheet dengan daftar record baru (mirip pola
 * saveMembers/saveProducts/saveActivities di lib/store.js — ambil semua,
 * ubah di memori, simpan kembali seluruhnya).
 */
export async function writeSheet(sheetName, records) {
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) throw new Error(`Sheet tidak dikenal: ${sheetName}`);

  const sheets = await getSheetsApi();
  const values = [headers, ...records.map((r) => headers.map((h) => r[h] ?? ""))];

  // Bersihkan SELURUH tab, bukan cuma sampai kolom terakhir yang kita
  // kenal — supaya kolom sisa dari struktur lama (mis. `phone`,
  // `contactPhone` sebelum diganti `profession`) tidak tertinggal dan
  // ikut terbaca sebagai kolom hantu oleh readSheet.
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: sheetName,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
