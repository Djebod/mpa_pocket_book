"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import NamedFileListInput from "@/components/NamedFileListInput";

const CATEGORY_OPTIONS = ["After Sales", "Claim", "Bukti Claim"];

const emptyForm = { category: "" };
const emptyFileItems = [];

export default function AdminAfterSalesClaimPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [fileItems, setFileItems] = useState(emptyFileItems);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  function refresh() {
    setList(store.getAfterSalesClaimList());
  }

  useEffect(refresh, []);

  // Peringatkan kalau ada yang coba refresh/tutup tab persis saat data
  // masih dalam proses dikirim ke Google Sheets — supaya tidak ada
  // pengiriman yang terputus di tengah jalan (penyebab utama data
  // "hilang" setelah hard refresh).
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saving]);

  function resetForm() {
    setForm(emptyForm);
    setFileItems(emptyFileItems);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.category) {
      setError("Kategori wajib dipilih (After Sales atau Claim).");
      return;
    }
    const files = fileItems
      .filter((row) => row.file)
      .map((row) => ({ ...row.file, name: row.namaFile.trim() || row.file.name }));

    setSaving(true);
    try {
      const payload = { category: form.category, files };
      if (editingId) {
        await store.updateAfterSalesClaimEntry(editingId, payload);
      } else {
        await store.addAfterSalesClaimEntry(payload);
      }
      refresh();
      resetForm();
    } catch (err) {
      setError(err.message || "Gagal menyimpan. Coba lagi.");
    }
    setSaving(false);
  }

  function handleEdit(entry) {
    setForm({ category: entry.category || "" });
    setFileItems((entry.files || []).map((f) => ({ namaFile: f.name || "", file: f })));
    setEditingId(entry.id);
    setError("");
    setTimeout(() => {
      document.getElementById("asc-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    setSaving(true);
    await store.deleteAfterSalesClaimEntry(id);
    refresh();
    if (editingId === id) resetForm();
    setSaving(false);
  }

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter((entry) => (entry.files || []).some((f) => (f.name || "").toLowerCase().includes(q)))
      : list;

    const map = {};
    CATEGORY_OPTIONS.forEach((cat) => (map[cat] = []));
    filtered.forEach((entry) => {
      if (!map[entry.category]) map[entry.category] = [];
      map[entry.category].push(entry);
    });
    return map;
  }, [list, search]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola After Sales & Claim</h1>
      <p className="text-sm text-ink/60 mb-8">
        Pilih kategori (After Sales atau Claim), lalu tambahkan file — tiap file punya Nama File sendiri (bebas
        Anda tentukan) beserta upload-nya. Tampilan member akan otomatis terpisah berdasarkan kategori ini.
      </p>

      <form
        id="asc-form"
        onSubmit={handleSubmit}
        className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated"
      >
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Data" : "Tambah Data Baru"}</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-ink mb-1.5">
            Kategori <span className="text-rust">*</span>
          </label>
          <div className="flex flex-wrap gap-5">
            {CATEGORY_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input
                  type="radio"
                  name="afterSalesClaimCategory"
                  value={opt}
                  checked={form.category === opt}
                  onChange={() => setForm({ ...form, category: opt })}
                  className="accent-brass w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <NamedFileListInput value={fileItems} onChange={setFileItems} label="Lampiran" />
        </div>

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3 items-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah Data"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
        {saving && (
          <p className="text-xs text-ink/45 mt-2">
            Jangan tutup atau refresh halaman ini dulu — sedang mengirim ke Google Sheets…
          </p>
        )}
      </form>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama file lampiran..."
        className="w-full sm:w-96 rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none mb-8"
      />

      {CATEGORY_OPTIONS.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="font-display text-lg text-ink mb-3">
            {cat} ({(grouped[cat] || []).length})
          </h2>
          <div className="space-y-3">
            {(grouped[cat] || []).map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-brass bg-brass/10 px-2 py-0.5 rounded-full">
                    {entry.category}
                  </span>
                  <p className="text-xs text-ink/50 mt-1.5">
                    {(entry.files || []).map((f) => f.name).join(", ") || "Belum ada file"}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0 pt-1">
                  <button onClick={() => handleEdit(entry)} className="text-xs font-semibold text-ink/60 hover:text-brass">
                    Ubah
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="text-xs font-semibold text-rust/70 hover:text-rust">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {(grouped[cat] || []).length === 0 && (
              <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-6 text-center text-sm text-ink/50">
                {search.trim() ? "Tidak ada file yang cocok." : `Belum ada data untuk kategori ${cat}.`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
