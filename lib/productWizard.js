/**
 * Knowledge Base (KB) & Decision Tree (TREE) untuk wizard Rekomendasi
 * Produk. Sesuai aturan pengembangan (bagian E spesifikasi): file ini
 * BERISI DATA SAJA — tidak ada logika render di sini, supaya update
 * aturan/produk tidak perlu menyentuh komponen halaman.
 *
 * Rules (bagian B) adalah satu-satunya sumber kebenaran. Satu bagian
 * (R3, cabang "Ingin ada nilai kembali di akhir kontrak") direkonstruksi
 * dari knowledge base produk karena teks asli sempat terpotong saat
 * di-convert dari PDF — sudah ditandai di bawah dengan komentar
 * "REKONSTRUKSI".
 */

// ---------- Knowledge Base Produk ----------

export const KB = {
  MDSA: {
    name: "MiSmart Insurance Solution (unit link)",
    spec: "Jiwa unit link + rider lengkap (kesehatan MiSHC, sakit kritis MiSCC, income replacement MiSIR). Ada risiko investasi — pastikan nasabah paham.",
  },
  MUHC: {
    name: "MiUltimate Health Care",
    spec: "Kesehatan tradisional stand-alone, sesuai tagihan. Limit tahunan 4–30M + booster. Usia masuk 30 hari–70 th, perpanjang s/d 110 th. Plan Smart (deductible) hemat ±35-40%.",
  },
  MUHC_SYARIAH: {
    name: "MiUltimate Health Care Syariah",
    spec: "Manfaat setara MUHC dengan akad syariah (tolong menolong antar peserta). Limit 4–20M + booster.",
  },
  MCCP: {
    name: "Manulife Critical Care Protection",
    spec: "Sakit kritis tahap awal s/d akhir, proteksi s/d usia 85. Masa bayar 10 th. Manfaat ICU + pembaruan UP khusus kanker. Akhir kontrak: 100% UP.",
  },
  MUCC: {
    name: "MiUltimate Critical Care",
    spec: "±50 sakit kritis tahap akhir. Bayar 5 th, proteksi 20 th. Tidak klaim → premi kembali di akhir masa. Usia masuk s/d 65 th.",
  },
  PAP: {
    name: "ProActive Plus",
    spec: "Term life murni, premi flat. Dapat diperpanjang s/d usia 70 th tanpa seleksi ulang. Usia masuk 18–65 th. Rupiah & Dollar. Premi min ±4 jt/th.",
  },
  FLEXI_AMANAH: {
    name: "MPS Flexi Amanah (syariah)",
    spec: "Term life murni, kontribusi paling efisien untuk SA besar. Rupiah & Dollar. Dapat diperpanjang s/d usia 110 th. Kontribusi min ±4 jt/th. Premi hangus.",
  },
  FLEXI_CERMAT: {
    name: "MPS Flexi Cermat (syariah)",
    spec: "Endowment syariah: SA (UP) cair 100% baik masih hidup di akhir masa maupun meninggal dalam masa perlindungan. Pilihan term 15/25/35 th (masa bayar 5/10/15 th). Rupiah & Dollar. Full underwriting. Kontribusi min ±5 jt/th.",
  },
  FLEXI_BERKAH: {
    name: "MPS Flexi Berkah (syariah)",
    spec: "Whole life s/d usia 110 dengan pengembalian kontribusi sebagian. Rupiah & Dollar. Usia masuk 30 hari–70 th.",
  },
  MDLA_A: {
    name: "Manulife Dynamic Life Assurance — Plan A",
    spec: "Term life tanpa nilai tunai, masa bayar singkat (5/10/15/20 th) untuk proteksi 20/30 th. Rupiah saja. Usia masuk 30 hari–70 th, premi min ±475rb/bln.",
  },
  MDLA_B: {
    name: "Manulife Dynamic Life Assurance — Plan B",
    spec: "Jiwa tradisional, premi kembali 100% di akhir masa. Masa 20–60 th. Rupiah. Usia masuk 30 hari–70 th, premi min ±475rb/bln.",
  },
  MDLA_C: {
    name: "Manulife Dynamic Life Assurance — Plan C",
    spec: "Jiwa tradisional, UP cair 100% di akhir masa (hidup atau meninggal). Pilihan term panjang: 20/30/40/50/60/70/80/90 th. Rupiah. Usia masuk 30 hari–70 th, premi min ±475rb/bln.",
  },
  MDWA_B: {
    name: "Manulife Dynamic Wealth Assurance — Plan B",
    spec: "Endowment, Guaranteed Issued (sudah sakit pun bisa). Usia masuk s/d 85 th. Premi sekaligus/5/10 th. Rupiah & Dollar. Nilai tunai dijamin.",
  },
  MDWA_C: {
    name: "Manulife Dynamic Wealth Assurance — Plan C",
    spec: "Endowment dengan pencairan bertahap, Guaranteed Issued. Usia masuk s/d 85 th. Rupiah & Dollar.",
  },
  MDWA_ANUITAS: {
    name: "Manulife Dynamic Wealth Assurance — Plan Anuitas",
    spec: "Guaranteed Issued. Dana mulai cair 5 tahun setelah selesai bayar premi. Rupiah & Dollar.",
  },
  MDWA_COMBO: {
    name: "Manulife Dynamic Wealth Assurance — Plan Combo",
    spec: "Guaranteed Issued. Rupiah & Dollar. Detail kombinasi manfaat: lihat product knowledge MDWA.",
  },
  MIFIP: {
    name: "MiFuture Income Protector",
    spec: "Endowment pensiun, Full Underwriting. Pilihan usia dapat dana: 25/35/45/55/60. 100% Dana Mapan + 20%/th selama 20 th + manfaat akhir. Rupiah & Dollar.",
  },
  MIPRECIOUS: {
    name: "MiPreparation Legacy for Our Assurance",
    spec: "Endowment warisan lintas generasi. Tunai berkala + manfaat akhir; tertanggung dapat diganti s/d 3x (polis diwariskan). Premi sekaligus/2/5 th, masa 30/50 th. Rupiah & Dollar.",
  },
};

