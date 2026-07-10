"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";

export default function TeamMemberDetailPage() {
  const { memberId } = useParams();
  const { session, ready } = useAuth();
  const [member, setMember] = useState(undefined);
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState({});
  const [preview, setPreview] = useState(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!ready || !session) return;
    if (!store.canViewActivitiesOf(session, memberId)) {
      setDenied(true);
      return;
    }
    const members = store.getMembers();
    setMember(members.find((m) => m.id === memberId) || null);
    setActivities(store.getActivitiesByMember(memberId));
    setCounts(store.countActivitiesByType(memberId));
  }, [ready, session, memberId]);

  if (denied) {
    return (
      <div>
        <p className="text-sm text-rust mb-4">
          Anda tidak punya akses untuk melihat aktivitas member ini — hanya Direct Leader dan Admin yang bisa.
        </p>
        <Link href="/dashboard/team" className="text-sm text-brass underline">
          Kembali ke Tim Saya
        </Link>
      </div>
    );
  }

  if (member === undefined) {
    return <p className="font-mono text-sm text-ink/50">Memuat…</p>;
  }

  if (member === null) {
    return (
      <div>
        <p className="text-sm text-ink/60 mb-4">Member tidak ditemukan.</p>
        <Link href="/dashboard/team" className="text-sm text-brass underline">
          Kembali ke Tim Saya
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/team"
        className="text-xs font-semibold text-ink/50 hover:text-brass underline underline-offset-2"
      >
        ← Tim Saya
      </Link>

      <h1 className="font-display italic text-3xl text-ink mt-4 mb-1">{member.name}</h1>
      <p className="text-sm text-ink/60 font-mono mb-8">{member.email}</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
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
          Belum ada aktivitas tercatat.
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
                    {act.customerPhone && <span className="text-ink/45 font-normal"> · {act.customerPhone}</span>}
                  </p>
                )}
                {act.note && <p className="text-sm text-charcoal/80">{act.note}</p>}
              </div>
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
