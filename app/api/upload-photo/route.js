import { NextResponse } from "next/server";
import { uploadPhotoToDrive, isDriveConfigured } from "@/lib/google/driveClient";

export async function POST(request) {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      { configured: false, error: "Google Drive belum dikonfigurasi." },
      { status: 503 }
    );
  }
  try {
    const { dataUrl, filename } = await request.json();
    if (!dataUrl) {
      return NextResponse.json({ ok: false, error: "dataUrl foto wajib dikirim." }, { status: 400 });
    }
    const result = await uploadPhotoToDrive(dataUrl, filename || `upload-${Date.now()}`);
    // `url` dipertahankan sebagai alias dari viewUrl demi kompatibilitas
    // dengan kode lama (form Aktivitas) yang membaca `data.url`.
    return NextResponse.json({ ok: true, url: result.viewUrl, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
