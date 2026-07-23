"use client";

import { isSuperAdminEmail } from "./admins";
import { hashPassword, verifyPassword, isHashed } from "./crypto";

/**
 * LAPISAN DATA SEMENTARA (localStorage)
 * ---------------------------------------------------------------
 * Semua fungsi baca/tulis data website ini melewati file ini.
 * Saat ini data disimpan di localStorage browser sebagai data
 * sementara, supaya semua fitur UI bisa langsung dicoba.
 *
 * Sinkronisasi ke Google Sheets & Google Drive (Tahap 2) sudah mulai
 * disiapkan di lib/google/ dan app/api/ — lihat README.md bagian
 * "Menyambungkan ke Google Sheets & Google Drive".
 * ---------------------------------------------------------------
 */

const KEYS = {
  members: "mp_members",
  products: "mp_products",
  activities: "mp_activities",
  session: "mp_session",
  promo: "mp_promo",
  tutorials: "mp_tutorials",
  recruit: "mp_recruit",
  analisaKebutuhan: "mp_analisa_kebutuhan",
  komisiKompensasi: "mp_komisi_kompensasi",
  afterSalesClaim: "mp_after_sales_claim",
  contacts: "mp_contacts",
};

// Kategori database Calon Nasabah / Calon Agen (dipakai di form "Tambah
// Kontak Baru" pada halaman Aktivitas).
const CONTACT_CATEGORIES = ["Calon Agen", "Calon Nasabah", "Calon Agen / Nasabah"];

// Konfigurasi aktivitas: 2 jalur (dulu disebut "kategori"), tiap jalur
// punya jenis aktivitas dengan bukti & poin masing-masing. Poin baru
// "aktif" (masuk hitungan Valid Point) setelah divalidasi Admin lewat
// tombol "Valid". `contactCategories` menentukan kontak mana dari
// database yang boleh dipilih untuk jalur ini. `noteLabel`/`photoLabel`
// bisa di-override per jenis aktivitas (mis. Recruit punya label
// berbeda untuk field catatan & foto).
const ACTIVITY_CATEGORIES = [
  {
    key: "nasabah",
    label: "Jalur Penjualan",
    sublabel: "Calon Nasabah",
    contactCategories: ["Calon Nasabah", "Calon Agen / Nasabah"],
    types: [
      { key: "fact_finding", label: "Fact Finding", points: 3 },
      { key: "presentation", label: "Presentation", points: 5 },
      {
        key: "closing",
        label: "Closing",
        points: 10,
        hasSaleFields: true, // field tambahan: Produk yang dijual & Nominal Premi/Tahun
      },
    ],
  },
  {
    key: "agen",
    label: "Jalur Rekrutmen",
    sublabel: "Calon Agen",
    contactCategories: ["Calon Agen", "Calon Agen / Nasabah"],
    types: [
      { key: "fact_finding", label: "Fact Finding", points: 3 },
      { key: "presentation", label: "Presentation", points: 5 },
      {
        key: "recruit",
        label: "Recruit",
        points: 10,
        noteLabel: "Level Agen yang Direkrut",
        photoLabel: "Bukti Transfer AAJI",
      },
    ],
  },
];

const DEFAULT_NOTE_LABEL = "Hasil Pertemuan";
const DEFAULT_PHOTO_LABEL = "Foto Bukti Aktivitas";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca data:", key, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  if (!isBrowser()) return true;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Gagal menyimpan data:", key, err);
    return false;
  }
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Data awal (contoh) ----------

const SEED_MEMBERS = [
  {
    id: "mem_superadmin",
    name: "Syam Rakhmany",
    email: "syam.rakhmany@gmail.com",
    password: hashPasswordSafe("Dolar@13"),
    role: "admin",
    phone: "0812-0000-0001",
    joinedAt: "2024-01-10",
  },
  {
    id: "mem_1",
    name: "Siti Rahma",
    email: "siti.rahma@muliaputri.com",
    password: hashPasswordSafe("agen123"),
    role: "member",
    phone: "0812-3456-7890",
    joinedAt: "2024-03-02",
  },
  {
    id: "mem_2",
    name: "Budi Santoso",
    email: "budi.santoso@muliaputri.com",
    password: hashPasswordSafe("agen123"),
    role: "member",
    phone: "0813-2233-4455",
    joinedAt: "2024-05-18",
  },
];

// hashPassword butuh window.crypto.getRandomValues, aman dipanggil di sini
// karena file ini "use client" dan seed hanya benar-benar dieksekusi saat
// dipanggil dari browser (lihat seedIfEmpty / isBrowser guard di bawah).
function hashPasswordSafe(plain) {
  if (!isBrowser()) return plain;
  return hashPassword(plain);
}

