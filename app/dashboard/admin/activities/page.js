"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as store from "@/lib/store";
import Stamp from "@/components/Stamp";
import { exportActivitiesToExcel } from "@/lib/exportExcel";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [filterMember, setFilterMember] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setActivities(store.getActivities());
    setMembers(store.getMembers());
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filterMember !== "all" && a.memberId !== filterMember) return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      if (from && a.date < from) return false;
      if (to && a.date > to) return false;
      return true;
    });
  }, [activities, filterMember, filterType, from, to]);

  const perMember = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      const key = a.memberId;
      if (!map[key]) map[key] = { name: a.memberName, count: 0 };
      map[key].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [filtered]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <h1 className="font-display italic text-3xl text-ink">Ringkasan Aktivitas</h1>
        <button
          onClick={() => exportActivitiesToExcel(filtered)}
          className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          ⬇ Download Excel
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-8">
        Pantau seluruh aktivitas member Mulia Putri Agency — dashboard report, data lengkap, dan detail per member.
      </p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-5 py-5 mb-6 grid sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Member</label>
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          >
            <option value="all">Semua Member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Jenis Aktivitas</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          >
            <option value="all">Semua Jenis</option>
            {store.getActivityTypes().map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Dari Tanggal</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Sampai Tanggal</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-ink text-paper rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl">{filtered.length}</p>
          <p className="text-xs text-paper/70 mt-1">Total aktivitas (sesuai filter)</p>
        </div>
        <div className="sm:col-span-2 bg-card border border-ink/10 rounded-lg px-5 py-5 shadow-stamp">
          <p className="text-xs font-semibold text-ink/60 mb-3">Total per Member — klik untuk lihat detail</p>
          {perMember.length === 0 ? (
            <p className="text-sm text-ink/40">Tidak ada data.</p>
          ) : (
            <ul className="space-y-1.5">
              {perMember.map(([memberId, info]) => (
                <li key={memberId} className="flex items-center text-sm">
                  <Link href={`/dashboard/admin/activities/${memberId}`} className="text-charcoal/80 hover:text-brass hover:underline">
                    {info.name}
                  </Link>
                  <span className="leader-dots" />
                  <span className="font-mono text-ink">{info.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Nama Nasabah</th>
              <th className="px-4 py-3">No. Telpon</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3">Foto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-ink/5 last:border-0 align-top">
                <td className="px-4 py-3 font-mono text-xs text-charcoal/70 whitespace-nowrap">{a.date}</td>
                <td className="px-4 py-3 text-charcoal">
                  <Link href={`/dashboard/admin/activities/${a.memberId}`} className="hover:text-brass hover:underline">
                    {a.memberName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Stamp type={a.type} small />
                </td>
                <td className="px-4 py-3 text-charcoal/70">{a.customerName || "—"}</td>
                <td className="px-4 py-3 text-charcoal/70 font-mono text-xs">{a.customerPhone || "—"}</td>
                <td className="px-4 py-3 text-charcoal/70 max-w-xs">{a.note || "—"}</td>
                <td className="px-4 py-3">
                  {a.photo ? (
                    <button onClick={() => setPreview(a.photo)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.photo} alt="" className="w-10 h-10 rounded object-cover hover:opacity-80" />
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/40">
                  Tidak ada aktivitas yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
