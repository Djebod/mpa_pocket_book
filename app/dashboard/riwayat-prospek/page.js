"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";

export default function RiwayatProspekPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);

  const categories = store.getActivityCategories();
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (!session) return;
    setActivities(isAdmin ? store.getActivities() : store.getActivitiesByMember(session.memberId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function typeLabel(a) {
    const config = store.getActivityTypeConfig(a.category, a.type);
    return config?.label || a.type;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => (a.contactName || "").toLowerCase().includes(q));
  }, [activities, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || "")), [filtered]);

  // Data drill-down: semua aktivitas milik satu kontak, diurutkan terbaru dulu.
  const contactActivities = useMemo(() => {
    if (!selectedContactId) return [];
    return activities
      .filter((a) => a.contactId === selectedContactId)
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [activities, selectedContactId]);

  const contactInfo = useMemo(() => {
    if (!selectedContactId) return null;
    return store.getContactById(selectedContactId) || null;
  }, [selectedContactId]);

  function handlePrint() {
    window.print();
  }

  const detailView = selectedContactId && contactActivities.length > 0;
  const latest = detailView ? contactActivities[0] : null;
  const displayName = contactInfo?.name || latest?.contactName || "Prospek";

  return (
    <div>
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-1 no-print">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Riwayat Calon Prospek</h1>
        <button
          onClick={handlePrint}
          className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          📄 Unduh PDF
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-6 no-print">
        {isAdmin
          ? "Riwayat aktivitas seluruh member per calon prospek. Klik nama untuk melihat detail kunjungan."
          : "Riwayat aktivitas Anda per calon prospek. Klik nama untuk melihat detail kunjungan."}
      </p>

      {!detailView && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama prospek..."
            className="no-print w-full sm:w-80 rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none mb-5"
          />

          <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide select-none">
                  <th className="px-4 py-3">Tanggal</th>
                  {isAdmin && <th className="px-4 py-3">Member</th>}
                  <th className="px-4 py-3">Jalur</th>
                  <th className="px-4 py-3">Aktivitas</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Bukti</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.id} className="border-b border-ink/5 last:border-0 align-top">
                    <td className="px-4 py-3 font-mono text-xs text-charcoal/70 whitespace-nowrap">{a.date}</td>
                    {isAdmin && <td className="px-4 py-3 text-charcoal text-xs">{a.memberName}</td>}
                    <td className="px-4 py-3">
                      <span className="text-xs text-ink/60">
                        {categories.find((c) => c.key === a.category)?.label || a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Stamp type={typeLabel(a)} category={a.category} small />
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {a.contactId ? (
                        <button
                          onClick={() => setSelectedContactId(a.contactId)}
                          className="text-xs font-semibold text-ink hover:text-brass hover:underline text-left"
                        >
                          {a.contactName || "—"}
                        </button>
                      ) : (
                        <span className="text-xs">{a.contactName || "—"}</span>
                      )}
                      {a.contactProfession && <p className="text-xs text-ink/45">{a.contactProfession}</p>}
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {a.productSold && (
                        <p className="text-xs mb-1">
                          {a.productSold}
                          {a.premiumNominal ? ` · Rp${Number(a.premiumNominal).toLocaleString("id-ID")}/th` : ""}
                        </p>
                      )}
                      {a.photo ? (
                        <button onClick={() => setPreview(a.photo)} className="no-print">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.photo} alt="" className="w-10 h-10 rounded object-cover hover:opacity-80" />
                        </button>
                      ) : (
                        !a.productSold && "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ValidationBadge validated={a.validated} small />
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-ink/40">
                      Belum ada aktivitas tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detailView && (
        <div>
          <button
            onClick={() => setSelectedContactId(null)}
            className="no-print text-xs font-semibold text-ink/50 hover:text-brass underline underline-offset-2 mb-4"
          >
            ← Kembali ke Riwayat
          </button>

          <div className="bg-card border border-brass/40 rounded-lg shadow-stamp px-5 py-5 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-wide text-brass mb-1">
              {contactInfo?.category || "Prospek"}
            </p>
            <h2 className="font-display text-2xl text-ink mb-1">{displayName}</h2>
            {contactInfo?.profession && <p className="text-sm text-ink/60 mb-1">{contactInfo.profession}</p>}
            {isAdmin && latest?.memberName && (
              <p className="text-xs text-ink/45 mb-3">Dicatat oleh: {latest.memberName}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-paper-dark/40 rounded-md px-4 py-3">
                <p className="font-mono text-2xl text-ink">{contactActivities.length}</p>
                <p className="text-xs text-ink/50 mt-0.5">Total Kunjungan/Aktivitas</p>
              </div>
              <div className="bg-paper-dark/40 rounded-md px-4 py-3">
                <p className="text-sm font-semibold text-ink">{typeLabel(latest)}</p>
                <p className="text-xs text-ink/50 mt-0.5">Aktivitas Terbaru — {latest.date}</p>
              </div>
            </div>
          </div>

          <h3 className="font-display text-lg text-ink mb-3">Riwayat Lengkap</h3>
          <ul className="space-y-3">
            {contactActivities.map((a) => (
              <li key={a.id} className="flex items-start gap-4 bg-card border border-ink/10 rounded-lg px-4 py-4 shadow-stamp">
                {a.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photo} alt="" className="w-14 h-14 rounded object-cover shrink-0 no-print" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Stamp type={typeLabel(a)} category={a.category} small />
                    <ValidationBadge validated={a.validated} small />
                    <span className="font-mono text-[11px] text-ink/45">{a.date}</span>
                  </div>
                  {a.productSold && (
                    <p className="text-sm text-ink/70">
                      Produk: {a.productSold}
                      {a.premiumNominal ? ` · Rp${Number(a.premiumNominal).toLocaleString("id-ID")}/th` : ""}
                    </p>
                  )}
                  {a.note && <p className="text-sm text-charcoal/80">{a.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 bg-ink/80 flex items-center justify-center p-6 z-50 no-print"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Foto aktivitas" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