const SEED_PRODUCTS = [
  {
    id: "prod_1",
    name: "Mulia Sehat Keluarga",
    category: "Non Unit Link",
    subCategory: "",
    materiTrainingManulife: null,
    materiTrainingMPA: null,
    tabelPremi: null,
    resume: [],
    tabelMedical: [],
    fileKetsusUrl: "",
    videoUrl: "",
  },
  {
    id: "prod_2",
    name: "Mulia Proteksi Jiwa",
    category: "Non Unit Link",
    subCategory: "",
    materiTrainingManulife: null,
    materiTrainingMPA: null,
    tabelPremi: null,
    resume: [],
    tabelMedical: [],
    fileKetsusUrl: "",
    videoUrl: "",
  },
  {
    id: "prod_3",
    name: "Mulia Dana Pendidikan",
    category: "Non Unit Link",
    subCategory: "",
    materiTrainingManulife: null,
    materiTrainingMPA: null,
    tabelPremi: null,
    resume: [],
    tabelMedical: [],
    fileKetsusUrl: "",
    videoUrl: "",
  },
  {
    id: "prod_4",
    name: "Mulia Hari Tua",
    category: "Non Unit Link",
    subCategory: "",
    materiTrainingManulife: null,
    materiTrainingMPA: null,
    tabelPremi: null,
    resume: [],
    tabelMedical: [],
    fileKetsusUrl: "",
    videoUrl: "",
  },
];

const SEED_RECRUIT = {
  description:
    "1. Daftar melalui Google Form. Instruksikan agen Anda untuk screenshot bahwa data telah terkirim. Link form pendaftaran: https://bit.ly/DATAMIRECRUIT\n\n" +
    "2. Calon agen melakukan pembayaran AAJI sebesar Rp 227.000 ke rekening virtual account Danamon yang telah dikirimkan Manulife melalui email no-reply-license kepada perekrut dan calon agen.\n\n" +
    "3. Bukti bayar dikirimkan juga ke Admin MPA: Annisa.\n\n" +
    "4. Calon Agen WAJIB mengikuti Sales Essential training 1 hari yang diadakan oleh Manulife Indonesia melalui Zoom. Jadwal yang tersedia: Selasa / Kamis / Sabtu. Camera selalu on, berpakaian rapi, dan nama sesuai KTP.\n\n" +
    "5. Setelah mengikuti training, calon agen mengikuti Ujian AAJI. Tutorial ujian AAJI ada pada bot ini di halaman paling depan, Menu AAJI & AASI.\n\n" +
    "6. Setelah ujian, agen resmi menjadi bagian dari MPA dan mengikuti semua aktivitas MPA.\n\n" +
    "7. Langkah terakhir: komunikasikan dengan Admin MPA (Annisa) melalui link berikut: https://wa.me/6285324444953",
  files: [
    {
      url: "/materi-bos-2025.pdf",
      downloadUrl: "/materi-bos-2025.pdf",
      previewUrl: null,
      mimeType: "application/pdf",
      name: "Materi_BOS_2025.pdf",
      hostedOnDrive: false,
    },
  ],
};

function seedIfEmpty() {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(KEYS.members) === null) {
    writeJSON(KEYS.members, SEED_MEMBERS);
  }
  if (window.localStorage.getItem(KEYS.products) === null) {
    writeJSON(KEYS.products, SEED_PRODUCTS);
  }
  if (window.localStorage.getItem(KEYS.activities) === null) {
    writeJSON(KEYS.activities, []);
  }
  if (window.localStorage.getItem(KEYS.promo) === null) {
    writeJSON(KEYS.promo, []);
  }
  if (window.localStorage.getItem(KEYS.tutorials) === null) {
    writeJSON(KEYS.tutorials, []);
  }
  if (window.localStorage.getItem(KEYS.recruit) === null) {
    writeJSON(KEYS.recruit, SEED_RECRUIT);
  }
  if (window.localStorage.getItem(KEYS.analisaKebutuhan) === null) {
    writeJSON(KEYS.analisaKebutuhan, null);
  }
  if (window.localStorage.getItem(KEYS.komisiKompensasi) === null) {
    writeJSON(KEYS.komisiKompensasi, null);
  }
  if (window.localStorage.getItem(KEYS.afterSalesClaim) === null) {
    writeJSON(KEYS.afterSalesClaim, []);
  }
  if (window.localStorage.getItem(KEYS.contacts) === null) {
    writeJSON(KEYS.contacts, []);
  }
}

// ---------- Role & permission helpers ----------

/** Role efektif seorang member: Super Admin selalu dianggap admin. */
export function getEffectiveRole(member) {
  if (!member) return "member";
  if (isSuperAdminEmail(member.email)) return "admin";
  return member.role === "admin" ? "admin" : "member";
}

/**
 * Daftar member yang boleh dilihat oleh sesi tertentu.
 * Super Admin disembunyikan dari daftar member/admin lain.
 */
export function getVisibleMembers(sessionEmail) {
  const members = getMembers();
  if (isSuperAdminEmail(sessionEmail)) return members;
  return members.filter((m) => !isSuperAdminEmail(m.email));
}

