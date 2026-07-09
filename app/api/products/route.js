import { NextResponse } from "next/server";
import { readSheet, writeSheet, isSheetsConfigured } from "@/lib/google/sheetsClient";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, products: [] });
  }
  try {
    const products = await readSheet("Products");
    return NextResponse.json({ configured: true, products });
  } catch (err) {
    return NextResponse.json({ configured: true, error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ configured: false, error: "Google Sheets belum dikonfigurasi." }, { status: 503 });
  }
  try {
    const { products } = await request.json();
    await writeSheet("Products", products || []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
