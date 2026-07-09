"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LoginPage() {
  const { session, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) router.replace("/dashboard");
  }, [ready, session, router]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mpa.png"
            alt="Logo Mulia Putri Agency"
            className="w-20 h-20 object-contain mx-auto mb-3"
          />
          <p className="font-mono text-xs tracking-[0.25em] text-brass uppercase mb-2">
            Mulia Putri Agency
          </p>
          <h1 className="font-display italic text-4xl text-ink">Pocket Book</h1>
          <p className="text-sm text-ink/60 mt-2">
            Buku saku digital agen — produk, panduan jual, dan catatan aktivitas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-ink/10 rounded-lg shadow-stamp px-7 py-8 perforated"
        >
          <div className="mb-5">
            <label className="block text-sm font-semibold text-ink mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@muliaputri.com"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-charcoal focus:border-brass focus:outline-none focus-visible:outline-brass"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-1.5" htmlFor="password">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-charcoal focus:border-brass focus:outline-none focus-visible:outline-brass"
            />
          </div>

          {error && (
            <p className="text-sm text-rust mb-4 -mt-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-ink text-paper font-semibold text-sm py-2.5 rounded-md hover:bg-ink-light transition-colors"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
