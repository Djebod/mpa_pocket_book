"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import { buildPipelineReport } from "@/lib/pipelineReport";

const FLAG_STYLE = {
  urgent: "bg-rust/10 text-rust border-rust/30",
  warn: "bg-brass/10 text-brass border-brass/30",
  info: "bg-sage/10 text-sage border-sage/30",
  good: "bg-sage/10 text-sage border-sage/30",
};

const ROW_TINT = {
  urgent: "bg-rust/[0.04]",
  warn: "bg-brass/[0.04]",
};

export default function LaporanAnalitikPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [validOnly, setValidOnly] = useState(true);

  const isAdmin = session?.role === "admin";
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await store.syncAllFromSheets();
      if (cancelled) return;
      setActivities(isAdmin ? store.getActivities() : store.getActivitiesByMember(session.memberId));
      setContacts(isAdmin ? store.getAllContactsForAdmin() : store.getContactsByMember(session.memberId));
      setMembers(store.getMembers());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const typeLabelOf = (categoryKey, typeKey) => {
    const config = store.getActivityTypeConfig(categoryKey, typeKey);
    return config?.label || typeKey;
  };

  // Admin bisa memfilter laporan per member; member biasa selalu dirinya sendiri.
  const scopedActivities = useMemo(() => {
    if (!isAdmin || !selectedMemberId) return activities;
    return activities.filter((a) => a.memberId === selectedMemberId);
  }, [activities, isAdmin, selectedMemberId]);

  const report = useMemo(
    () => buildPipelineReport(scopedActivities, contacts, { typeLabelOf, todayStr, validOnly }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedActivities, contacts, todayStr, validOnly]
  );

  const reportOwner = isAdmin
    ? selectedMemberId
      ? members.find((m) => m.id === selectedMemberId)?.name || "Member"
      : "Seluruh Tim"
    : session?.name || "";

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <p className="font-mono text-sm text-ink/50">Menyusun laporan dari seluruh aktivitas…</p>;
  }

  const s = report.summary;

  return (
    <div>
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
          table { font-size: 9pt; }
        }
      `}</style>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <div>
          <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Laporan Analitik Pipeline</h1>
          <p className="text-sm text-ink/60 mt-1">
            {reportOwner}
            {s.periodStart && (
              <>
                {" · "}periode aktivitas {s.periodStart} s/d {s.periodEnd}
              </>
            )}
            {" · "}disusun {todayStr}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="no-print bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          📄 Unduh PDF
        </button>
      </div>

      {/* Kontrol */}
      <div className="no-print flex flex-wrap items-end gap-4 my-5">
        {isAdmin && (
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1.5">Laporan Untuk</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
            >
              <option value="">Seluruh Tim</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer pb-2">
          <input
            type="checkbox"
            checked={validOnly}
            onChange={(e) => setValidOnly(e.target.checked)}
            className="accent-brass w-4 h-4"
          />
          Hanya hitung aktivitas yang sudah divalidasi Admin
        </label>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-ink text-paper rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl">{s.totalProspek}</p>
          <p className="text-xs text-paper/70 mt-1">Nama di pipeline</p>
        </div>
        <div className="bg-card border border-sage/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-sage">{s.totalClosing}</p>
          <p className="text-xs text-ink/60 mt-1">Closing periode ini</p>
        </div>
        <div className="bg-card border border-brass/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-xl text-brass break-all">{s.totalPremiLabel}</p>
          <p className="text-xs text-ink/60 mt-1">Total premi closing</p>
        </div>
        <div className="bg-card border border-rust/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-rust">{s.urgentCount}</p>
          <p className="text-xs text-ink/60 mt-1">Prospek urgent/terlupakan</p>
        </div>
      </div>

      {/* Highlight & saran */}
      <h2 className="font-display text-lg text-ink mb-3">Highlight & Saran Tindakan</h2>
      <div className="space-y-3 mb-10">
        {report.highlights.map((h, i) => (
          <div key={i} className={`rounded-lg border px-5 py-4 ${FLAG_STYLE[h.level] || FLAG_STYLE.info}`}>
            <p className="font-semibold text-sm mb-1">{h.title}</p>
            <p className="text-sm text-charcoal/80 leading-relaxed">{h.detail}</p>
            {h.names.length > 0 && (
              <p className="text-xs text-ink/50 mt-2">
                Nama: {h.names.join(", ")}
                {h.names.length >= 5 ? ", …" : ""}
              </p>
            )}
          </div>
        ))}
      </div>

      <PipelineTable
        title="Jalur Penjualan — prospek nasabah"
        rows={report.penjualan}
        showMember={isAdmin && !selectedMemberId}
      />
      <PipelineTable
        title="Jalur Rekrutmen — calon agen"
        rows={report.rekrutmen}
        showMember={isAdmin && !selectedMemberId}
      />

      <p className="text-xs text-ink/45 mt-8 leading-relaxed">
        Sumber: seluruh aktivitas tercatat
        {validOnly ? " berstatus Valid" : " (termasuk yang belum divalidasi)"}
        {s.periodStart && `, periode ${s.periodStart} s/d ${s.periodEnd}`}. Aktivitas berstatus Tidak Valid
        tidak dihitung. Baris bertanda merah = urgent (lebih dari 30 hari tanpa tindak lanjut), kuning = perlu
        perhatian (lebih dari 14 hari). Kolom &quot;Next Action&quot; adalah saran otomatis berdasarkan tahap
        terakhir &amp; lama diam — konteks lengkapnya ada di kolom Catatan Terakhir.
      </p>
    </div>
  );
}

function PipelineTable({ title, rows, showMember }) {
  if (rows.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="font-display text-lg text-ink mb-3">
        {title} ({rows.length})
      </h2>
      <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="px-3 py-3 w-8">#</th>
              <th className="px-3 py-3">Nama &amp; Profesi</th>
              {showMember && <th className="px-3 py-3">Member</th>}
              <th className="px-3 py-3">Posisi Terakhir</th>
              <th className="px-3 py-3">Catatan Terakhir</th>
              <th className="px-3 py-3">Next Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.key}
                className={`border-b border-ink/5 last:border-0 align-top ${
                  ROW_TINT[r.flag?.level] || ""
                }`}
              >
                <td className="px-3 py-3 font-mono text-xs text-ink/40">{i + 1}</td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-charcoal">{r.name}</p>
                  {r.profession && <p className="text-xs text-ink/50">{r.profession}</p>}
                  {r.flag && (
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        FLAG_STYLE[r.flag.level]
                      }`}
                    >
                      {r.flag.label}
                    </span>
                  )}
                </td>
                {showMember && <td className="px-3 py-3 text-xs text-ink/60">{r.memberName}</td>}
                <td className="px-3 py-3">
                  <p className="text-xs font-semibold text-charcoal">{r.lastTypeLabel}</p>
                  <p className="text-xs text-ink/45 font-mono">{r.lastDate}</p>
                  {r.journey.length > 1 && (
                    <p className="text-[11px] text-ink/40 mt-1">{r.journey.join(" → ")}</p>
                  )}
                  {r.totalPremiLabel && (
                    <p className="text-[11px] text-brass font-semibold mt-1">
                      {r.productSold ? `${r.productSold} · ` : ""}
                      {r.totalPremiLabel}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-charcoal/75 leading-relaxed max-w-xs">
                  {r.lastNote || <span className="text-ink/30">—</span>}
                </td>
                <td className="px-3 py-3 text-xs text-charcoal/85 leading-relaxed max-w-xs">
                  {r.nextAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
