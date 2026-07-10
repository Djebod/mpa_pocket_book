"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as store from "@/lib/store";

const TABS = [
  { key: "summary", label: "Summary Produk" },
  { key: "ilustrasi", label: "Ilustrasi Produk" },
  { key: "caraMenjual", label: "Cara Menjual" },
  { key: "video", label: "Video Penjelasan" },
];

function ProductFileDisplay({ file }) {
  if (!file) return null;
  const isPdf = file.mimeType === "application/pdf";
  const isImage = file.mimeType?.startsWith("image/");

  if (isPdf) {
    return (
      <a
        href={file.downloadUrl || file.url}
        target="_blank"
        rel="noopener noreferrer"
        download={file.name || undefined}
        className="mt-4 inline-flex items-center gap-2 bg-ink text-paper text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors"
      >
        📄 Download PDF{file.name ? ` — ${file.name}` : ""}
      </a>
    );
  }

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name || "Lampiran produk"}
        className="mt-4 max-w-full h-auto rounded-md border border-ink/10"
      />
    );
  }

  return null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(undefined);
  const [tab, setTab] = useState("summary");

  useEffect(() => {
    setProduct(store.getProductById(id));
  }, [id]);

  if (product === undefined) {
    return <p className="font-mono text-sm text-ink/50">Memuat…</p>;
  }

  if (product === null) {
    return (
      <div>
        <p className="text-sm text-ink/60 mb-4">Produk tidak ditemukan.</p>
        <Link href="/dashboard/products" className="text-sm text-brass underline">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/products"
        className="text-xs font-semibold text-ink/50 hover:text-brass underline underline-offset-2"
      >
        ← Katalog Produk
      </Link>

      <p className="font-mono text-[11px] uppercase tracking-wide text-brass mt-4 mb-1.5">
        {product.category}
      </p>
      <h1 className="font-display italic text-3xl text-ink mb-6">{product.name}</h1>

      <div className="flex gap-1 border-b border-ink/15 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-notch whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-card text-ink border border-b-0 border-ink/15"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-ink/10 rounded-lg rounded-tl-none px-6 py-6 shadow-stamp min-h-[220px]">
        {tab === "summary" && (
          <div>
            <p className="text-sm leading-relaxed text-charcoal/85 whitespace-pre-line">{product.summary}</p>
            <ProductFileDisplay file={product.summaryFile} />
          </div>
        )}
        {tab === "ilustrasi" && (
          <div>
            <p className="text-sm leading-relaxed text-charcoal/85 whitespace-pre-line">{product.ilustrasi}</p>
            <ProductFileDisplay file={product.ilustrasiFile} />
          </div>
        )}
        {tab === "caraMenjual" && (
          <div>
            <p className="text-sm leading-relaxed text-charcoal/85 whitespace-pre-line">{product.caraMenjual}</p>
            <ProductFileDisplay file={product.caraMenjualFile} />
          </div>
        )}
        {tab === "video" && (
          <div>
            {product.videoUrl ? (
              <div className="aspect-video w-full rounded-md overflow-hidden bg-ink/10">
                <iframe
                  src={product.videoUrl}
                  title={`Video penjelasan ${product.name}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-ink/50">Belum ada video untuk produk ini.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
