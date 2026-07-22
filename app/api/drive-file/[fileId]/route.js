import { google } from "googleapis";
import { getGoogleAuth, getGoogleDriveOAuthClient } from "@/lib/google/googleAuth";

function getDriveAuth() {
  return getGoogleDriveOAuthClient() || getGoogleAuth();
}

/**
 * Melayani isi file Google Drive langsung dari domain aplikasi kita
 * sendiri (bukan lewat halaman viewer Google) — supaya PDF/foto yang
 * ditampilkan di halaman tidak lagi punya tombol "Pop-out" bawaan
 * Google Docs Viewer yang mengarah ke sumber aslinya di Drive.
 *
 * Browser akan merender PDF-nya pakai viewer PDF bawaan browser sendiri
 * (Chrome/Edge/Firefox), yang toolbar-nya juga sudah kita minta
 * disembunyikan lewat parameter `#toolbar=0` di src iframe (lihat
 * components/FileDisplay.js).
 */
export async function GET(request, { params }) {
  const { fileId } = params;
  if (!fileId) {
    return new Response("File ID wajib diisi.", { status: 400 });
  }

  const auth = getDriveAuth();
  if (!auth) {
    return new Response("Kredensial Google Drive belum diatur di server.", { status: 503 });
  }

  try {
    const drive = google.drive({ version: "v3", auth });

    const meta = await drive.files.get({
      fileId,
      fields: "mimeType, name",
      supportsAllDrives: true,
    });

    const fileRes = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "arraybuffer" }
    );

    const mimeType = meta.data.mimeType || "application/octet-stream";

    return new Response(fileRes.data, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        // "inline" (bukan "attachment") supaya browser menampilkannya
        // langsung, bukan langsung mengunduh.
        "Content-Disposition": `inline; filename="${(meta.data.name || "file").replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Gagal mengambil file dari Google Drive:", err);
    return new Response("Gagal memuat file dari Google Drive.", { status: 500 });
  }
}
