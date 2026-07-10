"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";
import MultiFileInput from "@/components/MultiFileInput";

const emptyForm = { typePromo: "", files: [] };

export default function AdminPromoPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    setList(store.getPromoList());
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
    if (!form.typePromo.trim()) {
      setError("Type Promo wajib diisi.");
      return;
    }
    if (editingId) {
      store.updatePromo(editingId, form);
    } else {
      store.addPromo(form);
    }
    refresh();
    resetForm();
  }

  function handleEdit(p) {
    setForm({ typePromo: p.typePromo, files: p.files || [] });
    setEditingId(p.id);
    setError("");
  }

  function handleDelete(id) {
    if (!confirm("Hapus promo ini?")) return;
    store.deletePromo(id);
    refresh();
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Promo</h1>
      <p className="text-sm text-ink/60 mb-8">
        Tambahkan jenis promo (contoh: "Promo Bulanan") lengkap dengan lampiran PDF/foto materinya.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-6 py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Promo" : "Tambah Promo Baru"}</h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Type Promo</label>
          <input
            value={form.typePromo}
            onChange={(e) => setForm({ ...form, typePromo: e.target.value })}
            placeholder="Contoh: Promo Bulanan"
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
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
            {editingId ? "Simpan Perubahan" : "Tambah Promo"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-lg text-ink mb-3">Daftar Promo ({list.length})</h2>
      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
            <div className="min-w-0">
              <p className="font-display text-lg text-ink">{p.typePromo}</p>
              <p className="text-xs text-ink/50">{(p.files || []).length} file terlampir</p>
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
        {list.length === 0 && (
          <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
            Belum ada promo.
          </div>
        )}
      </div>
    </div>
  );
}
