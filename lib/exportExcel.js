"use client";

import * as XLSX from "xlsx";
import * as store from "@/lib/store";

const CATEGORY_LABELS = { nasabah: "Jalur Penjualan", agen: "Jalur Rekrutmen" };

/**
 * Mengekspor daftar aktivitas ke file .xlsx dan otomatis mengunduhnya
 * di browser pengguna (tidak butuh server).
 */
export function exportActivitiesToExcel(activities, filename = "aktivitas-mulia-putri") {
  const rows = activities.map((a) => {
    const config = store.getActivityTypeConfig(a.category, a.type);
    return {
      Tanggal: a.date || "",
      Member: a.memberName || "",
      Jalur: CATEGORY_LABELS[a.category] || a.category || "",
      "Jenis Aktivitas": config?.label || a.type || "",
      Poin: a.points || 0,
      Status: a.validated ? "Valid" : "Menunggu Validasi",
      "Nama Kontak": a.contactName || "",
      "Profesi Kontak": a.contactProfession || "",
      "Produk yang Dijual": a.productSold || "",
      "Nominal Premi/Tahun": a.premiumNominal || "",
      [config?.noteLabel || "Catatan"]: a.note || "",
      "Ada Foto": a.photo ? "Ya" : "Tidak",
      "Divalidasi Oleh": a.validatedBy || "",
      "Dicatat Pada": a.createdAt ? new Date(a.createdAt).toLocaleString("id-ID") : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 12 }, // Tanggal
    { wch: 20 }, // Member
    { wch: 16 }, // Jalur
    { wch: 16 }, // Jenis Aktivitas
    { wch: 8 }, // Poin
    { wch: 16 }, // Status
    { wch: 22 }, // Nama Kontak
    { wch: 18 }, // Profesi Kontak
    { wch: 22 }, // Produk yang Dijual
    { wch: 18 }, // Nominal Premi/Tahun
    { wch: 40 }, // Catatan / Hasil Pertemuan / Level Agen
    { wch: 10 }, // Ada Foto
    { wch: 18 }, // Divalidasi Oleh
    { wch: 20 }, // Dicatat Pada
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Aktivitas");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
}

/** Mengekspor daftar member ke file .xlsx. */
export function exportMembersToExcel(members, filename = "member-mulia-putri") {
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]));
  const rows = members.map((m) => ({
    Nama: m.name || "",
    Email: m.email || "",
    "No. HP": m.phone || "",
    Role: m.role === "admin" ? "Admin" : "Member",
    "Direct Leader": nameById[m.directLeaderId] || "",
    "Bergabung Sejak": m.joinedAt || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 22 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
}
