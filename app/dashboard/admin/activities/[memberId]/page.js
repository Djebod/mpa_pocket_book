"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import { exportActivitiesToExcel } from "@/lib/exportExcel";

export default function AdminMemberActivityDetailPage() {
  const { memberId } = useParams();
  const [member, setMember] = useState(undefined);
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState({});
  const [preview, setPreview] = useState(null);

  function refresh() {
    const members = store.getMembers();
    setMember(members.find((m) => m.id === memberId) || null);
    setActivities(store.getActivitiesByMember(memberId));
    setCounts(store.countActivitiesByType(memberId));
  }

  useEffect(refresh, [memberId]);

  function handleDelete(act) {
    if (!confirm(`Hapus aktivitas "${act.type}" tanggal ${act.date}? Tindakan ini tidak bisa dibatalkan.`)) return;
    store.deleteActivity(act.id);
    refresh();
  }

  if (member === undefined) {
    return <p className="font-mono text-sm text-ink/50">Memuat…</p>;
  }

  if (member === null) {
    return (
      <div>
        <p className="text-sm text-ink/60 mb-4">Member tidak ditemukan.</p>
        <Link href="/dashboard/admin/activities" className="text-sm text-brass underline">
          Kembali ke Ringkasan Aktivitas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/admin/activities"
        className="text-xs font-semibold text-ink/50 hover:text-brass underline underline-offset-2"
      >
        ← Ringkasan Aktivitas
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mt-4 mb-1">
        <div>
          <h1 className="font-display italic text-3xl text-ink">{member.name}</h1>
          <p className="text-sm text-ink/60 font-mono">{member.email}</p>
        </div>
        <button
          onClick={() => exportActivitiesToExcel(activities, `aktivitas-${member.name.replace(/\s+/g, "-").toLowerCase()}`)}
          className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          ⬇ Download Excel
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-8">
        {store.getActivityTypes().map((type) => (
          <div key={type} className="bg-card border border-ink/10 rounded-lg px-4 py-4 shadow-stamp perforated">
            <p className="font-mono text-2xl text-ink">{counts[type] ?? 0}</p>
            <p className="text-xs font-semibold text-ink/60 mt-1">{type}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Riwayat Aktivitas ({activities.length})</h2>

      {activities.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat untuk member ini.
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((act) => (
            <li
              key={act.id}
              className="flex items-start gap-4 bg-card border border-ink/10 rounded-lg px-4 py-4 shadow-stamp"
            >
              {act.photo && (
                <button onClick={() => setPreview(act.photo)} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={act.photo} alt="" className="w-16 h-16 rounded object-cover hover:opacity-80" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Stamp type={act.type} small />
                  <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                </div>
                {(act.customerName || act.customerPhone) && (
                  <p className="text-sm text-ink/70 font-medium">
                    {act.customerName || "—"}
                    {act.customerPhone && (
                      <span className="text-ink/45 font-normal"> · {act.customerPhone}</span>
                    )}
                  </p>
                )}
                {act.note && <p className="text-sm text-charcoal/80">{act.note}</p>}
              </div>
              <button
                onClick={() => handleDelete(act)}
                className="text-xs font-semibold text-rust/70 hover:text-rust shrink-0"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
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