// ---------- Menu kategori kebutuhan (akar wizard) ----------

export const CATEGORIES = [
  { id: "kesehatan", label: "Proteksi Kesehatan" },
  { id: "sakitKritis", label: "Proteksi Sakit Kritis" },
  { id: "jiwaBerjangka", label: "Proteksi Jiwa Berjangka" },
  { id: "warisan", label: "Warisan (Jiwa Seumur Hidup)" },
  { id: "pendidikan", label: "Dana Pendidikan" },
  { id: "pensiun", label: "Dana Pensiun" },
  { id: "distribusi", label: "Distribusi Kekayaan" },
];

// ---------- Decision Tree ----------
// Tiap node: { question, options: [{ label, subtext?, next }] }
// `next` adalah node pertanyaan lain, ATAU { result: { code, note?, alt?: [{code, note?}] } }

export const TREE = {
  kesehatan: {
    question: "Nasabah ada preferensi unit link atau tradisional?",
    options: [
      {
        label: "Unit Link",
        next: { result: { code: "MDSA", note: "Tambahkan rider kesehatan MiSHC sesuai plan kamar." } },
      },
      {
        label: "Tradisional",
        next: {
          question: "Nasabah menginginkan pengelolaan syariah?",
          options: [
            { label: "Konvensional / Tidak ada preferensi", next: { result: { code: "MUHC" } } },
            { label: "Syariah", next: { result: { code: "MUHC_SYARIAH" } } },
          ],
        },
      },
    ],
  },

  sakitKritis: {
    question: "Nasabah ada preferensi unit link atau tradisional?",
    options: [
      {
        label: "Unit Link",
        next: { result: { code: "MDSA", note: "Tambahkan rider sakit kritis MiSCC / MiSESCC." } },
      },
      {
        label: "Tradisional",
        next: {
          question: "Nasabah ingin dilindungi sampai kapan?",
          options: [
            {
              label: "Sampai usia 85 tahun",
              subtext: "Cover sejak tahap awal + manfaat ICU",
              next: { result: { code: "MCCP" } },
            },
            {
              label: "20 tahun / masa produktif",
              subtext: "Bayar 5 th, premi kembali jika tidak klaim",
              next: { result: { code: "MUCC" } },
            },
          ],
        },
      },
    ],
  },

  jiwaBerjangka: {
    question: "Jika tidak terjadi risiko, nasabah ingin apa di akhir kontrak?",
    options: [
      {
        label: "Premi hangus tidak masalah",
        subtext: "Prioritas UP maksimal",
        next: {
          question: "Nasabah ingin bayar premi bagaimana?",
          options: [
            {
              label: "Bayar terus selama masa proteksi",
              next: {
                question: "Proteksi ingin bisa diperpanjang sampai usia berapa?",
                options: [
                  { label: "Sampai usia 70 tahun", next: { result: { code: "PAP" } } },
                  { label: "Sampai usia 110 tahun", next: { result: { code: "FLEXI_AMANAH" } } },
                ],
              },
            },
            {
              label: "Masa bayar singkat",
              subtext: "5 / 10 / 15 / 20 tahun",
              next: { result: { code: "MDLA_A" } },
            },
          ],
        },
      },
      // REKONSTRUKSI: label & sub-pertanyaan cabang ini disusun ulang dari
      // knowledge base (MDLA Plan B & C) karena teks sumber terpotong.
      {
        label: "Ingin ada nilai kembali di akhir kontrak",
        next: {
          question: "Nasabah ingin nilai kembalinya bagaimana?",
          options: [
            { label: "Premi kembali 100%", next: { result: { code: "MDLA_B" } } },
            {
              label: "UP cair 100% di akhir kontrak",
              subtext: "Hidup atau meninggal, UP pasti cair",
              next: {
                result: {
                  code: "MDLA_C",
                  alt: [
                    {
                      code: "FLEXI_CERMAT",
                      note: "Pilihan term pendek: 15/25/35 th, masa bayar 5/10/15 th, Rupiah & Dollar.",
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ],
  },

  warisan: {
    question: "Nasabah ingin manfaat hidupnya bagaimana?",
    options: [
      {
        label: "Premi cair saat hidup, proteksi jalan terus",
        subtext: "Premi lebih tinggi, benefit lebih besar; Rupiah & Dollar",
        next: { result: { code: "FLEXI_BERKAH" } },
      },
      {
        label: "Premi kembali di akhir kontrak",
        subtext: "Premi lebih murah; Rupiah",
        next: { result: { code: "MDLA_B", note: "Pilih term TERPANJANG yang tersedia untuk usia nasabah." } },
      },
    ],
  },

  pendidikan: {
    question: "Dana pendidikan ingin cair bagaimana?",
    options: [
      {
        label: "Sekaligus (lumpsum)",
        next: {
          question: "Apakah tertanggung punya riwayat penyakit yang bisa mempersulit seleksi kesehatan?",
          options: [
            {
              label: "Tidak",
              subtext: "Full Underwriting",
              next: { result: { code: "FLEXI_CERMAT", note: "Masa 15 tahun; Rupiah & Dollar." } },
            },
            { label: "Ya", subtext: "Guaranteed Issued", next: { result: { code: "MDWA_B" } } },
          ],
        },
      },
      {
        label: "Bertahap",
        next: { result: { code: "MDWA_C", note: "Guaranteed Issued, tanpa seleksi kesehatan." } },
      },
    ],
  },

  pensiun: {
    question: "Dana pensiun ingin diterima bagaimana?",
    options: [
      {
        label: "Sekaligus (lumpsum)",
        next: {
          question: "Mata uang polis?",
          options: [
            { label: "Rupiah", next: { result: { code: "MDLA_C", alt: [{ code: "FLEXI_CERMAT" }] } } },
            { label: "Dollar", next: { result: { code: "FLEXI_CERMAT" } } },
          ],
        },
      },
      {
        label: "Bertahap",
        subtext: "Seperti gaji",
        next: {
          question: "Apakah nasabah punya riwayat penyakit yang bisa mempersulit seleksi kesehatan?",
          options: [
            {
              label: "Tidak",
              subtext: "Full Underwriting",
              next: {
                result: {
                  code: "MIFIP",
                  note: "Pilihan usia dapat dana 25/35/45/55/60 ditentukan saat membuat ilustrasi — tidak ditanyakan di wizard.",
                },
              },
            },
            {
              label: "Ya",
              subtext: "Guaranteed Issued",
              next: {
                result: {
                  code: "MDWA_ANUITAS",
                  note: "Dana mulai cair 5 tahun setelah selesai bayar premi.",
                  alt: [{ code: "MDWA_COMBO" }],
                },
              },
            },
          ],
        },
      },
    ],
  },

  distribusi: {
    question: "Apakah nasabah punya riwayat penyakit yang bisa mempersulit seleksi kesehatan?",
    options: [
      { label: "Tidak", subtext: "Full Underwriting", next: { result: { code: "MIFIP" } } },
      {
        label: "Ya",
        subtext: "Guaranteed Issued",
        next: {
          result: {
            code: "MDWA_C",
            alt: [{ code: "MDWA_ANUITAS" }, { code: "MIPRECIOUS" }],
          },
        },
      },
    ],
  },
};

export const WIZARD_DISCLAIMER =
  "Sesuai panduan internal pemilihan produk. Verifikasi usia masuk, premi minimum, dan ketentuan terkini pada RIPLAY resmi, lalu buatkan ilustrasi untuk nasabah.";
