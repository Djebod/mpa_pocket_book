"use client";

import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
