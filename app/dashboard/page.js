"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";

export default function MemberDashboardPage() {
  const { session } = useAuth();
  const [summary, setSummary] = useState({ validPoints: 0, unconfirmedPoints: 0 });
  const [recent, setRecent] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!session) return;
    setSummary(store.getMemberPointsSummary(session.memberId));
    const activities = store.getActivitiesByMember(session.memberId);
    setTotal(activities.length);
    setRecent(activities.slice(0, 5));
  }, [session]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Halo, {session?.name?.split(" ")[0]}</h1>
        <span className="font-mono text-xs text-ink/50">{total} aktivitas tercatat</span>
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

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-ink">Aktivitas Terbaru</h2>
        <Link href="/dashboard/activities" className="text-xs font-semibold text-brass underline underline-offset-2">
          Lihat semua &amp; catat aktivitas baru
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat. Mulai catat aktivitas pertama Anda.
        </div>
      ) : (
        <ul className="space-y-3">
          {recent.map((act) => {
            const config = store.getActivityTypeConfig(act.category, act.type);
            return (
              <li
                key={act.id}
                className="flex items-center gap-4 bg-card border border-ink/10 rounded-lg px-4 py-3 shadow-stamp"
              >
                {act.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={act.photo} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stamp type={config?.label || act.type} category={act.category} small />
                    <span className="font-mono text-[11px] text-brass font-semibold">{act.points} poin</span>
                    <ValidationBadge validated={act.validated} small />
                    <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                  </div>
                  {act.note && <p className="text-sm text-charcoal/80 mt-1 truncate">{act.note}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
