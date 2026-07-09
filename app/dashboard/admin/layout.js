"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function AdminLayout({ children }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && session && session.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [ready, session, router]);

  if (!session || session.role !== "admin") return null;

  return <>{children}</>;
}
