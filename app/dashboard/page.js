"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";

export default function MemberDashboardPage() {
  const { session } = useAuth();
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!session) return;
    setCounts(store.countActivitiesByType(session.memberId));
    setRecent(store.getActivitiesByMember(session.memberId).slice(0, 5));
  }, [session]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Halo, {session?.name?.split(" ")[0]}</h1>
        <span className="font-mono text-xs text-ink/50">{total} aktivitas tercatat</span>
      </div>
      <p className="text-sm text-ink/60 mb-8">Ringkasan aktivitas Anda di Mulia Putri Agency.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {store.getActivityTypes().map((type) => (
          <div
            key={type}
            className="bg-card border border-ink/10 rounded-lg px-4 py-5 shadow-stamp perforated"
          >
            <p className="font-mono text-3xl text-ink">{counts[type] ?? 0}</p>
            <p className="text-xs font-semibold text-ink/60 mt-1">{type}</p>
          </div>
        ))}
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
          {recent.map((act) => (
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
                  <Stamp type={act.type} small />
                  <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                </div>
                {act.note && <p className="text-sm text-charcoal/80 mt-1 truncate">{act.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
