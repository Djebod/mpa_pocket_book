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
  const [saving, setSaving] = useState(false);

  const categoryOptions = store.getContactCategories();

  function refresh() {
    if (!session) return;
    setContacts(store.getContactsByMember(session.memberId));
  }

  useEffect(refresh, [session]);

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

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? contacts.filter(
          (c) => (c.name || "").toLowerCase().includes(q) || (c.profession || "").toLowerCase().includes(q)
        )
      : contacts;

    const map = {};
    categoryOptions.forEach((cat) => (map[cat] = []));
    filtered.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => (a.name || "").localeCompare(b.name || "", "id", { sensitivity: "base" }));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, search, categoryOptions]);

  const totalVisible = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.profession.trim() || !form.category) {
      setError("Nama, Profesi, dan Kategori wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), profession: form.profession.trim(), category: form.category };
      if (editingId) {
        await store.updateContact(editingId, payload);
      } else {
        await store.addContact({ memberId: session.memberId, ...payload });
      }
      refresh();
      resetForm();
    } catch (err) {
      setError(err.message || "Gagal menyimpan.");
    }
    setSaving(false);
  }

  function handleEdit(c) {
    setForm({ name: c.name || "", profession: c.profession || "", category: c.category || "" });
    setEditingId(c.id);
    setError("");
    setTimeout(() => {
      document.getElementById("prospek-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
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
            disabled={saving}
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah Prospek"}
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

      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <h2 className="font-display text-lg text-ink">Daftar Prospek ({totalVisible})</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau profesi..."
          className="w-full sm:w-72 rounded-md border border-ink/20 bg-paper px-3.5 py-2 text-sm focus:border-brass focus:outline-none"
        />
      </div>

      {categoryOptions.map((cat) => (
        <div key={cat} className="mb-8">
          <h3 className="font-display text-base text-ink mb-3">
            {cat} ({(grouped[cat] || []).length})
          </h3>
          {(grouped[cat] || []).length === 0 ? (
            <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-5 text-center text-sm text-ink/50">
              Belum ada data untuk kategori ini.
            </div>
          ) : (
            <div className="space-y-3">
              {(grouped[cat] || []).map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-ink">{c.name}</p>
                    <p className="text-sm text-ink/60">{c.profession}</p>
                    <p className="text-xs text-ink/40 mt-1">Tercatat: {(c.createdAt || "").slice(0, 10)}</p>
                  </div>
                  <button onClick={() => handleEdit(c)} className="text-xs font-semibold text-ink/60 hover:text-brass shrink-0 pt-1">
                    Ubah
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
