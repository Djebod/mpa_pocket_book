"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";

const emptyForm = { title: "", driveLink: "" };

export default function AdminTutorialsPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    setList(store.getTutorials());
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
    if (!form.title.trim() || !form.driveLink.trim()) {
      setError("Judul dan link Google Drive wajib diisi.");
      return;
    }
    if (editingId) {
      store.updateTutorial(editingId, form);
    } else {
      store.addTutorial(form);
    }
    refresh();
    resetForm();
  }

  function handleEdit(t) {
    setForm({ title: t.title, driveLink: t.driveLink });
    setEditingId(t.id);
    setError("");
  }

  function handleDelete(id) {
    if (!confirm("Hapus tutorial ini?")) return;
    store.deleteTutorial(id);
    refresh();
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Tutorial Digital</h1>
      <p className="text-sm text-ink/60 mb-8">
        Tambahkan judul tutorial dan link Google Drive-nya (copy-paste dari Drive Anda sendiri) — member akan
        diarahkan ke link itu saat mengklik.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-6 py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Tutorial" : "Tambah Tutorial Baru"}</h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Judul Tutorial</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Contoh: Cara Menggunakan Aplikasi Klaim Digital"
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Link Google Drive</label>
          <input
            value={form.driveLink}
            onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
          <p className="text-xs text-ink/45 mt-1">
            Paste link Google Drive dari mana saja (video/dokumen/folder) — pastikan izin sharing-nya "Anyone with
            the link" supaya member bisa membukanya.
          </p>
        </div>

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Tutorial"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-lg text-ink mb-3">Daftar Tutorial ({list.length})</h2>
      <div className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
            <div className="min-w-0">
              <p className="font-display text-lg text-ink">{t.title}</p>
              <p className="text-xs text-ink/50 truncate max-w-md">{t.driveLink}</p>
            </div>
            <div className="flex gap-3 shrink-0 pt-1">
              <button onClick={() => handleEdit(t)} className="text-xs font-semibold text-ink/60 hover:text-brass">
                Ubah
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-xs font-semibold text-rust/70 hover:text-rust">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
            Belum ada tutorial.
          </div>
        )}
      </div>
    </div>
  );
}
