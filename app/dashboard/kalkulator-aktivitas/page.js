"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";

// ————————————————————————————————————————————————
// Kalkulator Aktivitas Agen MPA — Sales Cycle LIMRA
// Target premi → closing → presentasi → janji temu → prospek
// ————————————————————————————————————————————————

const fmt = new Intl.NumberFormat("id-ID");
const fmtRp = (n) =>
  "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

const font = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

export default function KalkulatorAktivitasPage() {
  const { session } = useAuth();
  const [targetPremi, setTargetPremi] = useState(300000000); // APE tahunan (annualized premium equivalent)
  const [avgPremi, setAvgPremi] = useState(25000000); // rata-rata premi per polis
  const [periode, setPeriode] = useState("tahun"); // "tahun" | "bulan"
  const [showRasio, setShowRasio] = useState(false);

  // Rasio LIMRA (per 1 closing) — default 10 : 5 : 3 : 1
  const [rProspek, setRProspek] = useState(10);
  const [rJanji, setRJanji] = useState(5);
  const [rPresentasi, setRPresentasi] = useState(3);

  // Data nyata (untuk perbandingan Ritme vs Aktivitas Valid)
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!session) return;
    setContacts(store.getContactsByMember(session.memberId));
    setActivities(store.getActivitiesByMember(session.memberId));
  }, [session]);

  const hasil = useMemo(() => {
    const targetTahunan = periode === "bulan" ? targetPremi * 12 : targetPremi;
    const closing = avgPremi > 0 ? Math.ceil(targetTahunan / avgPremi) : 0;
    const presentasi = Math.ceil(closing * rPresentasi);
    const janji = Math.ceil(closing * rJanji);
    const prospek = Math.ceil(closing * rProspek);
    return { targetTahunan, closing, presentasi, janji, prospek };
  }, [targetPremi, avgPremi, periode, rProspek, rJanji, rPresentasi]);

  // Tanggal Akhir otomatis = akhir tahun dari Tanggal Mulai yang dipilih
  // (kalau Tanggal Mulai di tahun depan, otomatis ikut akhir tahun depan).
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const endDate = useMemo(() => `${new Date(startDate).getFullYear()}-12-31`, [startDate]);

  const comparison = useMemo(() => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date(todayStr);
    const clampedNow = now < start ? start : now > end ? end : now;

    const elapsedDays = Math.max(0, Math.round((clampedNow - start) / msPerDay) + 1);
    const startYear = start.getFullYear();
    const isLeap = (startYear % 4 === 0 && startYear % 100 !== 0) || startYear % 400 === 0;
    const daysInYear = isLeap ? 366 : 365;
    const factor = Math.min(1, elapsedDays / daysInYear);

    const inRange = (dateStr) => {
      const d = (dateStr || "").slice(0, 10);
      return d && d >= startDate && d <= todayStr;
    };

    const validCountByType = (typeKey) =>
      activities.filter((a) => a.category === "nasabah" && a.type === typeKey && a.validated && inRange(a.date))
        .length;

    const rows = [
      {
        key: "prospek",
        label: "Prospek",
        desc: "Total database calon nasabah/agen yang diinput pada rentang ini",
        target: hasil.prospek * factor,
        actual: contacts.filter((c) => inRange(c.createdAt)).length,
        color: "#0E7C50",
      },
      {
        key: "janji",
        label: "Janji Temu",
        desc: "Fact Finding valid — Jalur Penjualan",
        target: hasil.janji * factor,
        actual: validCountByType("fact_finding"),
        color: "#00A758",
      },
      {
        key: "presentasi",
        label: "Presentasi",
        desc: "Presentation valid — Jalur Penjualan",
        target: hasil.presentasi * factor,
        actual: validCountByType("presentation"),
        color: "#34C381",
      },
      {
        key: "closing",
        label: "Closing",
        desc: "Closing valid — Jalur Penjualan",
        target: hasil.closing * factor,
        actual: validCountByType("closing"),
        color: "#FFB81C",
      },
    ];

    const totalTarget = rows.reduce((sum, r) => sum + r.target, 0);
    const totalActual = rows.reduce((sum, r) => sum + r.actual, 0);
    const overallRatio = totalTarget > 0 ? totalActual / totalTarget : 0;

    return { elapsedDays, daysInYear, factor, rows, overallRatio };
  }, [startDate, endDate, todayStr, hasil, contacts, activities]);

  function handlePrintComparison() {
    window.print();
  }

  const perWaktu = (n) => ({
    bulan: n / 12,
    minggu: n / 48, // 48 minggu kerja per tahun
    hari: n / 240, // 240 hari kerja per tahun
  });

  const tampil = (x) => {
    if (x >= 10) return Math.ceil(x).toString();
    if (x >= 1) return (Math.ceil(x * 2) / 2).toLocaleString("id-ID");
    return (Math.ceil(x * 10) / 10).toLocaleString("id-ID");
  };

  const stages = [
    {
      label: "Prospek",
      desc: "Nama baru yang dihubungi",
      n: hasil.prospek,
      color: "#0E7C50",
      width: 100,
    },
    {
      label: "Janji Temu",
      desc: "Prospek yang setuju bertemu",
      n: hasil.janji,
      color: "#00A758",
      width: 74,
    },
    {
      label: "Presentasi",
      desc: "Fact finding & penawaran solusi",
      n: hasil.presentasi,
      color: "#34C381",
      width: 52,
    },
    {
      label: "Closing",
      desc: "Polis terbit",
      n: hasil.closing,
      color: "#FFB81C",
      width: 34,
    },
  ];

  const inputStyle = {
    width: "100%",
    fontSize: 22,
    fontWeight: 700,
    fontFamily: font,
    padding: "12px 14px",
    borderRadius: 12,
    border: "2px solid #D7E5DD",
    outline: "none",
    color: "#0B2E20",
    background: "#FFFFFF",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#5B7268",
    marginBottom: 6,
  };

  const parseNum = (v) => {
    const n = parseInt(v.replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  };

  return (
    <div
      style={{
        background: "#F2F7F4",
        fontFamily: font,
        color: "#0B2E20",
        padding: "0 0 48px",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #04452B 0%, #00A758 100%)",
          color: "#fff",
          padding: "28px 20px 56px",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            MPA · Mulia Putri Agency
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "6px 0 4px", lineHeight: 1.2 }}>
            Kalkulator Aktivitas Agen
          </h1>
          <p style={{ fontSize: 15, margin: 0, opacity: 0.9 }}>
            Hitung mundur dari target premi ke aktivitas harian — berbasis rasio sales cycle LIMRA.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "-32px auto 0", padding: "0 16px" }}>
        {/* Kartu input */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(4,69,43,0.10)",
          }}
        >
          <label style={labelStyle}>Target Premi (APE)</label>
          <input
            style={inputStyle}
            inputMode="numeric"
            value={fmt.format(targetPremi)}
            onChange={(e) => setTargetPremi(parseNum(e.target.value))}
          />
          <div style={{ display: "flex", gap: 8, margin: "10px 0 18px" }}>
            {["tahun", "bulan"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: font,
                  border: "2px solid " + (periode === p ? "#00A758" : "#D7E5DD"),
                  background: periode === p ? "#E6F7EE" : "#fff",
                  color: periode === p ? "#04452B" : "#5B7268",
                  cursor: "pointer",
                }}
              >
                per {p === "tahun" ? "Tahun" : "Bulan"}
              </button>
            ))}
          </div>

          <label style={labelStyle}>Rata-rata Premi per Polis</label>
          <input
            style={inputStyle}
            inputMode="numeric"
            value={fmt.format(avgPremi)}
            onChange={(e) => setAvgPremi(parseNum(e.target.value))}
          />

          {/* Rasio */}
          <button
            onClick={() => setShowRasio(!showRasio)}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: "2px dashed #B9D4C6",
              background: "#F6FBF8",
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              color: "#0E7C50",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Rasio LIMRA: {rProspek} : {rJanji} : {rPresentasi} : 1{" "}
            <span style={{ float: "right" }}>{showRasio ? "▲ tutup" : "▼ atur"}</span>
          </button>

          {showRasio && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[
                { l: "Prospek", v: rProspek, set: setRProspek },
                { l: "Janji Temu", v: rJanji, set: setRJanji },
                { l: "Presentasi", v: rPresentasi, set: setRPresentasi },
              ].map((r) => (
                <div key={r.l} style={{ flex: 1 }}>
                  <div style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>{r.l}</div>
                  <input
                    style={{ ...inputStyle, fontSize: 18, padding: "8px 10px", textAlign: "center" }}
                    inputMode="numeric"
                    value={r.v}
                    onChange={(e) => r.set(Math.max(1, parseNum(e.target.value)))}
                  />
                </div>
              ))}
              <div style={{ width: 56 }}>
                <div style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>Closing</div>
                <div
                  style={{
                    ...inputStyle,
                    fontSize: 18,
                    padding: "8px 10px",
                    textAlign: "center",
                    background: "#F2F7F4",
                    color: "#5B7268",
                  }}
                >
                  1
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Funnel */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "28px 4px 12px" }}>
          Funnel Aktivitas — Target Setahun
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stages.map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: s.width + "%",
                  minWidth: 220,
                  background: s.color,
                  color: s.label === "Closing" ? "#3A2A00" : "#fff",
                  borderRadius: 14,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 12px rgba(4,69,43,0.15)",
                  transition: "width .3s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{s.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{s.desc}</div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                  {fmt.format(s.n)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ritme aktivitas */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "28px 4px 12px" }}>
          Ritme Aktivitas Agen
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(4,69,43,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              padding: "12px 16px",
              background: "#04452B",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <div>Aktivitas</div>
            <div style={{ textAlign: "center" }}>/ Bulan</div>
            <div style={{ textAlign: "center" }}>/ Minggu</div>
            <div style={{ textAlign: "center" }}>/ Hari</div>
          </div>
          {stages.map((s, i) => {
            const p = perWaktu(s.n);
            return (
              <div
                key={s.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                  padding: "14px 16px",
                  fontSize: 16,
                  fontWeight: 700,
                  background: i % 2 ? "#F6FBF8" : "#fff",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: s.color,
                      display: "inline-block",
                    }}
                  />
                  {s.label}
                </div>
                <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                  {tampil(p.bulan)}
                </div>
                <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                  {tampil(p.minggu)}
                </div>
                <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                  {tampil(p.hari)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ringkasan */}
        <div
          style={{
            marginTop: 20,
            background: "#E6F7EE",
            border: "2px solid #00A758",
            borderRadius: 16,
            padding: "16px 18px",
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <strong>Kesimpulan:</strong> untuk mencapai target premi{" "}
          <strong>{fmtRp(hasil.targetTahunan)}</strong> setahun dengan rata-rata polis{" "}
          <strong>{fmtRp(avgPremi)}</strong>, Anda butuh{" "}
          <strong>{fmt.format(hasil.closing)} closing</strong> — artinya cukup konsisten menemui{" "}
          <strong>{tampil(perWaktu(hasil.prospek).hari)} prospek baru per hari kerja</strong>.
        </div>

        {/* Perbandingan Ritme vs Aktivitas Valid */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "36px 4px 12px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
            Perbandingan Ritme vs Aktivitas Valid
          </h2>
          <button
            onClick={handlePrintComparison}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "2px solid #00A758",
              background: "#fff",
              color: "#04452B",
              fontFamily: font,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            📄 Unduh PDF
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(4,69,43,0.10)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...inputStyle, fontSize: 16, padding: "10px 12px" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={labelStyle}>Tanggal Akhir</label>
              <div
                style={{
                  ...inputStyle,
                  fontSize: 16,
                  padding: "10px 12px",
                  background: "#F2F7F4",
                  color: "#5B7268",
                }}
              >
                {endDate} <span style={{ fontSize: 11 }}>(akhir tahun, otomatis)</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#5B7268", margin: "8px 0 0" }}>
            Data aktual dihitung dari <strong>{startDate}</strong> sampai dengan hari ini (
            <strong>{todayStr}</strong>) — {comparison.elapsedDays} dari {comparison.daysInYear} hari (
            {Math.round(comparison.factor * 100)}% dari target setahun).
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(4,69,43,0.10)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
              padding: "12px 16px",
              background: "#04452B",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <div>Tahapan</div>
            <div style={{ textAlign: "center" }}>Ritme Agen</div>
            <div style={{ textAlign: "center" }}>Valid</div>
            <div style={{ textAlign: "center" }}>Capaian</div>
          </div>
          {comparison.rows.map((r, i) => {
            const pct = r.target > 0 ? Math.round((r.actual / r.target) * 100) : r.actual > 0 ? 100 : 0;
            return (
              <div
                key={r.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
                  padding: "14px 16px",
                  fontSize: 15,
                  fontWeight: 700,
                  background: i % 2 ? "#F6FBF8" : "#fff",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: r.color, display: "inline-block" }} />
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: "#5B7268", marginTop: 2 }}>{r.desc}</div>
                </div>
                <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                  {tampil(r.target)}
                </div>
                <div style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{fmt.format(r.actual)}</div>
                <div
                  style={{
                    textAlign: "center",
                    color: pct >= 100 ? "#00A758" : pct >= 60 ? "#B98A2F" : "#C0392B",
                  }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone — grafik */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "28px 4px 12px" }}>Milestone</h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 8px 24px rgba(4,69,43,0.10)",
            marginBottom: 20,
          }}
        >
          <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto" }}>
            {(() => {
              const maxVal = Math.max(1, ...comparison.rows.map((r) => Math.max(r.target, r.actual)));
              const chartH = 150;
              const baseY = 175;
              const groupW = 400 / comparison.rows.length;
              return comparison.rows.map((r, i) => {
                const cx = groupW * i + groupW / 2;
                const targetH = (r.target / maxVal) * chartH;
                const actualH = (r.actual / maxVal) * chartH;
                return (
                  <g key={r.key}>
                    <rect x={cx - 28} y={baseY - targetH} width={20} height={targetH} fill="#D7E5DD" rx={3} />
                    <rect x={cx + 8} y={baseY - actualH} width={20} height={actualH} fill={r.color} rx={3} />
                    <text x={cx - 18} y={baseY - targetH - 6} fontSize="10" fill="#5B7268" textAnchor="middle">
                      {tampil(r.target)}
                    </text>
                    <text x={cx + 18} y={baseY - actualH - 6} fontSize="10" fontWeight="700" fill="#0B2E20" textAnchor="middle">
                      {fmt.format(r.actual)}
                    </text>
                    <text x={cx} y={baseY + 20} fontSize="12" fontWeight="700" fill="#0B2E20" textAnchor="middle">
                      {r.label}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 12, color: "#5B7268" }}>
            <span>
              <span style={{ display: "inline-block", width: 10, height: 10, background: "#D7E5DD", borderRadius: 3, marginRight: 6 }} />
              Ritme Agen (target)
            </span>
            <span>
              <span style={{ display: "inline-block", width: 10, height: 10, background: "#00A758", borderRadius: 3, marginRight: 6 }} />
              Aktivitas Valid (aktual)
            </span>
          </div>
        </div>

        {/* Kesimpulan perbandingan */}
        <div
          style={{
            background: comparison.overallRatio >= 1 ? "#E6F7EE" : comparison.overallRatio >= 0.6 ? "#FFF6E5" : "#FDEAEA",
            border: "2px solid " + (comparison.overallRatio >= 1 ? "#00A758" : comparison.overallRatio >= 0.6 ? "#B98A2F" : "#C0392B"),
            borderRadius: 16,
            padding: "16px 18px",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          <strong>Kesimpulan:</strong>{" "}
          {comparison.overallRatio >= 1 ? (
            <>
              Aktivitas valid Anda <strong>sudah sesuai atau melampaui</strong> ritme yang dibutuhkan
              ({Math.round(comparison.overallRatio * 100)}% dari target berjalan) — pertahankan konsistensi ini.
            </>
          ) : comparison.overallRatio >= 0.6 ? (
            <>
              Aktivitas valid Anda <strong>sedikit di bawah</strong> ritme yang dibutuhkan
              (baru {Math.round(comparison.overallRatio * 100)}% dari target berjalan) — kejar lagi di sisa waktu
              yang ada.
            </>
          ) : (
            <>
              Aktivitas valid Anda <strong>masih jauh di bawah</strong> ritme yang dibutuhkan
              (baru {Math.round(comparison.overallRatio * 100)}% dari target berjalan) — perlu percepatan aktivitas
              segera, terutama di tahap dengan capaian paling rendah.
            </>
          )}
        </div>

        <p style={{ fontSize: 12, color: "#5B7268", marginTop: 16, textAlign: "center" }}>
          Asumsi: 48 minggu kerja & 240 hari kerja per tahun · Rasio dapat disesuaikan dengan
          pengalaman masing-masing agen.
        </p>
      </div>
    </div>
  );
}
