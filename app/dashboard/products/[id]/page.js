"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as store from "@/lib/store";
import { FileListDisplay } from "@/components/FileDisplay";
import Linkified from "@/components/Linkified";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(undefined);

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
        {product.subCategory ? ` · ${product.subCategory}` : ""}
      </p>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-6">{product.name}</h1>

      <div className="bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp perforated">
        {product.description && (
          <Linkified text={product.description} className="text-[15px] sm:text-sm leading-relaxed text-charcoal/85 mb-4" />
        )}
        <FileListDisplay files={product.files || []} />
        {!product.description && (!product.files || product.files.length === 0) && (
          <p className="text-sm text-ink/50">Belum ada detail untuk produk ini.</p>
        )}
      </div>
    </div>
  );
}
