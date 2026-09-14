/**
 * Engine laporan analitik pipeline.
 *
 * Mengolah seluruh aktivitas (dari awal sampai terakhir) menjadi laporan
 * per calon prospek — mirip lembar review one-on-one: posisi terakhir,
 * berapa hari diam, next action, dan penanda urgensi.
 *
 * CATATAN PENTING soal "advise":
 * Next action di sini dihasilkan secara **rule-based** (berdasarkan jenis
 * aktivitas terakhir + berapa lama diam + nilai closing), BUKAN hasil
 * analisa bahasa alami atas isi catatan. Isi catatan ("Hasil Pertemuan")
 * tetap ditampilkan apa adanya sebagai konteks, supaya yang membaca bisa
 * menilai sendiri. Lihat README bagian "Batas Kemampuan Laporan Analitik".
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Ambang hari diam untuk penanda urgensi. */
export const IDLE_URGENT = 30; // > 30 hari = URGENT
export const IDLE_WARN = 14; // > 14 hari = perlu perhatian

/** Saran langkah berikutnya berdasarkan jenis aktivitas terakhir. */
const NEXT_ACTION_BY_TYPE = {
  whatsapp_call:
    "Baru kontak lewat WhatsApp — tindak lanjuti dengan mengajak bertemu langsung untuk mulai menggali kebutuhan (Fact Finding).",
  fact_finding:
    "Kebutuhan sudah digali — susun ilustrasi/proposal yang sesuai, lalu jadwalkan presentasi.",
  presentation:
    "Proposal sudah dipresentasikan — follow up keputusannya, bantu jawab keberatan yang masih mengganjal.",
  closing:
    "Sudah closing — kawal proses polis sampai issued (medical check-up, dokumen), lalu gali peluang lanjutan & referral.",
  recruit:
    "Sudah direkrut — kawal proses lisensi & onboarding sampai agen benar-benar aktif.",
};

function daysBetween(fromDateStr, toDateStr) {
  const a = new Date(fromDateStr);
  const b = new Date(toDateStr);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(0, Math.round((b - a) / MS_PER_DAY));
}

function formatRupiah(n) {
  const num = Number(n) || 0;
  return `Rp${num.toLocaleString("id-ID")}`;
}

/**
 * Menyusun laporan dari daftar aktivitas.
 *
 * @param {Array} activities  daftar aktivitas (sudah difilter per member kalau perlu)
 * @param {Array} contacts    daftar kontak (untuk profesi & kategori)
 * @param {Object} opts       { typeLabelOf(categoryKey,typeKey), todayStr, validOnly }
 */