/** Apakah sesi tertentu boleh menghapus member target. */
export function canDeleteMember(sessionEmail, targetMember) {
  if (!targetMember) return false;
  if (isSuperAdminEmail(targetMember.email)) return false; // Super Admin tidak bisa dihapus siapa pun
  const targetRole = getEffectiveRole(targetMember);
  if (targetRole === "admin") return isSuperAdminEmail(sessionEmail);
  return true;
}

/** Daftar member yang menjadikan `leaderId` sebagai Direct Leader mereka. */
export function getDirectReports(leaderId) {
  if (!leaderId) return [];
  return getMembers().filter((m) => m.directLeaderId === leaderId);
}

/**
 * Apakah `session` (member yang sedang login) boleh melihat aktivitas
 * milik `targetMemberId`. Aturan:
 *  - Admin (level Admin, siapa pun) selalu boleh — sudah dijamin lewat
 *    halaman /dashboard/admin/* yang memang admin-only.
 *  - Member itu sendiri selalu boleh melihat aktivitasnya sendiri.
 *  - Direct Leader dari member tersebut boleh melihat.
 *  - Member lain (bukan diri sendiri, bukan Direct Leader) tidak boleh.
 */
export function canViewActivitiesOf(session, targetMemberId) {
  if (!session) return false;
  if (session.role === "admin") return true;
  if (session.memberId === targetMemberId) return true;
  const target = getMembers().find((m) => m.id === targetMemberId);
  return Boolean(target && target.directLeaderId === session.memberId);
}

// ---------- Members ----------

export function getMembers() {
  seedIfEmpty();
  return readJSON(KEYS.members, []);
}

export function saveMembers(members) {
  const ok = writeJSON(KEYS.members, members);
  pushMembersToSheets(members);
  return ok;
}

export function addMember(member) {
  const members = getMembers();
  const password = member.password ? hashPassword(member.password) : hashPassword(Math.random().toString(36).slice(2));
  const next = [
    ...members,
    {
      id: uid("mem"),
      joinedAt: new Date().toISOString().slice(0, 10),
      role: "member",
      ...member,
      password,
    },
  ];
  const ok = saveMembers(next);
  if (!ok) {
    throw new Error("Member gagal disimpan: penyimpanan browser penuh.");
  }
  return next;
}

export function updateMember(id, updates) {
  const patched = { ...updates };
  // Hanya hash ulang password kalau field-nya diisi (bukan string kosong)
  // dan belum berbentuk hash — supaya "biarkan password lama" tetap aman.
  if (patched.password) {
    if (!isHashed(patched.password)) {
      patched.password = hashPassword(patched.password);
    }
  } else {
    delete patched.password;
  }
  const members = getMembers().map((m) => (m.id === id ? { ...m, ...patched } : m));
  saveMembers(members);
  return members;
}

export function deleteMember(id, requesterEmail) {
  const members = getMembers();
  const target = members.find((m) => m.id === id);
  if (target && requesterEmail !== undefined && !canDeleteMember(requesterEmail, target)) {
    console.warn("Penghapusan member ditolak oleh aturan permission.");
    return members;
  }
  const next = members.filter((m) => m.id !== id);
  saveMembers(next);
  return next;
}

export function findMemberByEmail(email) {
  if (!email) return null;
  const target = email.trim().toLowerCase();
  return getMembers().find((m) => m.email.trim().toLowerCase() === target) || null;
}

// ---------- Products ----------

export function getProducts() {
  seedIfEmpty();
  return readJSON(KEYS.products, []);
}

export function saveProducts(products) {
  const ok = writeJSON(KEYS.products, products);
  pushProductsToSheets(products);
  return ok;
}

export function addProduct(product) {
  const products = getProducts();
  const next = [...products, { id: uid("prod"), ...product }];
  saveProducts(next);
  return next;
}

export function updateProduct(id, updates) {
  const products = getProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveProducts(products);
  return products;
}

export function deleteProduct(id) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
  return products;
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

// ---------- Activities ----------

export function getActivityCategories() {
  return ACTIVITY_CATEGORIES;
}

/**
 * Mencari konfigurasi (label, poin, dst) untuk satu jenis aktivitas.
 * `noteLabel`/`photoLabel` selalu terisi (pakai default kalau jenis
 * aktivitas ini tidak meng-override-nya) supaya komponen halaman tidak
 * perlu tahu soal fallback-nya sendiri.
 */
export function getActivityTypeConfig(categoryKey, typeKey) {
  const cat = ACTIVITY_CATEGORIES.find((c) => c.key === categoryKey);
  if (!cat) return null;
  const type = cat.types.find((t) => t.key === typeKey);
  if (!type) return null;
  return {
    ...type,
    noteLabel: type.noteLabel || DEFAULT_NOTE_LABEL,
    photoLabel: type.photoLabel || DEFAULT_PHOTO_LABEL,
  };
}

export function getContactCategories() {
  return CONTACT_CATEGORIES;
}

// ---------- Database Calon Nasabah / Calon Agen ----------

function getAllContacts() {
  seedIfEmpty();
  return readJSON(KEYS.contacts, []);
}

