"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";

export default function MemberDashboardPage() {
  const { session } = useAuth();
  const [summary, setSummary] = useState({ validPoints: 0, unconfirmedPoints: 0 });
  const [activities, setActivities] = useState([]);
  const [preview, setPreview] = useState(null);

  const categories = store.getActivityCategories();

  useEffect(() => {
    if (!session) return;
    setSummary(store.getMemberPointsSummary(session.memberId));
    setActivities(store.getActivitiesByMember(session.memberId));
  }, [session]);

  const sorted = useMemo(
    () => [...activities].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [activities]
  );

  function typeLabel(a) {
    const config = store.getActivityTypeConfig(a.category, a.type);
    return config?.label || a.type;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Halo, {session?.name?.split(" ")[0]}</h1>
        <span className="font-mono text-xs text-ink/50">{activities.length} aktivitas tercatat</span>
      </div>
      <p className="text-sm text-ink/60 mb-8">Ringkasan aktivitas Anda di Mulia Putri Agency.</p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-ink text-paper rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl">{summary.validPoints}</p>
          <p className="text-xs text-paper/70 mt-1">Valid Point</p>
        </div>
        <div className="bg-card border border-brass/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-brass">{summary.unconfirmedPoints}</p>
          <p className="text-xs text-ink/60 mt-1">Unconfirmed Point</p>
        </div>
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Detail Aktivitas</h2>

      {sorted.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat. Mulai catat aktivitas pertama Anda.
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide select-none">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jalur</th>
                <th className="px-4 py-3">Aktivitas</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Poin</th>
                <th className="px-4 py-3">Bukti</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id} className="border-b border-ink/5 last:border-0 align-top">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/70 whitespace-nowrap">{a.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-ink/60">
                      {categories.find((c) => c.key === a.category)?.label || a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Stamp type={typeLabel(a)} category={a.category} small />
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {a.contactName && <p className="text-xs">{a.contactName}</p>}
                    {a.contactProfession && <p className="text-xs text-ink/45">{a.contactProfession}</p>}
                    {!a.contactName && !a.contactProfession && "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brass">{a.points}</td>
                  <td className="px-4 py-3 text-charcoal/70">
                    {a.productSold && (
                      <p className="text-xs mb-1">
                        {a.productSold}
                        {a.premiumNominal ? ` · Rp${Number(a.premiumNominal).toLocaleString("id-ID")}/th` : ""}
                      </p>
                    )}
                    {a.photo ? (
                      <button onClick={() => setPreview(a.photo)}>
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
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 bg-ink/80 flex items-center justify-center p-6 z-50"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Foto aktivitas" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
