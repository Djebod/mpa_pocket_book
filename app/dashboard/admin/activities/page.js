"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as store from "@/lib/store";
import { useAuth } from "@/app/providers";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";
import { exportActivitiesToExcel } from "@/lib/exportExcel";

export default function AdminActivitiesPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [filterMember, setFilterMember] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all | valid | unconfirmed
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const categories = store.getActivityCategories();

  function refresh() {
    setActivities(store.getActivities());
    setMembers(store.getMembers());
  }

  useEffect(refresh, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function handleValidate(activity) {
    store.validateActivity(activity.id, session?.name);
    refresh();
  }

  function handleUnvalidate(activity) {
    if (!confirm("Batalkan validasi aktivitas ini? Poinnya akan kembali jadi Unconfirmed.")) return;
    store.unvalidateActivity(activity.id);
    refresh();
  }

  function handleDelete(activity) {
    if (
      !confirm(
        `Hapus aktivitas "${activity.type}" milik ${activity.memberName} tanggal ${activity.date}? Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;
    store.deleteActivity(activity.id);
    refresh();
  }

  function handleClearAll() {
    const first = confirm(
      `Hapus SEMUA data aktivitas (${activities.length} aktivitas)? Ini akan menghapus seluruhnya dari sistem dan Google Sheets, tidak bisa dibatalkan.`
    );
    if (!first) return;
    const second = confirm("Konfirmasi sekali lagi — benar-benar hapus SEMUA aktivitas?");
    if (!second) return;
    store.clearAllActivities();
    refresh();
  }

  const filtered = useMemo(() => {
    const list = activities.filter((a) => {
      if (filterMember !== "all" && a.memberId !== filterMember) return false;
      if (filterCategory !== "all" && a.category !== filterCategory) return false;
      if (filterStatus === "valid" && !a.validated) return false;
      if (filterStatus === "unconfirmed" && a.validated) return false;
      if (from && a.date < from) return false;
      if (to && a.date > to) return false;
      return true;
    });

    const getValue = (a) => {
      switch (sortKey) {
        case "member":
          return a.memberName || "";
        case "category":
          return a.category || "";
        case "type":
          return a.type || "";
        case "points":
          return String(a.points ?? 0).padStart(6, "0");
        case "date":
        default:
          return a.date || "";
      }
    };

    return [...list].sort((a, b) => {
      const cmp = getValue(a).toLowerCase().localeCompare(getValue(b).toLowerCase());
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [activities, filterMember, filterCategory, filterStatus, from, to, sortKey, sortDir]);

  const pointsSummary = useMemo(() => store.summarizePoints(filtered), [filtered]);

  function typeLabel(a) {
    const config = store.getActivityTypeConfig(a.category, a.type);
    return config?.label || a.type;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Ringkasan Aktivitas</h1>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => exportActivitiesToExcel(filtered)}
            className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors"
          >
            ⬇ Download Excel
          </button>
          <button
            onClick={handleClearAll}
            disabled={activities.length === 0}
            className="bg-rust text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Hapus Semua Aktivitas
          </button>
        </div>
      </div>
      <p className="text-sm text-ink/60 mb-8">
        Pantau seluruh aktivitas member, validasi poin, dan lihat detail per member.
      </p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-5 py-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Kategori</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/60 mb-1.5">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="valid">Valid</option>
            <option value="unconfirmed">Menunggu Validasi</option>
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
        <div className="bg-card border border-sage/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-sage">{pointsSummary.validPoints}</p>
          <p className="text-xs text-ink/60 mt-1">Total Valid Point</p>
        </div>
        <div className="bg-card border border-brass/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-brass">{pointsSummary.unconfirmedPoints}</p>
          <p className="text-xs text-ink/60 mt-1">Total Unconfirmed Point</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide select-none">
              <th className="px-4 py-3 cursor-pointer hover:text-ink" onClick={() => handleSort("date")}>
                Tanggal{sortIndicator("date")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-ink" onClick={() => handleSort("member")}>
                Member{sortIndicator("member")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-ink" onClick={() => handleSort("category")}>
                Kategori{sortIndicator("category")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-ink" onClick={() => handleSort("type")}>
                Aktivitas{sortIndicator("type")}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-ink" onClick={() => handleSort("points")}>
                Poin{sortIndicator("points")}
              </th>
              <th className="px-4 py-3">Bukti</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
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
                  <span className="text-xs text-ink/60">
                    {categories.find((c) => c.key === a.category)?.label || a.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Stamp type={typeLabel(a)} category={a.category} small />
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brass">{a.points}</td>
                <td className="px-4 py-3 text-charcoal/70">
                  {a.policyNumber && <p className="text-xs mb-1">Polis: {a.policyNumber}</p>}
                  {a.photo ? (
                    <button onClick={() => setPreview(a.photo)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.photo} alt="" className="w-10 h-10 rounded object-cover hover:opacity-80" />
                    </button>
                  ) : (
                    !a.policyNumber && "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <ValidationBadge validated={a.validated} small />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {a.validated ? (
                    <button
                      onClick={() => handleUnvalidate(a)}
                      className="text-xs font-semibold text-ink/50 hover:text-ink mr-3"
                    >
                      Batalkan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleValidate(a)}
                      className="text-xs font-semibold text-sage hover:text-sage/80 mr-3"
                    >
                      Valid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a)}
                    className="text-xs font-semibold text-rust/70 hover:text-rust"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink/40">
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
