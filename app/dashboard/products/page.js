"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as store from "@/lib/store";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(store.getProducts());
  }, []);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Katalog Produk</h1>
      <p className="text-sm text-ink/60 mb-8">
        Pilih produk untuk melihat summary, ilustrasi, cara menjual, dan video penjelasan.
      </p>

      {products.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada produk. Hubungi Admin untuk menambahkan produk.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/products/${p.id}`}
              className="group bg-card border border-ink/10 rounded-lg px-5 py-5 shadow-stamp hover:border-brass transition-colors perforated"
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-brass mb-1.5">
                {p.category}
              </p>
              <h2 className="font-display text-xl text-ink mb-2 group-hover:italic">{p.name}</h2>
              <p className="text-sm text-charcoal/70 line-clamp-2">{p.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