export function buildPipelineReport(activities, contacts, opts = {}) {
  const {
    typeLabelOf = (_c, t) => t,
    todayStr = new Date().toISOString().slice(0, 10),
    validOnly = true,
  } = opts;

  // Aktivitas yang ditandai Tidak Valid tidak dihitung; opsional juga
  // membatasi hanya yang sudah tervalidasi Admin.
  const usable = activities.filter((a) => {
    if (a.invalid) return false;
    if (validOnly && !a.validated) return false;
    return true;
  });

  const contactById = new Map(contacts.map((c) => [c.id, c]));

  // --- Kelompokkan per kontak (per jalur, karena satu orang bisa muncul
  // di dua jalur: calon nasabah sekaligus calon agen). ---
  const groups = new Map();
  usable.forEach((a) => {
    const key = `${a.category}::${a.contactId || a.contactName || "tanpa-nama"}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        category: a.category,
        contactId: a.contactId || "",
        contactName: a.contactName || "(tanpa nama)",
        contactProfession: a.contactProfession || "",
        memberName: a.memberName || "",
        activities: [],
      });
    }
    groups.get(key).activities.push(a);
  });

  const rows = [];
  groups.forEach((g) => {
    const sorted = [...g.activities].sort((x, y) =>
      (x.date || "").localeCompare(y.date || "")
    );
    const last = sorted[sorted.length - 1];
    const first = sorted[0];
    const idleDays = daysBetween(last.date, todayStr);

    // Jejak perjalanan prospek: Fact Finding → Presentation → Closing, dst.
    const journey = sorted.map((a) => typeLabelOf(a.category, a.type));

    // Total premi kalau ada closing.
    const closings = sorted.filter((a) => a.type === "closing");
    const totalPremi = closings.reduce(
      (sum, a) => sum + (Number(a.premiumNominal) || 0),
      0
    );

    const contact = contactById.get(g.contactId);

    // Penanda urgensi.
    let flag = null;
    if (idleDays > IDLE_URGENT) {
      flag = { level: "urgent", label: `URGENT — ${idleDays} hari tanpa tindak lanjut` };
    } else if (idleDays > IDLE_WARN) {
      flag = { level: "warn", label: `${idleDays} hari diam` };
    }

    // Next action rule-based + konteks hari diam.
    const baseAction =
      NEXT_ACTION_BY_TYPE[last.type] ||
      "Tentukan langkah berikutnya sesuai posisi terakhir prospek ini.";
    const idleNote =
      idleDays > IDLE_WARN
        ? ` Sudah ${idleDays} hari sejak kontak terakhir — jangan dibiarkan lebih lama lagi.`
        : idleDays > 0
        ? ` Terakhir dikontak ${idleDays} hari lalu.`
        : " Baru dikontak hari ini.";

    rows.push({
      key: g.key,
      category: g.category,
      contactId: g.contactId,
      name: g.contactName,
      profession: g.contactProfession || contact?.profession || "",
      contactCategory: contact?.category || "",
      memberName: g.memberName,
      totalActivities: sorted.length,
      firstDate: first.date,
      lastDate: last.date,
      lastTypeLabel: typeLabelOf(last.category, last.type),
      lastTypeKey: last.type,
      idleDays,
      journey,
      lastNote: last.note || "",
      allNotes: sorted
        .filter((a) => a.note)
        .map((a) => ({ date: a.date, typeLabel: typeLabelOf(a.category, a.type), note: a.note })),
      productSold: closings.map((a) => a.productSold).filter(Boolean).join(", "),
      totalPremi,
      totalPremiLabel: totalPremi > 0 ? formatRupiah(totalPremi) : "",
      hasClosing: closings.length > 0,
      flag,
      nextAction: baseAction + idleNote,
    });
  });

  // Urutkan: yang paling lama diam di atas (paling butuh perhatian).
  rows.sort((a, b) => b.idleDays - a.idleDays);

  const penjualan = rows.filter((r) => r.category === "nasabah");
  const rekrutmen = rows.filter((r) => r.category === "agen");

  // --- Ringkasan (KPI) ---
  const allDates = usable.map((a) => a.date).filter(Boolean).sort();
  const totalPremiAll = usable
    .filter((a) => a.type === "closing")
    .reduce((sum, a) => sum + (Number(a.premiumNominal) || 0), 0);

  const summary = {
    totalProspek: rows.length,
    totalProspekPenjualan: penjualan.length,
    totalProspekRekrutmen: rekrutmen.length,
    totalAktivitas: usable.length,
    totalClosing: usable.filter((a) => a.type === "closing").length,
    totalRecruit: usable.filter((a) => a.type === "recruit").length,
    totalPremi: totalPremiAll,
    totalPremiLabel: formatRupiah(totalPremiAll),
    urgentCount: rows.filter((r) => r.flag?.level === "urgent").length,
    warnCount: rows.filter((r) => r.flag?.level === "warn").length,
    periodStart: allDates[0] || "",
    periodEnd: allDates[allDates.length - 1] || "",
  };

  // --- Highlight penting (hal yang perlu disorot lebih dulu) ---
  const highlights = [];

  const urgent = rows.filter((r) => r.flag?.level === "urgent");
  if (urgent.length > 0) {
    highlights.push({
      level: "urgent",
      title: `${urgent.length} prospek terlantar lebih dari ${IDLE_URGENT} hari`,
      detail: `Paling lama: ${urgent[0].name} (${urgent[0].idleDays} hari sejak ${urgent[0].lastTypeLabel}). Prospek yang didiamkan selama ini biasanya paling cepat hilang — dahulukan menghubungi mereka.`,
      names: urgent.slice(0, 5).map((r) => r.name),
    });
  }

  const closingBelumDikawal = rows.filter(
    (r) => r.hasClosing && r.lastTypeKey === "closing" && r.idleDays > IDLE_WARN
  );
  if (closingBelumDikawal.length > 0) {
    const biggest = [...closingBelumDikawal].sort((a, b) => b.totalPremi - a.totalPremi)[0];
    highlights.push({
      level: "warn",
      title: `${closingBelumDikawal.length} closing belum ada tindak lanjut pasca-closing`,
      detail: `Nilai terbesar: ${biggest.name} (${biggest.totalPremiLabel}, ${biggest.idleDays} hari sejak closing). Pastikan polis sudah issued dan gali peluang lanjutan/referral selagi nasabah masih hangat.`,
      names: closingBelumDikawal.slice(0, 5).map((r) => r.name),
    });
  }

  const mentokDiFactFinding = rows.filter(
    (r) => r.lastTypeKey === "fact_finding" && r.idleDays > IDLE_WARN
  );
  if (mentokDiFactFinding.length > 0) {
    highlights.push({
      level: "warn",
      title: `${mentokDiFactFinding.length} prospek berhenti di tahap Fact Finding`,
      detail:
        "Kebutuhan sudah digali tapi belum ada presentasi. Ini tahap yang paling sering bocor — siapkan ilustrasi dan jadwalkan presentasinya.",
      names: mentokDiFactFinding.slice(0, 5).map((r) => r.name),
    });
  }

  const presentasiMenggantung = rows.filter(
    (r) => r.lastTypeKey === "presentation" && r.idleDays > IDLE_WARN
  );
  if (presentasiMenggantung.length > 0) {
    highlights.push({
      level: "warn",
      title: `${presentasiMenggantung.length} presentasi belum ada keputusan`,
      detail:
        "Sudah dipresentasikan tapi belum closing dan sudah lama tidak disentuh. Follow up keputusannya — semakin lama jaraknya, semakin dingin minatnya.",
      names: presentasiMenggantung.slice(0, 5).map((r) => r.name),
    });
  }

  const baruWhatsapp = rows.filter((r) => r.lastTypeKey === "whatsapp_call");
  if (baruWhatsapp.length > 0) {
    highlights.push({
      level: "info",
      title: `${baruWhatsapp.length} prospek baru sebatas kontak WhatsApp`,
      detail:
        "Belum ada pertemuan tatap muka. Ajak bertemu untuk mulai menggali kebutuhan — kontak WhatsApp saja jarang berujung closing.",
      names: baruWhatsapp.slice(0, 5).map((r) => r.name),
    });
  }

  if (highlights.length === 0) {
    highlights.push({
      level: "good",
      title: "Tidak ada prospek yang terlantar",
      detail:
        "Semua prospek di pipeline masih dalam rentang tindak lanjut yang wajar. Pertahankan ritme ini.",
      names: [],
    });
  }

  return { summary, penjualan, rekrutmen, highlights, rows };
}
