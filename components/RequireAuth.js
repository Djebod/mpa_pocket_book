"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import AppShell from "@/components/AppShell";

export default function RequireAuth({ children, adminOnly = false }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/");
      return;
    }
    if (adminOnly && session.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [ready, session, adminOnly, router]);

  if (!ready || !session || (adminOnly && session.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-mono text-sm text-ink/50">Memuat…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
