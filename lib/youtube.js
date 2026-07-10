/**
 * Mengubah link YouTube apa pun (watch?v=, youtu.be/, shorts/, atau yang
 * sudah embed) menjadi format /embed/ yang bisa dipakai di dalam
 * <iframe>. Link watch biasa (youtube.com/watch?v=...) TIDAK bisa
 * langsung dipakai di iframe — YouTube akan menolaknya ("refused to
 * connect") karena halaman watch punya proteksi X-Frame-Options.
 */
export function toYouTubeEmbedUrl(rawUrl) {
  if (!rawUrl) return "";
  const url = rawUrl.trim();

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // Sudah format embed — pakai apa adanya.
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      return url;
    }

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (host === "youtube.com" && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // youtube.com/shorts/VIDEO_ID
    if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // Format lain yang tidak dikenali — kembalikan apa adanya.
    return url;
  } catch {
    return url;
  }
}