async function saveContacts(list) {
  const ok = writeJSON(KEYS.contacts, list);
  if (!ok) return ok;
  await pushContactsToSheets(list);
  return ok;
}

export function getContactsByMember(memberId) {
  return getAllContacts().filter((c) => c.memberId === memberId);
}

/** Khusus Admin: melihat seluruh database Calon Nasabah/Calon Agen dari semua member sekaligus. */
export function getAllContactsForAdmin() {
  return getAllContacts();
}

export function getContactById(id) {
  return getAllContacts().find((c) => c.id === id) || null;
}

/**
 * Menambahkan kontak baru ke database Calon Nasabah/Calon Agen milik
 * member yang bersangkutan. Mengembalikan kontak yang baru dibuat
 * (dipakai untuk langsung memilihnya di form Catat Aktivitas).
 */
export async function addContact(contact) {
  const list = getAllContacts();
  const newContact = { id: uid("contact"), createdAt: new Date().toISOString(), ...contact };
  const next = [newContact, ...list];
  const ok = await saveContacts(next);
  if (!ok) throw new Error("Kontak gagal disimpan: penyimpanan browser penuh.");
  return newContact;
}

/** Mengubah data kontak yang sudah ada (Nama, Profesi, Kategori). */
export async function updateContact(id, updates) {
  const next = getAllContacts().map((c) => (c.id === id ? { ...c, ...updates } : c));
  const ok = await saveContacts(next);
  if (!ok) throw new Error("Kontak gagal disimpan: penyimpanan browser penuh.");
  return next.find((c) => c.id === id);
}

export async function deleteContact(id) {
  const next = getAllContacts().filter((c) => c.id !== id);
  await saveContacts(next);
  return next;
}

export function getActivities() {
  seedIfEmpty();
  return readJSON(KEYS.activities, []);
}

export function saveActivities(activities) {
  const ok = writeJSON(KEYS.activities, activities);
  pushActivitiesToSheets(activities);
  return ok;
}

/**
 * activity: { memberId, memberName, category, type, points, photo,
 *             contactId, contactName, contactProfession, productSold,
 *             premiumNominal, note, date }
 * `validated` selalu dimulai dari false — poin baru terhitung sebagai
 * Valid Point setelah Admin menekan tombol "Valid".
 */
export function addActivity(activity) {
  const activities = getActivities();
  const next = [
    {
      id: uid("act"),
      createdAt: new Date().toISOString(),
      contactId: "",
      contactName: "",
      contactProfession: "",
      productSold: "",
      premiumNominal: "",
      note: "",
      photo: "",
      validated: false,
      validatedAt: null,
      validatedBy: null,
      ...activity,
    },
    ...activities,
  ];
  const ok = saveActivities(next);
  if (!ok) {
    throw new Error(
      "Aktivitas gagal disimpan: penyimpanan browser penuh. Ini biasanya terjadi kalau foto belum berhasil diunggah ke Google Drive (masih tersimpan sebagai data lokal berukuran besar). Coba hapus beberapa aktivitas lama dengan foto, atau pastikan Google Drive sudah tersambung dengan benar."
    );
  }
  return next;
}

export function deleteActivity(id) {
  const activities = getActivities().filter((a) => a.id !== id);
  saveActivities(activities);
  return activities;
}

/** Mengubah aktivitas yang sudah ada (dipakai fitur Edit Aktivitas). */
export function updateActivity(id, updates) {
  const activities = getActivities().map((a) => (a.id === id ? { ...a, ...updates } : a));
  const ok = saveActivities(activities);
  if (!ok) {
    throw new Error("Perubahan gagal disimpan: penyimpanan browser penuh.");
  }
  return activities;
}

/** Admin menekan tombol "Valid" — poin aktivitas ini mulai terhitung. */
export function validateActivity(id, adminName) {
  return updateActivity(id, {
    validated: true,
    validatedAt: new Date().toISOString(),
    validatedBy: adminName || "Admin",
  });
}

/** Admin membatalkan validasi (kalau salah tekan). */
export function unvalidateActivity(id) {
  return updateActivity(id, { validated: false, validatedAt: null, validatedBy: null });
}

/** Aktivitas hanya boleh diedit pada hari yang sama saat ia dicatat. */
export function isActivityEditableToday(activity) {
  if (!activity?.createdAt) return false;
  const created = new Date(activity.createdAt);
  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  );
}

export function getActivitiesByMember(memberId) {
  return getActivities().filter((a) => a.memberId === memberId);
}

/**
 * Ringkasan poin satu member: Valid Point (sudah divalidasi Admin) dan
 * Unconfirmed Point (belum divalidasi), plus jumlah aktivitas per jenis.
 */
