"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";
import { exportActivitiesToExcel } from "@/lib/exportExcel";

export default function AdminMemberActivityDetailPage() {
  const { memberId } = useParams();
  const { session } = useAuth();
  const [member, setMember] = useState(undefined);
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({ validPoints: 0, unconfirmedPoints: 0 });
  const [preview, setPreview] = useState(null);

  function refresh() {
    const members = store.getMembers();
    setMember(members.find((m) => m.id === memberId) || null);
    setActivities(store.getActivitiesByMember(memberId));
    setSummary(store.getMemberPointsSummary(memberId));
  }

  useEffect(refresh, [memberId]);

  function handleValidate(act) {
    store.validateActivity(act.id, session?.name);
    refresh();
  }

  function handleUnvalidate(act) {
    if (!confirm("Batalkan validasi aktivitas ini?")) return;
    store.unvalidateActivity(act.id);
    refresh();
  }

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
          <h1 className="font-display italic text-2xl sm:text-3xl text-ink">{member.name}</h1>
          <p className="text-sm text-ink/60 font-mono">{member.email}</p>
        </div>
        <button
          onClick={() => exportActivitiesToExcel(activities, `aktivitas-${member.name.replace(/\s+/g, "-").toLowerCase()}`)}
          className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          ⬇ Download Excel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 my-8">
        <div className="bg-ink text-paper rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl">{summary.validPoints}</p>
          <p className="text-xs text-paper/70 mt-1">Valid Point</p>
        </div>
        <div className="bg-card border border-brass/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-brass">{summary.unconfirmedPoints}</p>
          <p className="text-xs text-ink/60 mt-1">Unconfirmed Point</p>
        </div>
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Riwayat Aktivitas ({activities.length})</h2>

      {activities.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat untuk member ini.
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((act) => {
            const config = store.getActivityTypeConfig(act.category, act.type);
            return (
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
                    <Stamp type={config?.label || act.type} category={act.category} small />
                    <span className="font-mono text-[11px] text-brass font-semibold">{act.points} poin</span>
                    <ValidationBadge validated={act.validated} small />
                    <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                  </div>
                  {(act.contactName || act.contactProfession) && (
                    <p className="text-sm text-ink/70 font-medium">
                      {act.contactName || "—"}
                      {act.contactProfession && <span className="text-ink/45 font-normal"> · {act.contactProfession}</span>}
                    </p>
                  )}
                  {act.productSold && (
                    <p className="text-sm text-ink/70 font-medium">
                      Produk: {act.productSold}
                      {act.premiumNominal
                        ? ` · Premi: Rp${Number(act.premiumNominal).toLocaleString("id-ID")}/th`
                        : ""}
                    </p>
                  )}
                  {act.note && <p className="text-sm text-charcoal/80">{act.note}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {act.validated ? (
                    <button onClick={() => handleUnvalidate(act)} className="text-xs font-semibold text-ink/50 hover:text-ink">
                      Batalkan
                    </button>
                  ) : (
                    <button onClick={() => handleValidate(act)} className="text-xs font-semibold text-sage hover:text-sage/80">
                      Valid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(act)}
                    className="text-xs font-semibold text-rust/70 hover:text-rust"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            );
          })}
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
