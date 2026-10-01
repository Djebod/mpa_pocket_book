"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";

export default function TeamPage() {
  const { session } = useAuth();
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    if (!session) return;
    const allReports = store.getAllReports(session.memberId);
    setReports(allReports);
    const map = {};
    allReports.forEach((m) => {
      map[m.id] = store.getActivitiesByMember(m.id).length;
    });
    setCounts(map);
  }, [session]);

  const members = store.getMembers();
  const leaderNameOf = (m) => members.find((x) => x.id === m.directLeaderId)?.name || "";

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Tim Saya</h1>
      <p className="text-sm text-ink/60 mb-8">
        Seluruh bawahan Anda secara berjenjang (langsung maupun bawahan dari bawahan Anda) — Anda bisa melihat
        riwayat aktivitas mereka di sini.
      </p>

      {reports.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada bawahan di bawah Anda.
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((m) => (
            <li key={m.id}>
              <Link
                href={`/dashboard/team/${m.id}`}
                className="flex items-center justify-between gap-4 bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp hover:border-brass transition-colors"
              >
                <div>
                  <p className="font-display text-lg text-ink">{m.name}</p>
                  <p className="text-xs text-ink/50 font-mono">{m.email}</p>
                  {leaderNameOf(m) && leaderNameOf(m) !== session?.name && (
                    <p className="text-[11px] text-ink/40 mt-0.5">Direct Leader: {leaderNameOf(m)}</p>
                  )}
                </div>
                <span className="font-mono text-sm text-ink/60">{counts[m.id] ?? 0} aktivitas</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
