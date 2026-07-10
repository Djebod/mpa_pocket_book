import { NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/google/sheetsClient";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, promo: [] });
  }
  try {
    const promo = await readSheet("Promo");
    return NextResponse.json({ configured: true, promo });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, error: "Google Sheets belum dikonfigurasi." }, { status: 503 });
  }
  try {
    const { promo } = await request.json();
    await writeSheet("Promo", promo || []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
