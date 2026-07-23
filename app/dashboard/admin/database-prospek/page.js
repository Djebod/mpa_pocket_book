"use client";

import { useEffect, useMemo, useState } from "react";
import * as store from "@/lib/store";

export default function AdminDatabaseProspekPage() {
  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const categoryOptions = store.getContactCategories();

  useEffect(() => {
    setContacts(store.getAllContactsForAdmin());
    setMembers(store.getMembers());
  }, []);

  function memberName(memberId) {
    return members.find((m) => m.id === memberId)?.name || "—";
  }

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? contacts.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.profession || "").toLowerCase().includes(q) ||
            memberName(c.memberId).toLowerCase().includes(q)
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
  }, [contacts, members, search, categoryOptions]);

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Database Calon Prospek</h1>
      <p className="text-sm text-ink/60 mb-6">
        Seluruh database Calon Nasabah / Calon Agen / Calon Agen & Nasabah dari semua member, dikelompokkan
        berdasarkan kategori dan terurut abjad. Halaman ini hanya untuk melihat — pengelolaan (tambah/ubah) data
        dilakukan oleh masing-masing member lewat halaman "Database Calon Prospek" mereka sendiri.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama, profesi, atau nama member..."
        className="w-full sm:w-96 rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none mb-8"
      />

      {categoryOptions.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="font-display text-lg text-ink mb-3">
            {cat} ({(grouped[cat] || []).length})
          </h2>
          {(grouped[cat] || []).length === 0 ? (
            <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-6 text-center text-sm text-ink/50">
              Belum ada data untuk kategori ini.
            </div>
          ) : (
            <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide select-none">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Profesi</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Tanggal Tercatat</th>
                  </tr>
                </thead>
                <tbody>
                  {(grouped[cat] || []).map((c) => (
                    <tr key={c.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-3 font-semibold text-charcoal">{c.name}</td>
                      <td className="px-4 py-3 text-charcoal/70">{c.profession || "—"}</td>
                      <td className="px-4 py-3 text-ink/60 text-xs">{memberName(c.memberId)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/45 whitespace-nowrap">
                        {(c.createdAt || "").slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
