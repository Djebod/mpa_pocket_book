"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";

const emptyForm = { name: "", profession: "", category: "" };

export default function DatabaseProspekPage() {
  const { session } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const categoryOptions = store.getContactCategories();

  function refresh() {
    if (!session) return;
    setContacts(store.getContactsByMember(session.memberId));
  }

  useEffect(refresh, [session]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => (c.name || "").toLowerCase().includes(q) || (c.profession || "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.profession.trim() || !form.category) {
      setError("Nama, Profesi, dan Kategori wajib diisi.");
      return;
    }
    try {
      const payload = { name: form.name.trim(), profession: form.profession.trim(), category: form.category };
      if (editingId) {
        store.updateContact(editingId, payload);
      } else {
        store.addContact({ memberId: session.memberId, ...payload });
      }
      refresh();
      resetForm();
    } catch (err) {
      setError(err.message || "Gagal menyimpan.");
    }
  }

  function handleEdit(c) {
    setForm({ name: c.name || "", profession: c.profession || "", category: c.category || "" });
    setEditingId(c.id);
    setError("");
    setTimeout(() => {
      document.getElementById("prospek-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function handleDelete(id) {
    if (!confirm("Hapus data prospek ini? Riwayat aktivitas yang sudah tercatat sebelumnya tidak akan terhapus.")) return;
    store.deleteContact(id);
    refresh();
    if (editingId === id) resetForm();
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Database Calon Prospek</h1>
      <p className="text-sm text-ink/60 mb-8">
        Kelola database Calon Nasabah / Calon Agen / Calon Agen & Nasabah milik Anda sendiri — data ini yang
        muncul saat memilih nama di halaman Catat Aktivitas.
      </p>

      <form
        id="prospek-form"
        onSubmit={handleSubmit}
        className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated"
      >
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Data Prospek" : "Tambah Prospek Baru"}</h2>

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Nama</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Syam Shugi"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Profesi</label>
            <input
              value={form.profession}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
              placeholder="Contoh: Wiraswasta"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-ink mb-1.5">Kategori</label>
          <div className="flex flex-wrap gap-4">
            {categoryOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input
                  type="radio"
                  name="prospekCategory"
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

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Prospek"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
        <h2 className="font-display text-lg text-ink">Daftar Prospek ({visible.length})</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau profesi..."
          className="w-full sm:w-72 rounded-md border border-ink/20 bg-paper px-3.5 py-2 text-sm focus:border-brass focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        {visible.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wide text-brass mb-1">{c.category}</p>
              <p className="font-display text-lg text-ink">{c.name}</p>
              <p className="text-sm text-ink/60">{c.profession}</p>
              <p className="text-xs text-ink/40 mt-1">Tercatat: {(c.createdAt || "").slice(0, 10)}</p>
            </div>
            <div className="flex gap-3 shrink-0 pt-1">
              <button onClick={() => handleEdit(c)} className="text-xs font-semibold text-ink/60 hover:text-brass">
                Ubah
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-xs font-semibold text-rust/70 hover:text-rust">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
            {contacts.length === 0 ? "Belum ada data prospek." : "Tidak ada data yang cocok dengan pencarian."}
          </div>
        )}
      </div>
    </div>
  );
}
