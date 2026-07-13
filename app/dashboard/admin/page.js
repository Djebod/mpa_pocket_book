"use client";

import Link from "next/link";

const ADMIN_SECTIONS = [
  { href: "/dashboard/admin/members", label: "Kelola Member", desc: "Tambah, ubah, hapus akun member & atur Direct Leader." },
  { href: "/dashboard/admin/products", label: "Kelola Produk", desc: "Kelola katalog produk: nama, kategori, deskripsi, lampiran." },
  { href: "/dashboard/admin/promo", label: "Kelola Promo & Kontes", desc: "Kelola daftar promo & kontes beserta lampirannya." },
  { href: "/dashboard/admin/recruit", label: "Kelola Recruit", desc: "Kelola panduan proses recruit agen baru." },
  { href: "/dashboard/admin/tutorials", label: "Kelola Tutorial", desc: "Kelola daftar tutorial digital & link Google Drive." },
];

export default function AdminMenuPage() {
  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Menu Administratif</h1>
      <p className="text-sm text-ink/60 mb-8">Pilih menu yang ingin dikelola.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group bg-card border border-ink/10 rounded-lg px-5 py-5 shadow-stamp hover:border-brass transition-colors perforated"
          >
            <h2 className="font-display text-xl text-ink mb-1.5 group-hover:italic">{section.label}</h2>
            <p className="text-sm text-charcoal/70">{section.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
