"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

const CATEGORY_OPTIONS = ["After Sales", "Claim"];

const emptyForm = { category: "", files: [] };

export default function AdminAfterSalesClaimPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    setList(store.getAfterSalesClaimList());
  }

  useEffect(refresh, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.category) {
      setError("Kategori wajib dipilih (After Sales atau Claim).");
      return;
    }
    if (editingId) {
      store.updateAfterSalesClaimEntry(editingId, form);
    } else {
      store.addAfterSalesClaimEntry(form);
    }
    refresh();
    resetForm();
  }

  function handleEdit(entry) {
    setForm({ category: entry.category || "", files: entry.files || [] });
    setEditingId(entry.id);
    setError("");
  }

  function handleDelete(id) {
    if (!confirm("Hapus data ini?")) return;
    store.deleteAfterSalesClaimEntry(id);
    refresh();
    if (editingId === id) resetForm();
  }

  const grouped = useMemo(() => {
    const map = { "After Sales": [], Claim: [] };
    list.forEach((entry) => {
      if (map[entry.category]) map[entry.category].push(entry);
      else (map[entry.category] = map[entry.category] || []).push(entry);
    });
    return map;
  }, [list]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola After Sales & Claim</h1>
      <p className="text-sm text-ink/60 mb-8">
        Pilih kategori (After Sales atau Claim) lalu lampirkan file (PDF/foto) — bisa lebih dari satu. Tampilan
        member akan otomatis terpisah berdasarkan kategori ini.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Data" : "Tambah Data Baru"}</h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">
            Kategori <span className="text-rust">*</span>
          </label>
          <div className="flex gap-5">
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
          <MultiFileInput
            value={form.files}
            onChange={(files) => setForm({ ...form, files })}
            label="Lampiran (PDF / Foto) — Attach File 1, 2, dst"
          />
        </div>

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Data"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
      </form>

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
                  <p className="text-xs text-ink/50 mt-1.5">{(entry.files || []).length} file terlampir</p>
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
                Belum ada data untuk kategori {cat}.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
