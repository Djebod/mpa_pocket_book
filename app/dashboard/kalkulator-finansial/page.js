"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";

// ---------- Util format ----------
const idFormatter = new Intl.NumberFormat("id-ID");

function formatRupiah(n) {
  const v = Math.round(n);
  return "Rp" + idFormatter.format(isFinite(v) ? v : 0);
}

function formatThousands(n) {
  const v = Math.round(n);
  return idFormatter.format(isFinite(v) ? v : 0);
}

function parseDigits(str) {
  const digits = String(str || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function yearsBetween(a, b) {
  return Math.max(0, b - a);
}

function formatPrintTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- Definisi 4 modul (data murni, sama seperti versi sebelumnya, sudah diverifikasi) ----------
const MODULES = [
  {
    id: "jiwa",
    tabLabel: "Asuransi Jiwa",
    cardTitle: "Uang Pertanggungan Asuransi Jiwa",
    cardSub: "Metode Income Replacement — dana pengganti penghasilan untuk ahli waris.",
    resultLabel: "Uang Pertanggungan Dibutuhkan",
    fields: [
      { id: "j_pengeluaran", label: "Pengeluaran bulanan saat ini", type: "money", def: 10000000 },
      { id: "j_usiaSekarang", label: "Usia saat ini", type: "number", def: 30, suffix: "tahun" },
      { id: "j_usiaAkhir", label: "Usia akhir masa produktif", type: "number", def: 60, suffix: "tahun" },
      { id: "j_inflasi", label: "Asumsi inflasi per tahun", type: "number", def: 5, suffix: "%" },
    ],
    calculate: (v) => {
      const incomeReplacement = 200 * v.j_pengeluaran;
      const sisaMasaProduktif = yearsBetween(v.j_usiaSekarang, v.j_usiaAkhir);
      const faktorInflasi = Math.pow(1 + v.j_inflasi / 100, sisaMasaProduktif);
      const upDibutuhkan = incomeReplacement * faktorInflasi;
      return {
        main: upDibutuhkan,
        breakdown: [
          ["Income Replacement (200 × pengeluaran bulanan)", formatRupiah(incomeReplacement)],
          ["Sisa masa produktif", `${sisaMasaProduktif} tahun`],
          ["Faktor koreksi inflasi", `×${faktorInflasi.toFixed(4)}`],
          ["Total UP dibutuhkan", formatRupiah(upDibutuhkan)],
        ],
        note: "Dengan asumsi hasil investasi sekitar 6% per tahun, bunga dari dana sebesar 200x pengeluaran bulanan Anda diperkirakan cukup untuk membiayai kebutuhan hidup ahli waris tanpa menggerus dana pokoknya. Nilai ini kemudian disesuaikan dengan inflasi hingga akhir masa produktif Anda saat ini.",
      };
    },
  },
  {
    id: "kritis",
    tabLabel: "Sakit Kritis",
    cardTitle: "Uang Pertanggungan Sakit Kritis",
    cardSub: "Dana darurat untuk membiayai hidup selama masa pemulihan.",
    resultLabel: "Uang Pertanggungan Sakit Kritis",
    fields: [
      { id: "k_pengeluaran", label: "Pengeluaran bulanan saat ini", type: "money", def: 10000000 },
      { id: "k_usiaSekarang", label: "Usia saat ini", type: "number", def: 30, suffix: "tahun" },
      { id: "k_usiaAkhir", label: "Usia akhir masa produktif", type: "number", def: 60, suffix: "tahun" },
      { id: "k_inflasi", label: "Asumsi inflasi per tahun", type: "number", def: 5, suffix: "%" },
    ],
    calculate: (v) => {
      const pengeluaranTahunan = v.k_pengeluaran * 12;
      const danaDaruratKritis = 5 * pengeluaranTahunan;
      const sisaMasaProduktif = yearsBetween(v.k_usiaSekarang, v.k_usiaAkhir);
      const faktorInflasi = Math.pow(1 + v.k_inflasi / 100, sisaMasaProduktif);
      const upKritis = danaDaruratKritis * faktorInflasi;
      return {
        main: upKritis,
        breakdown: [
          ["Pengeluaran tahunan (12 × bulanan)", formatRupiah(pengeluaranTahunan)],
          ["Dana darurat kritis (5 × pengeluaran tahunan)", formatRupiah(danaDaruratKritis)],
          ["Sisa masa produktif", `${sisaMasaProduktif} tahun`],
          ["Faktor koreksi inflasi", `×${faktorInflasi.toFixed(4)}`],
          ["Total UP sakit kritis", formatRupiah(upKritis)],
        ],
        note: "Saat terkena penyakit kritis, umumnya dibutuhkan dana darurat setara kurang lebih 5 tahun pengeluaran untuk membiayai hidup selama masa pemulihan tanpa penghasilan. Nilai ini disesuaikan dengan inflasi hingga akhir masa produktif Anda saat ini.",
      };
    },
  },
  {
    id: "pensiun",
    tabLabel: "Dana Pensiun",
    cardTitle: "Total Kebutuhan Dana Pensiun",
    cardSub: "Total dana yang dibutuhkan untuk membiayai masa pensiun.",
    resultLabel: "Total Dana Dibutuhkan Saat Pensiun",
    fields: [
      { id: "p_usiaSekarang", label: "Usia sekarang", type: "number", def: 30, suffix: "tahun" },
      { id: "p_usiaPensiun", label: "Usia pensiun", type: "number", def: 55, suffix: "tahun" },
      { id: "p_harapanHidup", label: "Perkiraan usia harapan hidup", type: "number", def: 80, suffix: "tahun" },
      { id: "p_pengeluaran", label: "Pengeluaran bulanan (nilai sekarang)", type: "money", def: 8000000 },
      { id: "p_inflasi", label: "Asumsi inflasi", type: "number", def: 5, suffix: "%/th" },
    ],
    calculate: (v) => {
      const n = yearsBetween(v.p_usiaSekarang, v.p_usiaPensiun);
      const m = yearsBetween(v.p_usiaPensiun, v.p_harapanHidup);
      const pengeluaranSaatPensiun = v.p_pengeluaran * Math.pow(1 + v.p_inflasi / 100, n);
      const pengeluaranTahunSaatPensiun = pengeluaranSaatPensiun * 12;
      const totalDanaPensiun = pengeluaranTahunSaatPensiun * m;
      return {
        main: totalDanaPensiun,
        breakdown: [
          ["Pengeluaran bulanan saat pensiun (setelah inflasi)", formatRupiah(pengeluaranSaatPensiun)],
          ["Pengeluaran tahunan saat pensiun", formatRupiah(pengeluaranTahunSaatPensiun)],
          ["Lama masa pensiun", `${m} tahun`],
          ["Total dana dibutuhkan saat pensiun", formatRupiah(totalDanaPensiun)],
        ],
        note: "Perhitungan ini murni kebutuhan dana (tanpa memperhitungkan hasil investasi atau dana yang sudah Anda miliki saat ini), dari usia pensiun hingga perkiraan usia harapan hidup, dengan pengeluaran bulanan yang sudah disesuaikan inflasi.",
      };
    },
  },
  {
    id: "pendidikan",
    tabLabel: "Dana Pendidikan",
    cardTitle: "Total Kebutuhan Dana Pendidikan",
    cardSub: "Proyeksi biaya pendidikan di masa depan.",
    resultLabel: "Biaya Pendidikan di Masa Depan",
    fields: [
      { id: "d_biaya", label: "Total biaya pendidikan (harga sekarang)", type: "money", def: 150000000 },
      { id: "d_tahun", label: "Berapa tahun lagi dana dibutuhkan", type: "number", def: 10, suffix: "tahun" },
      { id: "d_inflasi", label: "Inflasi biaya pendidikan", type: "number", def: 10, suffix: "%/th" },
    ],
    calculate: (v) => {
      const tahun = Math.max(0, v.d_tahun);
      const biayaMasaDepan = v.d_biaya * Math.pow(1 + v.d_inflasi / 100, tahun);
      return {
        main: biayaMasaDepan,
        breakdown: [
          ["Biaya pendidikan sekarang", formatRupiah(v.d_biaya)],
          ["Jangka waktu", `${tahun} tahun`],
          ["Biaya pendidikan di masa depan", formatRupiah(biayaMasaDepan)],
        ],
        note: "Biaya pendidikan cenderung naik lebih cepat dari inflasi umum. Proyeksi ini membantu memperkirakan berapa dana yang perlu disiapkan pada saat dana pendidikan benar-benar dibutuhkan.",
      };
    },
  },
];

function buildDefaultValues() {
  const values = {};
  MODULES.forEach((mod) => mod.fields.forEach((f) => (values[f.id] = f.def)));
  return values;
}

const NEW_NASABAH_VALUE = "__new__";

export default function KalkulatorFinansialPage() {
  const { session } = useAuth();
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [values, setValues] = useState(buildDefaultValues);
  const [printLabel, setPrintLabel] = useState("");

  const [contacts, setContacts] = useState([]);
  const [nasabahSelect, setNasabahSelect] = useState("");
  const [newNasabahName, setNewNasabahName] = useState("");
  const [newNasabahProfession, setNewNasabahProfession] = useState("");
  const [nasabahError, setNasabahError] = useState("");

  useEffect(() => {
    if (!session) return;
    setContacts(store.getContactsByMember(session.memberId));
  }, [session]);

  // Nasabah relevan: kategori Calon Nasabah atau Calon Agen & Nasabah —
  // sama seperti kontak yang muncul di Jalur Penjualan pada Catat Aktivitas.
  const nasabahOptions = useMemo(() => {
    const jalurPenjualan = store.getActivityCategories().find((c) => c.key === "nasabah");
    const allowedCategories = jalurPenjualan?.contactCategories || [];
    return contacts.filter((c) => allowedCategories.includes(c.category));
  }, [contacts]);

  const selectedNasabah = contacts.find((c) => c.id === nasabahSelect) || null;

  function handleSaveNewNasabah() {
    setNasabahError("");
    if (!newNasabahName.trim() || !newNasabahProfession.trim()) {
      setNasabahError("Nama dan Profesi wajib diisi.");
      return;
    }
    try {
      const created = store.addContact({
        memberId: session.memberId,
        name: newNasabahName.trim(),
        profession: newNasabahProfession.trim(),
        category: "Calon Nasabah",
      });
      setContacts(store.getContactsByMember(session.memberId));
      setNasabahSelect(created.id);
      setNewNasabahName("");
      setNewNasabahProfession("");
    } catch (err) {
      setNasabahError(err.message || "Gagal menyimpan ke database nasabah.");
    }
  }

  const activeModule = MODULES.find((m) => m.id === activeId);
  const result = useMemo(() => activeModule.calculate(values), [activeModule, values]);

  function setMoneyField(fieldId, rawInput) {
    setValues((prev) => ({ ...prev, [fieldId]: parseDigits(rawInput) }));
  }

  function setNumberField(fieldId, rawInput) {
    const cleaned = rawInput.replace(/[^\d.,-]/g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    setValues((prev) => ({ ...prev, [fieldId]: cleaned === "" ? 0 : isNaN(n) ? prev[fieldId] : n }));
  }

  function handlePrint() {
    const nasabahLine = selectedNasabah ? ` — Nasabah: ${selectedNasabah.name} (${selectedNasabah.profession})` : "";
    setPrintLabel(`${activeModule.cardTitle}${nasabahLine} — Dicetak pada ${formatPrintTimestamp()}`);
    // Beri waktu satu frame supaya label print sempat ter-render sebelum dialog cetak muncul.
    requestAnimationFrame(() => window.print());
  }

  return (
    <div>
      {/* Print stylesheet — cuma aktif saat halaman ini terbuka. Saat cetak,
          sidebar/header aplikasi ikut disembunyikan supaya hasil PDF cuma
          berisi kartu kalkulator, dengan tema terang supaya hemat tinta. */}
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: #fff !important; }
        }
        .print-only { display: none; }
      `}</style>

      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kalkulator Finansial</h1>
      <p className="text-sm text-ink/60 mb-6 no-print">
        Estimasi cepat 4 kebutuhan finansial nasabah — hitung otomatis saat Anda mengetik.
      </p>

      <div className="flex gap-1 border-b border-ink/15 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 no-print">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveId(m.id)}
            className={`tab-notch whitespace-nowrap px-3.5 sm:px-4 py-3 sm:py-2.5 text-sm font-semibold transition-colors ${
              activeId === m.id
                ? "bg-card text-ink border border-b-0 border-ink/15"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {m.tabLabel}
          </button>
        ))}
      </div>

      <p className="print-only text-xs text-ink/60 mb-4 pb-3 border-b-2 border-ink/20">{printLabel}</p>

      <div className="no-print bg-card border border-ink/10 rounded-lg px-4 sm:px-6 py-5 sm:py-6 shadow-stamp mb-6">
        <h2 className="font-display text-lg text-ink mb-1">Data Nasabah</h2>
        <p className="text-xs text-ink/50 mb-4">
          Pilih dari Database Calon Prospek, atau tambahkan baru — otomatis ikut tersimpan ke database. Data ini
          akan ikut tercantum saat hasil kalkulasi diunduh sebagai PDF.
        </p>

        <select
          value={nasabahSelect}
          onChange={(e) => setNasabahSelect(e.target.value)}
          className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none mb-3"
        >
          <option value="">— Tidak pakai data nasabah —</option>
          {nasabahOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.profession})
            </option>
          ))}
          <option value={NEW_NASABAH_VALUE}>➕ Tambah Nasabah Baru…</option>
        </select>

        {nasabahSelect === NEW_NASABAH_VALUE && (
          <div className="bg-paper-dark/40 border border-ink/10 rounded-md px-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Nama</label>
                <input
                  value={newNasabahName}
                  onChange={(e) => setNewNasabahName(e.target.value)}
                  placeholder="Contoh: Syam Shugi"
                  className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Profesi</label>
                <input
                  value={newNasabahProfession}
                  onChange={(e) => setNewNasabahProfession(e.target.value)}
                  placeholder="Contoh: Wiraswasta"
                  className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
                />
              </div>
            </div>
            {nasabahError && <p className="text-xs text-rust mb-2">{nasabahError}</p>}
            <button
              type="button"
              onClick={handleSaveNewNasabah}
              className="text-xs font-semibold bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink-light transition-colors"
            >
              Simpan ke Database Nasabah
            </button>
          </div>
        )}

        {selectedNasabah && (
          <p className="text-xs text-sage font-semibold">
            ✓ Data untuk: {selectedNasabah.name} ({selectedNasabah.profession})
          </p>
        )}
      </div>

      {selectedNasabah && (
        <p className="print-only text-sm font-semibold text-ink mb-4">
          Nasabah: {selectedNasabah.name} — {selectedNasabah.profession}
        </p>
      )}

      <div className="bg-card border border-ink/10 rounded-lg rounded-tl-none px-4 sm:px-6 py-5 sm:py-6 shadow-stamp mb-6">
        <h2 className="font-display text-lg text-ink mb-1">{activeModule.cardTitle}</h2>
        <p className="text-xs text-ink/50 mb-5">{activeModule.cardSub}</p>

        <div className="grid sm:grid-cols-2 gap-5">
          {activeModule.fields.map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-semibold text-ink mb-1.5">{f.label}</label>
              <div className="flex items-center rounded-md border border-ink/20 bg-paper overflow-hidden focus-within:border-brass">
                {f.type === "money" && <span className="pl-3.5 pr-1 text-sm font-semibold text-ink/45">Rp</span>}
                <input
                  type="text"
                  inputMode={f.type === "money" ? "numeric" : "decimal"}
                  value={f.type === "money" ? formatThousands(values[f.id]) : String(values[f.id])}
                  onChange={(e) =>
                    f.type === "money" ? setMoneyField(f.id, e.target.value) : setNumberField(f.id, e.target.value)
                  }
                  className={`flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-sm focus:outline-none ${
                    f.type === "money" ? "pl-1" : ""
                  }`}
                />
                {f.suffix && <span className="pr-3.5 pl-1 text-xs text-ink/45">{f.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-brass/40 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">{activeModule.resultLabel}</p>
          <button
            type="button"
            onClick={handlePrint}
            className="no-print shrink-0 text-xs font-semibold text-ink/60 hover:text-brass border border-ink/20 rounded-md px-3 py-1.5"
          >
            📄 Unduh PDF
          </button>
        </div>
        <p className="font-mono text-3xl font-bold text-brass mb-4">{formatRupiah(result.main)}</p>

        <div className="border-t border-dashed border-ink/15 pt-4 space-y-1.5">
          {result.breakdown.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-ink/60">{row[0]}</span>
              <span className="font-semibold text-ink text-right">{row[1]}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-ink/50 leading-relaxed bg-paper-dark/40 rounded-md px-3.5 py-3 mt-4">
          {result.note}
        </p>
      </div>

      <p className="text-xs text-ink/40 leading-relaxed mt-6 no-print">
        Kalkulator ini memberikan estimasi berdasarkan asumsi yang Anda masukkan dan bukan merupakan nasihat
        keuangan atau penawaran produk. Hasil sebenarnya dapat berbeda tergantung kondisi pasar dan pribadi. Untuk
        keputusan keuangan, disarankan berkonsultasi dengan perencana keuangan atau agen berlisensi.
      </p>
    </div>
  );
}
