import { NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/google/sheetsClient";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, komisiKompensasi: null });
  }
  try {
    const rows = await readSheet("KomisiKompensasi");
    return NextResponse.json({ configured: true, komisiKompensasi: rows[0] || null });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, error: "Google Sheets belum dikonfigurasi." }, { status: 503 });
  }
  try {
    const { komisiKompensasi } = await request.json();
    await writeSheet("KomisiKompensasi", komisiKompensasi ? [komisiKompensasi] : []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
