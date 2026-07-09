"use client";

import * as XLSX from "xlsx";

/**
 * Mengekspor daftar aktivitas ke file .xlsx dan otomatis mengunduhnya
 * di browser pengguna (tidak butuh server).
 */
export function exportActivitiesToExcel(activities, filename = "aktivitas-mulia-putri") {
  const rows = activities.map((a) => ({
    Tanggal: a.date || "",
    Member: a.memberName || "",
    "Jenis Aktivitas": a.type || "",
    "Nama Nasabah": a.customerName || "",
    "No. Telpon Nasabah": a.customerPhone || "",
    Catatan: a.note || "",
    "Ada Foto": a.photo ? "Ya" : "Tidak",
    "Dicatat Pada": a.createdAt ? new Date(a.createdAt).toLocaleString("id-ID") : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 12 }, // Tanggal
    { wch: 20 }, // Member
    { wch: 16 }, // Jenis Aktivitas
    { wch: 22 }, // Nama Nasabah
    { wch: 18 }, // No. Telpon
    { wch: 40 }, // Catatan
    { wch: 10 }, // Ada Foto
    { wch: 20 }, // Dicatat Pada
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Aktivitas");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
}

/** Mengekspor daftar member ke file .xlsx. */
export function exportMembersToExcel(members, filename = "member-mulia-putri") {
  const rows = members.map((m) => ({
    Nama: m.name || "",
    Email: m.email || "",
    "No. HP": m.phone || "",
    Role: m.role === "admin" ? "Admin" : "Member",
    "Bergabung Sejak": m.joinedAt || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
}
