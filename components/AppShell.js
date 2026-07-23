"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

const MONITORING_TAB = { href: "/dashboard/monitoring", label: "Aktivitas" };

const MEMBER_TABS = [
  { href: "/dashboard/kalkulator-aktivitas", label: "Kalkulator Aktivitas" },
  { href: "/dashboard/analisa-kebutuhan", label: "Analisa Kebutuhan Asuransi" },
  { href: "/dashboard/database-prospek", label: "Database Calon Prospek" },
  { href: "/dashboard/riwayat-prospek", label: "Riwayat Calon Prospek" },
  { href: "/dashboard/kalkulator-finansial", label: "Kalkulator Finansial" },
  { href: "/dashboard/rekomendasi", label: "Rekomendasi Produk" },
  { href: "/dashboard/komisi-kompensasi", label: "Komisi & Kompensasi" },
  { href: "/dashboard/products", label: "Produk" },
  { href: "/dashboard/promo", label: "Promo & Kontes" },
  { href: "/dashboard/recruit", label: "Recruit" },
  { href: "/dashboard/after-sales-claim", label: "After Sales & Claim" },
  { href: "/dashboard/tutorials", label: "Tutorial Digital" },
];

const ADMIN_TABS = [{ href: "/dashboard/admin", label: "Menu Administratif" }];

export default function AppShell({ children }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = session?.role === "admin";
  const memberTabsForAdmin = MEMBER_TABS.filter((t) => t.href !== "/dashboard/database-prospek");

  const tabs = [
    MONITORING_TAB,
    ...(isAdmin ? [...memberTabsForAdmin, ...ADMIN_TABS] : MEMBER_TABS),
  ];

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Binder tab navigation — sidebar tetap di desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 bg-ink text-paper">
        <div className="px-5 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mpa.png" alt="Logo Mulia Putri Agency" className="w-12 h-12 object-contain mb-2" />
          <p className="font-display italic text-brass-light text-lg leading-tight">Pocket Book</p>
          <p className="font-mono text-[11px] tracking-wide text-paper/60 mt-1">MULIA PUTRI AGENCY</p>
        </div>

        <nav className="flex flex-col flex-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`tab-notch px-5 py-3 text-sm font-semibold transition-colors border-l-4 ${
                  active ? "bg-paper text-ink border-l-brass" : "text-paper/75 hover:bg-ink-light border-l-transparent"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-5 py-5 border-t border-paper/15">
          <p className="text-xs text-paper/60 mb-1">Masuk sebagai</p>
          <p className="text-sm font-semibold truncate">{session?.name}</p>
          <p className="text-[11px] text-paper/50 uppercase tracking-wide mb-3">
            {session?.role === "admin" ? "Admin" : "Member"}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-brass-light hover:text-brass underline underline-offset-2"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile dengan tombol hamburger */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-ink text-paper shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mpa.png" alt="Logo Mulia Putri Agency" className="w-8 h-8 object-contain shrink-0" />
            <p className="font-display italic text-brass-light truncate">Pocket Book</p>
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            className="shrink-0 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md hover:bg-ink-light"
          >
            <span className="block w-5 h-0.5 bg-paper rounded-full" />
            <span className="block w-5 h-0.5 bg-paper rounded-full" />
            <span className="block w-5 h-0.5 bg-paper rounded-full" />
          </button>
        </header>

        {/* Drawer menu mobile */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-ink/60" onClick={() => setMenuOpen(false)} />
            <nav className="relative w-72 max-w-[85vw] bg-ink text-paper h-full flex flex-col shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-5 border-b border-paper/15">
                <div className="flex items-center gap-2 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-mpa.png" alt="" className="w-9 h-9 object-contain shrink-0" />
                  <div className="min-w-0">
                    <p className="font-display italic text-brass-light text-base leading-tight truncate">Pocket Book</p>
                    <p className="font-mono text-[10px] text-paper/60">MULIA PUTRI AGENCY</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup menu"
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-ink-light text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col py-2">
                {tabs.map((tab) => {
                  const active = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={handleNavClick}
                      className={`px-5 py-3.5 text-sm font-semibold border-l-4 ${
                        active
                          ? "bg-ink-light text-paper border-l-brass"
                          : "text-paper/80 border-l-transparent active:bg-ink-light"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto px-5 py-5 border-t border-paper/15">
                <p className="text-xs text-paper/60 mb-1">Masuk sebagai</p>
                <p className="text-sm font-semibold truncate">{session?.name}</p>
                <p className="text-[11px] text-paper/50 uppercase tracking-wide mb-3">
                  {session?.role === "admin" ? "Admin" : "Member"}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-brass-light hover:text-brass underline underline-offset-2"
                >
                  Keluar
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-10 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