export function getMemberPointsSummary(memberId) {
  const activities = getActivitiesByMember(memberId);
  let validPoints = 0;
  let unconfirmedPoints = 0;
  const counts = {};
  activities.forEach((a) => {
    const pts = Number(a.points) || 0;
    if (a.validated) validPoints += pts;
    else unconfirmedPoints += pts;
    const key = `${a.category}:${a.type}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return { validPoints, unconfirmedPoints, counts };
}

/** Sama seperti getMemberPointsSummary, tapi dihitung dari daftar aktivitas manapun (dipakai untuk ringkasan admin dengan filter). */
export function summarizePoints(activities) {
  let validPoints = 0;
  let unconfirmedPoints = 0;
  activities.forEach((a) => {
    const pts = Number(a.points) || 0;
    if (a.validated) validPoints += pts;
    else unconfirmedPoints += pts;
  });
  return { validPoints, unconfirmedPoints };
}

// ---------- Promo ----------

export function getPromoList() {
  seedIfEmpty();
  return readJSON(KEYS.promo, []);
}

export function savePromoList(promo) {
  const ok = writeJSON(KEYS.promo, promo);
  pushPromoToSheets(promo);
  return ok;
}

export function addPromo(promo) {
  const list = getPromoList();
  const next = [{ id: uid("promo"), createdAt: new Date().toISOString(), files: [], ...promo }, ...list];
  const ok = savePromoList(next);
  if (!ok) throw new Error("Promo gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export function updatePromo(id, updates) {
  const next = getPromoList().map((p) => (p.id === id ? { ...p, ...updates } : p));
  const ok = savePromoList(next);
  if (!ok) throw new Error("Promo gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export function deletePromo(id) {
  const next = getPromoList().filter((p) => p.id !== id);
  savePromoList(next);
  return next;
}

// ---------- Tutorial Digital ----------

export function getTutorials() {
  seedIfEmpty();
  return readJSON(KEYS.tutorials, []);
}

export function saveTutorials(tutorials) {
  const ok = writeJSON(KEYS.tutorials, tutorials);
  pushTutorialsToSheets(tutorials);
  return ok;
}

export function addTutorial(tutorial) {
  const list = getTutorials();
  const next = [{ id: uid("tut"), createdAt: new Date().toISOString(), ...tutorial }, ...list];
  const ok = saveTutorials(next);
  if (!ok) throw new Error("Tutorial gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export function updateTutorial(id, updates) {
  const next = getTutorials().map((t) => (t.id === id ? { ...t, ...updates } : t));
  const ok = saveTutorials(next);
  if (!ok) throw new Error("Tutorial gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export function deleteTutorial(id) {
  const next = getTutorials().filter((t) => t.id !== id);
  saveTutorials(next);
  return next;
}

// ---------- Recruit (halaman tunggal) ----------

export function getRecruitInfo() {
  seedIfEmpty();
  return readJSON(KEYS.recruit, null);
}

export function saveRecruitInfo(data) {
  const ok = writeJSON(KEYS.recruit, data);
  pushRecruitToSheets(data);
  if (!ok) throw new Error("Data Recruit gagal disimpan: penyimpanan browser penuh.");
  return data;
}

// ---------- Analisa Kebutuhan Asuransi (halaman tunggal) ----------

export function getAnalisaKebutuhanInfo() {
  seedIfEmpty();
  return readJSON(KEYS.analisaKebutuhan, null);
}

export function saveAnalisaKebutuhanInfo(data) {
  const ok = writeJSON(KEYS.analisaKebutuhan, data);
  pushAnalisaKebutuhanToSheets(data);
  if (!ok) throw new Error("Data Analisa Kebutuhan Asuransi gagal disimpan: penyimpanan browser penuh.");
  return data;
}

// ---------- Komisi & Kompensasi (halaman tunggal, multi-file) ----------

export function getKomisiKompensasiInfo() {
  seedIfEmpty();
  return readJSON(KEYS.komisiKompensasi, null);
}

export async function saveKomisiKompensasiInfo(data) {
  const ok = writeJSON(KEYS.komisiKompensasi, data);
  if (!ok) throw new Error("Data Komisi & Kompensasi gagal disimpan: penyimpanan browser penuh.");
  await pushKomisiKompensasiToSheets(data);
  return data;
}

// ---------- After Sales & Claim ----------
// Daftar entri — tiap entri WAJIB punya kategori ("After Sales" atau
// "Claim", dipilih lewat radio button di form) + lampiran (banyak file
// PDF/foto). Tampilan (admin maupun member) mengelompokkan entri-entri
// ini berdasarkan kategorinya jadi 2 bagian terpisah.

export function getAfterSalesClaimList() {
  seedIfEmpty();
  return readJSON(KEYS.afterSalesClaim, []);
}

export async function saveAfterSalesClaimList(list) {
  const ok = writeJSON(KEYS.afterSalesClaim, list);
  await pushAfterSalesClaimToSheets(list);
  return ok;
}

export async function addAfterSalesClaimEntry(entry) {
  const list = getAfterSalesClaimList();
  const next = [{ id: uid("asc"), createdAt: new Date().toISOString(), files: [], ...entry }, ...list];
  const ok = await saveAfterSalesClaimList(next);
  if (!ok) throw new Error("Data After Sales & Claim gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export async function updateAfterSalesClaimEntry(id, updates) {
  const next = getAfterSalesClaimList().map((e) => (e.id === id ? { ...e, ...updates } : e));
  const ok = await saveAfterSalesClaimList(next);
  if (!ok) throw new Error("Data After Sales & Claim gagal disimpan: penyimpanan browser penuh.");
  return next;
}

export async function deleteAfterSalesClaimEntry(id) {
  const next = getAfterSalesClaimList().filter((e) => e.id !== id);
  await saveAfterSalesClaimList(next);
  return next;
}

// ---------- Session / Auth ----------

export function login(email, password) {
  const member = findMemberByEmail(email);
  if (!member) return { ok: false, error: "Email tidak terdaftar." };

  const passwordOk = isHashed(member.password)
    ? verifyPassword(password, member.password)
    : password === member.password; // fallback untuk data lama yang belum ter-hash

  if (!passwordOk) return { ok: false, error: "Password salah." };

  // Migrasi diam-diam: kalau password lama masih plaintext, hash sekarang.
  if (!isHashed(member.password)) {
    updateMember(member.id, { password });
  }

  const role = getEffectiveRole(member);
  const session = { memberId: member.id, email: member.email, name: member.name, role };
  writeJSON(KEYS.session, session);
  return { ok: true, session };
}

export function logout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.session);
}

export function getSession() {
  return readJSON(KEYS.session, null);
}

// ---------- Google Sheets & Drive sync (Tahap 2) ----------
//
// Pola yang dipakai: localStorage tetap jadi sumber data yang dibaca
// halaman-halaman (cepat, sinkron, tetap jalan walau offline / belum
// dikonfigurasi). Di atas itu:
//  - setiap kali saveMembers/saveProducts/saveActivities dipanggil, data
//    juga didorong ke Google Sheets di background (fire-and-forget).
//  - saat aplikasi pertama dibuka, syncAllFromSheets() dipanggil sekali
//    (lihat app/providers.js) untuk menarik data terbaru dari Sheets ke
//    localStorage sebelum halaman mana pun membacanya.
// Kalau Google Sheets belum dikonfigurasi, semua ini gagal secara diam-diam
// dan aplikasi tetap berjalan normal pakai localStorage saja.

// Google Sheets menolak isi sel yang lebih dari ~50.000 karakter. Foto yang
// belum berhasil diunggah ke Drive masih berupa data URL base64 yang bisa
// jauh lebih besar dari itu — kalau dipaksa dikirim, seluruh baris (bahkan
// seluruh request) bisa gagal tersimpan tanpa pesan error yang jelas.
const MAX_SHEET_CELL_LENGTH = 45000;

function activityToSheetRow(a) {
  const { photo, ...rest } = a;
  let photoUrl = photo || "";
  if (photoUrl.length > MAX_SHEET_CELL_LENGTH) {
    // Foto belum ter-upload ke Google Drive (masih data lokal base64) —
    // jangan dikirim ke Sheets, cukup tandai supaya tidak memutus sinkronisasi.
    photoUrl = "(foto belum ter-upload ke Google Drive)";
  }
  return { ...rest, photoUrl, validated: a.validated ? "TRUE" : "FALSE" };
}

function sheetRowToActivity(row) {
  const { photoUrl, ...rest } = row;
  return {
    ...rest,
    photo: photoUrl || "",
    points: Number(row.points) || 0,
    validated: row.validated === true || row.validated === "TRUE" || row.validated === "true",
  };
}

// Produk sekarang punya 3 field lampiran satu-file terpisah (Materi
// Training Versi Manulife Pusat, Materi Training Versi MPA, Tabel
// Premi) — masing-masing disimpan sebagai teks JSON di kolomnya sendiri
// di Sheets, dengan guard ukuran yang sama seperti field lampiran lain
// (kalau belum ter-upload ke Drive, masih base64 raksasa, jangan
// dikirim supaya tidak memutus sinkronisasi). Field `resume` dan
// `tabelMedical` beda sendiri — bisa lebih dari satu file, jadi
// disimpan sebagai array (sama seperti Promo/Recruit).
const PRODUCT_FILE_FIELDS = ["materiTrainingManulife", "materiTrainingMPA", "tabelPremi"];
const PRODUCT_MULTI_FILE_FIELDS = ["resume", "tabelMedical"];

function productToSheetRow(p) {
  const row = { ...p };
  PRODUCT_FILE_FIELDS.forEach((field) => {
    const file = row[field];
    if (!file) {
      row[field] = "";
      return;
    }
    const json = JSON.stringify(file);
    row[field] = json.length > MAX_SHEET_CELL_LENGTH ? "" : json;
  });
  PRODUCT_MULTI_FILE_FIELDS.forEach((field) => {
    row[field] = filesFieldToSheetValue(row[field]);
  });
  return row;
}

function sheetRowToProduct(row) {
  const product = { ...row };
  PRODUCT_FILE_FIELDS.forEach((field) => {
    const raw = product[field];
    if (!raw) {
      product[field] = null;
      return;
    }
    try {
      product[field] = JSON.parse(raw);
    } catch {
      product[field] = null;
    }
  });
  PRODUCT_MULTI_FILE_FIELDS.forEach((field) => {
    product[field] = sheetValueToFilesField(row[field]);
  });
  return product;
}

// Dipakai untuk field `files` (array lampiran) pada Promo dan
// Recruit. Kalau ada file yang belum ter-upload ke Drive (masih base64
// lokal, bisa sangat besar), file itu di-drop dari versi yang dikirim ke
// Sheets supaya tidak memutus sinkronisasi — file itu tetap ada di
// localStorage, cuma tidak ikut ke Sheets sampai berhasil ter-upload ke
// Drive.
function filesFieldToSheetValue(files) {
  const safe = (files || []).filter((f) => f && f.url && f.url.length < 2000);
  const json = JSON.stringify(safe);
  return json.length > MAX_SHEET_CELL_LENGTH ? "[]" : json;
}

function sheetValueToFilesField(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function promoToSheetRow(p) {
  return { ...p, files: filesFieldToSheetValue(p.files) };
}

function sheetRowToPromo(row) {
  return { ...row, files: sheetValueToFilesField(row.files) };
}

function recruitToSheetRow(c) {
  if (!c) return { id: "main", description: "", files: "[]" };
  return { ...c, id: "main", files: filesFieldToSheetValue(c.files) };
}

function sheetRowToRecruit(row) {
  if (!row) return null;
  return { ...row, files: sheetValueToFilesField(row.files) };
}

// Analisa Kebutuhan Asuransi punya 2 field lampiran satu-file (Materi,
// Flier) — dipetakan sama seperti field lampiran produk (JSON per
// kolom, dengan guard ukuran).
function singleFileToSheetValue(file) {
  if (!file) return "";
  const json = JSON.stringify(file);
  return json.length > MAX_SHEET_CELL_LENGTH ? "" : json;
}

function sheetValueToSingleFile(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function analisaKebutuhanToSheetRow(c) {
  if (!c) return { id: "main", description: "", materi: "", flier: "", videoUrl: "" };
  return {
    ...c,
    id: "main",
    materi: singleFileToSheetValue(c.materi),
    flier: singleFileToSheetValue(c.flier),
  };
}

function sheetRowToAnalisaKebutuhan(row) {
  if (!row) return null;
  return { ...row, materi: sheetValueToSingleFile(row.materi), flier: sheetValueToSingleFile(row.flier) };
}

function komisiKompensasiToSheetRow(c) {
  if (!c) return { id: "main", description: "", files: "[]" };
  return { ...c, id: "main", files: filesFieldToSheetValue(c.files) };
}

function sheetRowToKomisiKompensasi(row) {
  if (!row) return null;
  return { ...row, files: sheetValueToFilesField(row.files) };
}

function afterSalesClaimEntryToSheetRow(e) {
  return { ...e, files: filesFieldToSheetValue(e.files) };
}

function sheetRowToAfterSalesClaimEntry(row) {
  return { ...row, files: sheetValueToFilesField(row.files) };
}

// Menyimpan promise dari setiap pengiriman data ke Google Sheets yang
// sedang berjalan ("in-flight"). Ini dipakai supaya syncAllFromSheets()
// (yang menarik data DARI Sheets) menunggu dulu semua pengiriman yang
// sedang berjalan selesai — kalau tidak, ada race condition: halaman
// di-refresh tepat setelah Simpan, sinkronisasi menarik data LAMA dari
// Sheets (karena data barunya belum sempat "landing" di sana) dan
// menimpa data yang baru saja disimpan di penyimpanan lokal, sehingga
// terlihat seperti data "hilang".
const pendingSheetPushes = new Set();

async function pushToSheets(endpoint, body, label) {
  if (!isBrowser()) return;
  const task = (async () => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn(`Gagal sinkron ${label} ke Google Sheets (${res.status}):`, data.error || data);
      }
    } catch (err) {
      console.warn(`Gagal sinkron ${label} ke Google Sheets:`, err);
    }
  })();
  pendingSheetPushes.add(task);
  try {
    await task;
  } finally {
    pendingSheetPushes.delete(task);
  }
}

function pushMembersToSheets(members) {
  return pushToSheets("/api/members", { members }, "Members");
}

function pushProductsToSheets(products) {
  return pushToSheets("/api/products", { products: products.map(productToSheetRow) }, "Products");
}

function pushActivitiesToSheets(activities) {
  return pushToSheets("/api/activities", { activities: activities.map(activityToSheetRow) }, "Activities");
}

function pushPromoToSheets(promo) {
  return pushToSheets("/api/promo", { promo: promo.map(promoToSheetRow) }, "Promo");
}

function pushContactsToSheets(contacts) {
  return pushToSheets("/api/contacts", { contacts }, "Contacts");
}

function pushTutorialsToSheets(tutorials) {
  return pushToSheets("/api/tutorials", { tutorials }, "Tutorials");
}

function pushRecruitToSheets(data) {
  return pushToSheets("/api/recruit", { recruit: recruitToSheetRow(data) }, "Recruit");
}

function pushAnalisaKebutuhanToSheets(data) {
  return pushToSheets(
    "/api/analisa-kebutuhan",
    { analisaKebutuhan: analisaKebutuhanToSheetRow(data) },
    "AnalisaKebutuhan"
  );
}

function pushKomisiKompensasiToSheets(data) {
  return pushToSheets(
    "/api/komisi-kompensasi",
    { komisiKompensasi: komisiKompensasiToSheetRow(data) },
    "KomisiKompensasi"
  );
}

function pushAfterSalesClaimToSheets(list) {
  return pushToSheets(
    "/api/after-sales-claim",
    { afterSalesClaim: list.map(afterSalesClaimEntryToSheetRow) },
    "AfterSalesClaim"
  );
}

/**
 * Dipanggil sekali saat aplikasi dibuka (lihat app/providers.js).
 * Kalau Google Sheets sudah dikonfigurasi, Sheets SELALU jadi sumber
 * kebenaran — localStorage ditimpa dengan apa pun isinya di Sheets,
 * termasuk kalau kosong (misalnya setelah admin sengaja menghapus semua
 * data). Ini penting supaya data yang sudah dihapus tidak "muncul lagi"
 * gara-gara localStorage lama di suatu browser mendorong balik data
 * basi ke Sheets.
 * Kalau belum dikonfigurasi / gagal -> diam-diam lanjut pakai localStorage.
 */
export async function syncAllFromSheets() {
  if (!isBrowser()) return { configured: false };
  try {
    // Kalau ada penyimpanan yang baru saja dipicu (mis. Admin klik
    // Simpan lalu langsung refresh halaman) dan belum selesai terkirim
    // ke Sheets, tunggu dulu semuanya selesai sebelum menarik data dari
    // Sheets — supaya tidak menimpa data baru dengan data lama.
    if (pendingSheetPushes.size > 0) {
      await Promise.allSettled([...pendingSheetPushes]);
    }

    const [mRes, pRes, aRes, promoRes, tutRes, recRes, akRes, kkRes, ascRes, ctRes] = await Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
      fetch("/api/promo").then((r) => r.json()),
      fetch("/api/tutorials").then((r) => r.json()),
      fetch("/api/recruit").then((r) => r.json()),
      fetch("/api/analisa-kebutuhan").then((r) => r.json()),
      fetch("/api/komisi-kompensasi").then((r) => r.json()),
      fetch("/api/after-sales-claim").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
    ]);

    let configured = false;

    if (mRes.configured) {
      configured = true;
      writeJSON(KEYS.members, Array.isArray(mRes.members) ? mRes.members : []);
    }

    if (pRes.configured) {
      configured = true;
      const products = Array.isArray(pRes.products) ? pRes.products : [];
      writeJSON(KEYS.products, products.map(sheetRowToProduct));
    }

    if (aRes.configured) {
      configured = true;
      const activities = Array.isArray(aRes.activities) ? aRes.activities : [];
      writeJSON(KEYS.activities, activities.map(sheetRowToActivity));
    }

    if (promoRes.configured) {
      configured = true;
      const promo = Array.isArray(promoRes.promo) ? promoRes.promo : [];
      writeJSON(KEYS.promo, promo.map(sheetRowToPromo));
    }

    if (tutRes.configured) {
      configured = true;
      writeJSON(KEYS.tutorials, Array.isArray(tutRes.tutorials) ? tutRes.tutorials : []);
    }

    if (recRes.configured) {
      configured = true;
      writeJSON(KEYS.recruit, recRes.recruit ? sheetRowToRecruit(recRes.recruit) : null);
    }

    if (akRes.configured) {
      configured = true;
      writeJSON(
        KEYS.analisaKebutuhan,
        akRes.analisaKebutuhan ? sheetRowToAnalisaKebutuhan(akRes.analisaKebutuhan) : null
      );
    }

    if (kkRes.configured) {
      configured = true;
      writeJSON(
        KEYS.komisiKompensasi,
        kkRes.komisiKompensasi ? sheetRowToKomisiKompensasi(kkRes.komisiKompensasi) : null
      );
    }

    if (ascRes.configured) {
      configured = true;
      const afterSalesClaim = Array.isArray(ascRes.afterSalesClaim) ? ascRes.afterSalesClaim : [];
      writeJSON(KEYS.afterSalesClaim, afterSalesClaim.map(sheetRowToAfterSalesClaimEntry));
    }

    if (ctRes.configured) {
      configured = true;
      writeJSON(KEYS.contacts, Array.isArray(ctRes.contacts) ? ctRes.contacts : []);
    }

    return { configured };
  } catch (err) {
    console.warn("Sinkronisasi dari Google Sheets gagal / belum dikonfigurasi:", err);
    return { configured: false };
  }
}

/**
 * Menghapus SEMUA data aktivitas sekaligus (localStorage + Google Sheets).
 * Dipakai oleh tombol "Hapus Semua Aktivitas" di halaman admin.
 */
export function clearAllActivities() {
  return saveActivities([]);
}
