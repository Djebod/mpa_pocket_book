"use client";

import { createContext, useContext, useEffect, useState } from "react";
import * as store from "@/lib/store";

const AuthContext = createContext(null);

export function AppProviders({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Tarik data terbaru dari Google Sheets (kalau sudah dikonfigurasi)
      // ke localStorage dulu, sebelum halaman mana pun membaca data.
      await store.syncAllFromSheets();
      if (cancelled) return;
      setSession(store.getSession());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function login(email, password) {
    const result = store.login(email, password);
    if (result.ok) setSession(result.session);
    return result;
  }

  function logout() {
    store.logout();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AppProviders");
  return ctx;
}
