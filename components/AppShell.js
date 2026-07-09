"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

const MEMBER_TABS = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/activities", label: "Aktivitas" },
  { href: "/dashboard/products", label: "Produk" },
];

const ADMIN_TABS = [
  { href: "/dashboard/admin/members", label: "Kelola Member" },
  { href: "/dashboard/admin/activities", label: "Ringkasan Aktivitas" },
  { href: "/dashboard/admin/products", label: "Kelola Produk" },
];

export default function AppShell({ children }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const tabs = session?.role === "admin" ? [...MEMBER_TABS, ...ADMIN_TABS] : MEMBER_TABS;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Binder tab navigation */}
      <aside className="md:w-60 shrink-0 bg-ink text-paper flex md:flex-col">
        <div className="px-5 py-6 hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mpa.png" alt="Logo Mulia Putri Agency" className="w-12 h-12 object-contain mb-2" />
          <p className="font-display italic text-brass-light text-lg leading-tight">
            Pocket Book
          </p>
          <p className="font-mono text-[11px] tracking-wide text-paper/60 mt-1">
            MULIA PUTRI AGENCY
          </p>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible flex-1 md:flex-none">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`tab-notch whitespace-nowrap md:whitespace-normal px-5 py-3 text-sm font-semibold transition-colors border-b md:border-b-0 md:border-l-4 ${
                  active
                    ? "bg-paper text-ink md:border-l-brass"
                    : "text-paper/75 hover:bg-ink-light md:border-l-transparent"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block mt-auto px-5 py-5 border-t border-paper/15">
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

      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-ink text-paper">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mpa.png" alt="Logo Mulia Putri Agency" className="w-8 h-8 object-contain" />
            <p className="font-display italic text-brass-light">Pocket Book</p>
          </div>
          <button onClick={handleLogout} className="text-xs font-semibold text-brass-light underline">
            Keluar
          </button>
        </header>

        <main className="flex-1 px-5 md:px-10 py-8 md:py-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
