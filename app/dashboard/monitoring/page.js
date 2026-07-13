"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";

const BASE_SECTIONS = [
  { href: "/dashboard", label: "Ringkasan", desc: "Ringkasan jumlah aktivitas Anda per jenis + riwayat terbaru." },
  { href: "/dashboard/activities", label: "Aktivitas", desc: "Catat aktivitas baru & lihat riwayat aktivitas Anda." },
  { href: "/dashboard/team", label: "Tim Saya", desc: "Lihat aktivitas anggota tim yang menjadikan Anda Direct Leader." },
];

const ADMIN_SECTION = {
  href: "/dashboard/admin/activities",
  label: "Ringkasan Aktivitas",
  desc: "Data lengkap seluruh aktivitas member, filter, sort, dan export Excel.",
};

export default function MonitoringPage() {
  const { session } = useAuth();
  const sections = session?.role === "admin" ? [...BASE_SECTIONS, ADMIN_SECTION] : BASE_SECTIONS;

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Monitoring</h1>
      <p className="text-sm text-ink/60 mb-8">Pilih menu yang ingin dilihat.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((section) => (
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
