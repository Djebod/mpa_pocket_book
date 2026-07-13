"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

// Kategori adalah field "kunci" — sengaja dibatasi cuma 2 pilihan supaya
// filter Katalog Produk tetap konsisten (tidak ada variasi penulisan).
const CATEGORY_OPTIONS = ["Unit Link", "Non Unit Link"];

const emptyForm = { name: "", category: CATEGORY_OPTIONS[0], subCategory: "", description: "", files: [] };

/**
 * Mencocokkan Sub Kategori yang baru diketik dengan daftar Sub Kategori
 * yang sudah ada (dibandingkan tanpa peduli spasi di ujung & huruf
 * besar/kecil) — supaya tidak ada entri dobel yang cuma beda spasi/huruf
 * kapital (mis. "Asuransi Jiwa" vs "asuransi jiwa "), tapi Sub Kategori
 * yang benar-benar baru tetap bisa ditambahkan bebas.
 */
function normalizeSubCategory(value, existingList) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = existingList.find((sc) => sc.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    setProducts(store.getProducts());
  }

  useEffect(refresh, []);

  // Daftar Sub Kategori yang sudah pernah dipakai, sudah di-dedup
  // (spasi & huruf besar/kecil diabaikan saat membandingkan), dipakai
  // sebagai saran ketik (datalist) sekaligus acuan anti-duplikat.
  const existingSubCategories = useMemo(() => {
    const seen = new Map(); // key: lowercase trimmed, value: penulisan asli pertama kali muncul
    products.forEach((p) => {
      const raw = (p.subCategory || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!seen.has(key)) seen.set(key, raw);
    });
    return Array.from(seen.values()).sort();
  }, [products]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.category.trim()) {
      setError("Nama dan kategori produk wajib diisi.");
      return;
    }
    const payload = {
      ...form,
      subCategory: normalizeSubCategory(form.subCategory, existingSubCategories),
    };
    if (editingId) {
      store.updateProduct(editingId, payload);
    } else {
      store.addProduct(payload);
    }
    refresh();
    resetForm();
  }

  function handleEdit(product) {
    setForm({
      name: product.name,
      category: CATEGORY_OPTIONS.includes(product.category) ? product.category : CATEGORY_OPTIONS[0],
      subCategory: product.subCategory || "",
      description: product.description || "",
      files: product.files || [],
    });
    setEditingId(product.id);
    setError("");
  }

  function handleDelete(id) {
    if (!confirm("Hapus produk ini dari katalog?")) return;
    store.deleteProduct(id);
    refresh();
    if (editingId === id) resetForm();
  }

  const editingProductHasUnknownCategory =
    editingId && !CATEGORY_OPTIONS.includes(products.find((p) => p.id === editingId)?.category);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Produk</h1>
      <p className="text-sm text-ink/60 mb-8">
        Isi nama, kategori, sub kategori, deskripsi produk, dan lampirkan file (PDF/JPG) — bisa lebih dari satu
        ("Attach File 1, 2, dst").
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Produk" : "Tambah Produk Baru"}</h2>

        {editingProductHasUnknownCategory && (
          <p className="text-xs text-brass bg-brass/10 rounded-md px-3 py-2 mb-5">
            Produk ini masih memakai kategori lama yang sudah tidak berlaku. Pilih salah satu dari 2 kategori di
            bawah, lalu simpan.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Nama Produk</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2.5 text-sm focus:border-brass focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Sub Kategori <span className="font-normal text-ink/45">(opsional)</span>
            </label>
            <input
              value={form.subCategory}
              onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
              placeholder="Contoh: Individu / Keluarga"
              list="sub-kategori-options"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
            <datalist id="sub-kategori-options">
              {existingSubCategories.map((sc) => (
                <option key={sc} value={sc} />
              ))}
            </datalist>
            <p className="text-xs text-ink/45 mt-1">
              Ketik nama baru untuk sub kategori baru, atau pilih dari saran supaya tidak dobel.
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={6}
            placeholder="Deskripsi produk, ilustrasi, cara menjual, dsb — bebas ditulis dalam satu kolom ini."
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <p className="text-xs text-ink/45 mt-1">
            Link (http/https) di dalam teks ini otomatis jadi bisa diklik di halaman member.
          </p>
        </div>

        <div className="mb-6">
          <MultiFileInput value={form.files} onChange={(files) => setForm({ ...form, files })} label="Lampiran (PDF / Foto) — Attach File 1, 2, dst" />
        </div>

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-lg text-ink mb-3">Daftar Produk ({products.length})</h2>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wide text-brass mb-1">
                {p.category}
                {p.subCategory ? ` · ${p.subCategory}` : ""}
              </p>
              <p className="font-display text-lg text-ink mb-1">{p.name}</p>
              <p className="text-sm text-charcoal/60 line-clamp-1">{p.description}</p>
              <p className="text-xs text-ink/45 mt-1">{(p.files || []).length} file terlampir</p>
            </div>
            <div className="flex gap-3 shrink-0 pt-1">
              <button onClick={() => handleEdit(p)} className="text-xs font-semibold text-ink/60 hover:text-brass">
                Ubah
              </button>
              <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-rust/70 hover:text-rust">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
            Belum ada produk.
          </div>
        )}
      </div>
    </div>
  );
}
