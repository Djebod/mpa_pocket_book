import { NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/google/sheetsClient";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, afterSalesClaim: [] });
  }
  try {
    const afterSalesClaim = await readSheet("AfterSalesClaim");
    return NextResponse.json({ configured: true, afterSalesClaim });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, error: "Google Sheets belum dikonfigurasi." }, { status: 503 });
  }
  try {
    const { afterSalesClaim } = await request.json();
    await writeSheet("AfterSalesClaim", afterSalesClaim || []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
