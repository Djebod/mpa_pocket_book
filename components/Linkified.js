"use client";

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_MATCH_REGEX = /^https?:\/\//;

/**
 * Menampilkan teks biasa, tapi link http(s) di dalamnya otomatis jadi
 * bisa diklik (dibuka di tab baru). Dipakai di halaman-halaman deskripsi
 * (Promo & Kontes, Recruit, dll) yang sering
 * menyertakan link Google Form / WhatsApp di dalam teksnya.
 */
export default function Linkified({ text, className = "" }) {
  if (!text) return null;
  const parts = text.split(URL_SPLIT_REGEX);

  return (
    <p className={`whitespace-pre-line ${className}`}>
      {parts.map((part, i) =>
        URL_MATCH_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline underline-offset-2 hover:text-brass-light break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
