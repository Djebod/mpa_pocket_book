"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import SingleFileInput from "@/components/SingleFileInput";

// Kategori adalah field "kunci" — sengaja dibatasi cuma 2 pilihan supaya
// filter Katalog Produk tetap konsisten (tidak ada variasi penulisan).
const CATEGORY_OPTIONS = ["Unit Link", "Non Unit Link"];

const emptyForm = {
  name: "",
  category: CATEGORY_OPTIONS[0],
  subCategory: "",
  materiTraining: null,
  tabelPremi: null,
  resume: null,
  tabelMedical: null,
  fileKetsusUrl: "",
  videoUrl: "",
};

/**
 * Mencocokkan Sub Kategori yang baru diketik dengan daftar Sub Kategori
 * yang sudah ada (dibandingkan tanpa peduli spasi di ujung & huruf
 * besar/kecil) — supaya tidak ada entri dobel yang cuma beda spasi/huruf
 * kapital, tapi Sub Kategori yang benar-benar baru tetap bisa ditambahkan
 * bebas.
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

  const existingSubCategories = useMemo(() => {
    const seen = new Map();
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
      materiTraining: product.materiTraining || null,
      tabelPremi: product.tabelPremi || null,
      resume: product.resume || null,
      tabelMedical: product.tabelMedical || null,
      fileKetsusUrl: product.fileKetsusUrl || "",
      videoUrl: product.videoUrl || "",
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

  function countAttachments(p) {
    return [p.materiTraining, p.tabelPremi, p.resume, p.tabelMedical].filter(Boolean).length;
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Produk</h1>
      <p className="text-sm text-ink/60 mb-8">
        Isi nama, kategori, sub kategori, lalu lengkapi Materi Training, Tabel Premi, Resume, Tabel Medical
        (upload PDF/foto), File Ketsus (link Google Drive), dan Video (link YouTube).
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Produk" : "Tambah Produk Baru"}</h2>

        {editingProductHasUnknownCategory && (
          <p className="text-xs text-brass bg-brass/10 rounded-md px-3 py-2 mb-5">
            Produk ini masih memakai kategori lama yang sudah tidak berlaku. Pilih salah satu dari 2 kategori di
            bawah, lalu simpan.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
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

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <SingleFileInput
            label="Materi Training"
            value={form.materiTraining}
            onChange={(v) => setForm({ ...form, materiTraining: v })}
          />
          <SingleFileInput
            label="Tabel Premi"
            value={form.tabelPremi}
            onChange={(v) => setForm({ ...form, tabelPremi: v })}
          />
          <SingleFileInput label="Resume" value={form.resume} onChange={(v) => setForm({ ...form, resume: v })} />
          <SingleFileInput
            label="Tabel Medical"
            value={form.tabelMedical}
            onChange={(v) => setForm({ ...form, tabelMedical: v })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              File Ketsus <span className="font-normal text-ink/45">(link Google Drive)</span>
            </label>
            <input
              value={form.fileKetsusUrl}
              onChange={(e) => setForm({ ...form, fileKetsusUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
            <p className="text-xs text-ink/45 mt-1">
              Copy-paste link Google Drive — saat diklik member akan diarahkan ke link ini.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Video <span className="font-normal text-ink/45">(link YouTube)</span>
            </label>
            <input
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=xxxxxxxx"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
            <p className="text-xs text-ink/45 mt-1">
              Boleh paste link YouTube apa saja (watch, youtu.be, shorts) — otomatis disesuaikan.
            </p>
          </div>
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
              <p className="text-xs text-ink/45">
                {countAttachments(p)} dari 4 dokumen terlampir
                {p.fileKetsusUrl ? " · File Ketsus ✓" : ""}
                {p.videoUrl ? " · Video ✓" : ""}
              </p>
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
