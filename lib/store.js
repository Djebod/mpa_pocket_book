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
  commission: "mp_commission",
};

const ACTIVITY_TYPES = [
  "Visit Customer",
  "Recruit",
  "Role Play",
  "Join Visit",
  "Other",
];

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
    category: "Asuransi Kesehatan",
    summary:
      "Perlindungan biaya rawat inap dan rawat jalan untuk seluruh anggota keluarga, dengan pilihan kamar sesuai kebutuhan dan jaringan rumah sakit rekanan yang luas.",
    ilustrasi:
      "Contoh: Nasabah usia 30 tahun, premi bulanan mulai Rp 350.000, plafon rawat inap harian Rp 500.000, santunan rawat jalan Rp 100.000 per kunjungan (maks. 20 kunjungan/tahun). Simulasi lengkap tersedia di kalkulator ilustrasi internal — sesuaikan usia, plafon, dan masa bayar premi calon nasabah.",
    caraMenjual:
      "1. Gali kebutuhan calon nasabah: apakah sudah punya BPJS/asuransi kantor?\n2. Tunjukkan gap perlindungan dari asuransi yang sudah ada.\n3. Jelaskan manfaat rawat inap & rawat jalan dengan ilustrasi angka nyata.\n4. Tawarkan simulasi premi sesuai usia & pendapatan.\n5. Tutup dengan ajakan mengisi formulir aplikasi hari itu juga.",
    videoUrl: "",
  },
  {
    id: "prod_2",
    name: "Mulia Proteksi Jiwa",
    category: "Asuransi Jiwa",
    summary:
      "Santunan meninggal dunia untuk melindungi masa depan keluarga yang ditinggalkan, dengan pilihan masa perlindungan hingga 20 tahun dan manfaat tambahan kecelakaan.",
    ilustrasi:
      "Contoh: Uang pertanggungan Rp 500.000.000, usia masuk 35 tahun, masa asuransi 15 tahun, premi tahunan mulai Rp 4.200.000. Tersedia rider kecelakaan dan pembebasan premi.",
    caraMenjual:
      "1. Mulai dengan pertanyaan reflektif: 'Bagaimana kondisi keuangan keluarga jika terjadi risiko pada Bapak/Ibu?'\n2. Hitung kebutuhan uang pertanggungan bersama calon nasabah.\n3. Bandingkan dengan tabungan biasa untuk menunjukkan efisiensi proteksi.\n4. Sampaikan proses klaim yang sederhana.\n5. Ajukan penutupan dengan dua pilihan premi (tahunan/bulanan).",
    videoUrl: "",
  },
  {
    id: "prod_3",
    name: "Mulia Dana Pendidikan",
    category: "Asuransi Pendidikan",
    summary:
      "Persiapan dana pendidikan anak dari jenjang SD hingga perguruan tinggi, dengan pencairan bertahap sesuai jenjang dan perlindungan jiwa orang tua sebagai tertanggung.",
    ilustrasi:
      "Contoh: Anak usia 3 tahun, target dana kuliah Rp 200.000.000 di usia 18 tahun, premi bulanan mulai Rp 1.100.000 (tergantung usia & masa bayar orang tua sebagai pemegang polis).",
    caraMenjual:
      "1. Tanyakan usia anak dan rencana pendidikan orang tua.\n2. Tunjukkan proyeksi kenaikan biaya pendidikan tiap tahun.\n3. Jelaskan skema pencairan bertahap per jenjang sekolah.\n4. Tekankan manfaat bebas premi jika orang tua tertanggung meninggal dunia.\n5. Tutup dengan simulasi dana sesuai usia masuk anak.",
    videoUrl: "",
  },
  {
    id: "prod_4",
    name: "Mulia Hari Tua",
    category: "Dana Pensiun",
    summary:
      "Program dana pensiun dengan iuran rutin untuk memastikan penghasilan bulanan tetap tersedia setelah masa produktif berakhir.",
    ilustrasi:
      "Contoh: Usia masuk 30 tahun, target pensiun usia 55 tahun, iuran bulanan mulai Rp 500.000, estimasi dana terkumpul dan anuitas bulanan dapat dilihat pada tabel ilustrasi resmi produk.",
    caraMenjual:
      "1. Ajak calon nasabah membayangkan kebutuhan bulanan di masa pensiun.\n2. Jelaskan konsep bunga majemuk dan pentingnya mulai lebih awal.\n3. Tunjukkan simulasi dana terkumpul di berbagai usia mulai.\n4. Sampaikan fleksibilitas penarikan dan opsi anuitas.\n5. Tutup dengan rekomendasi iuran sesuai kemampuan nasabah.",
    videoUrl: "",
  },
];

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
  if (window.localStorage.getItem(KEYS.commission) === null) {
    writeJSON(KEYS.commission, null);
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

export function getActivityTypes() {
  return ACTIVITY_TYPES;
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
 * activity: { memberId, memberName, type, date, note, photo,
 *             customerName, customerPhone }
 */
export function addActivity(activity) {
  const activities = getActivities();
  const next = [
    {
      id: uid("act"),
      createdAt: new Date().toISOString(),
      customerName: "",
      customerPhone: "",
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

export function countActivitiesByType(memberId) {
  const activities = getActivitiesByMember(memberId);
  const counts = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t, 0]));
  activities.forEach((a) => {
    if (counts[a.type] === undefined) counts[a.type] = 0;
    counts[a.type] += 1;
  });
  return counts;
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

// ---------- Komisi Produk & Kompensasi (halaman tunggal) ----------

export function getCommissionInfo() {
  seedIfEmpty();
  return readJSON(KEYS.commission, null);
}

export function saveCommissionInfo(commission) {
  const ok = writeJSON(KEYS.commission, commission);
  pushCommissionToSheets(commission);
  if (!ok) throw new Error("Data Komisi gagal disimpan: penyimpanan browser penuh.");
  return commission;
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
  return { ...rest, photoUrl };
}

function sheetRowToActivity(row) {
  const { photoUrl, ...rest } = row;
  return { ...rest, photo: photoUrl || "" };
}

// Field lampiran (foto/PDF) pada produk disimpan sebagai objek
// { url, downloadUrl, mimeType, name } — di Sheets disimpan sebagai teks
// JSON di kolom terpisah (mis. summaryFile), dengan guard ukuran yang sama
// seperti foto aktivitas (kalau belum ter-upload ke Drive, masih base64
// raksasa, jangan dikirim ke Sheets supaya tidak memutus sinkronisasi).
const PRODUCT_FILE_FIELDS = ["summaryFile", "ilustrasiFile", "caraMenjualFile"];

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
  return product;
}

// Dipakai untuk field `files` (array lampiran) pada Promo & Commission.
// Kalau ada file yang belum ter-upload ke Drive (masih base64 lokal,
// bisa sangat besar), file itu di-drop dari versi yang dikirim ke Sheets
// supaya tidak memutus sinkronisasi — file itu tetap ada di localStorage,
// cuma tidak ikut ke Sheets sampai berhasil ter-upload ke Drive.
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

function commissionToSheetRow(c) {
  if (!c) return { id: "main", description: "", files: "[]" };
  return { ...c, id: "main", files: filesFieldToSheetValue(c.files) };
}

function sheetRowToCommission(row) {
  if (!row) return null;
  return { ...row, files: sheetValueToFilesField(row.files) };
}

async function pushToSheets(endpoint, body, label) {
  if (!isBrowser()) return;
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
}

function pushMembersToSheets(members) {
  pushToSheets("/api/members", { members }, "Members");
}

function pushProductsToSheets(products) {
  pushToSheets("/api/products", { products: products.map(productToSheetRow) }, "Products");
}

function pushActivitiesToSheets(activities) {
  pushToSheets("/api/activities", { activities: activities.map(activityToSheetRow) }, "Activities");
}

function pushPromoToSheets(promo) {
  pushToSheets("/api/promo", { promo: promo.map(promoToSheetRow) }, "Promo");
}

function pushTutorialsToSheets(tutorials) {
  pushToSheets("/api/tutorials", { tutorials }, "Tutorials");
}

function pushCommissionToSheets(commission) {
  pushToSheets("/api/commission", { commission: commissionToSheetRow(commission) }, "Commission");
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
    const [mRes, pRes, aRes, promoRes, tutRes, comRes] = await Promise.all([
      fetch("/api/members").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
      fetch("/api/promo").then((r) => r.json()),
      fetch("/api/tutorials").then((r) => r.json()),
      fetch("/api/commission").then((r) => r.json()),
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

    if (comRes.configured) {
      configured = true;
      writeJSON(KEYS.commission, comRes.commission ? sheetRowToCommission(comRes.commission) : null);
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
