"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as store from "@/lib/store";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setProducts(store.getProducts());
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );

  const subCategories = useMemo(() => {
    const relevant = category === "all" ? products : products.filter((p) => p.category === category);
    return Array.from(new Set(relevant.map((p) => p.subCategory).filter(Boolean))).sort();
  }, [products, category]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (subCategory !== "all" && p.subCategory !== subCategory) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${p.name} ${p.category} ${p.subCategory || ""} ${p.summary || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, category, subCategory, search]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Katalog Produk</h1>
      <p className="text-sm text-ink/60 mb-8">
        Pilih produk untuk melihat summary, ilustrasi, cara menjual, dan video penjelasan.
      </p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-5 py-5 mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama produk, kategori, atau kata kunci..."
            className="flex-1 rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <button
            type="submit"
            className="bg-ink text-paper text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory("all");
              }}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Sub Kategori</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={subCategories.length === 0}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none disabled:opacity-50"
            >
              <option value="all">Semua Sub Kategori</option>
              {subCategories.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          {products.length === 0
            ? "Belum ada produk. Hubungi Admin untuk menambahkan produk."
            : "Tidak ada produk yang cocok dengan filter/pencarian."}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/products/${p.id}`}
              className="group bg-card border border-ink/10 rounded-lg px-5 py-5 shadow-stamp hover:border-brass transition-colors perforated"
            >
              <p className="font-mono text-[11px] uppercase tracking-wide text-brass mb-1.5">
                {p.category}
                {p.subCategory ? ` · ${p.subCategory}` : ""}
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
