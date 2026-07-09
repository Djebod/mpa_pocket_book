import { google } from "googleapis";
import { getGoogleAuth } from "./googleAuth";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Kolom setiap tab (sheet) di Google Spreadsheet. Baris pertama tiap tab
// harus berisi header persis seperti ini (dibuat otomatis oleh writeSheet
// kalau tab masih kosong).
const SHEET_HEADERS = {
  Members: ["id", "name", "email", "password", "role", "phone", "joinedAt"],
  Products: ["id", "name", "category", "summary", "ilustrasi", "caraMenjual", "videoUrl"],
  Activities: [
    "id",
    "memberId",
    "memberName",
    "type",
    "date",
    "customerName",
    "customerPhone",
    "note",
    "photoUrl",
    "createdAt",
  ],
};

function columnLetter(n) {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

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

/** Membaca semua baris pada satu tab sheet sebagai array of object. */
export async function readSheet(sheetName) {
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) throw new Error(`Sheet tidak dikenal: ${sheetName}`);

  const sheets = await getSheetsApi();
  const endCol = columnLetter(headers.length);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:${endCol}`,
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
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
  const endCol = columnLetter(headers.length);
  const values = [headers, ...records.map((r) => headers.map((h) => r[h] ?? ""))];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:${endCol}`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
