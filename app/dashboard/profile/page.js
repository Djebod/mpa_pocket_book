"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";

export default function ProfilePage() {
  const { session } = useAuth();
  const [member, setMember] = useState(undefined);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session) return;
    const members = store.getMembers();
    setMember(members.find((m) => m.id === session.memberId) || null);
  }, [session]);

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saving]);

  function resetPasswordForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak sama.");
      return;
    }

    setSaving(true);
    try {
      await store.changeOwnPassword(session.memberId, currentPassword, newPassword);
      resetPasswordForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message || "Password gagal diubah. Coba lagi.");
    }
    setSaving(false);
  }

  if (member === undefined) {
    return <p className="font-mono text-sm text-ink/50">Memuat…</p>;
  }

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kelola Profil</h1>
      <p className="text-sm text-ink/60 mb-8">Informasi akun Anda dan pengaturan password.</p>

      <div className="bg-card border border-ink/10 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-8">
        <h2 className="font-display text-lg text-ink mb-4">Informasi Akun</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Nama</p>
            <p className="text-sm text-charcoal">{member?.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-charcoal">{member?.email}</p>
          </div>
          {member?.phone && (
            <div>
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">No. Telepon</p>
              <p className="text-sm text-charcoal">{member.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-1">Peran</p>
            <p className="text-sm text-charcoal">{session?.role === "admin" ? "Admin" : "Member"}</p>
          </div>
        </div>
        <p className="text-xs text-ink/40 mt-4">
          Untuk mengubah Nama, Email, atau No. Telepon, hubungi Admin lewat Kelola Member.
        </p>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="bg-card border border-brass/40 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 perforated relative"
      >
        {success && (
          <div className="absolute top-5 right-6 stamp text-sage px-3 py-1 text-xs font-semibold uppercase">
            Tersimpan ✓
          </div>
        )}
        <h2 className="font-display text-lg text-ink mb-4">Ganti Password</h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Password Saat Ini</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
            <p className="text-xs text-ink/45 mt-1">Minimal 6 karakter.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rust mb-4" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Menyimpan…" : "Simpan Password Baru"}
        </button>
        {saving && (
          <p className="text-xs text-ink/45 mt-2">
            Jangan tutup atau refresh halaman ini dulu — sedang mengirim ke Google Sheets…
          </p>
        )}
      </form>
    </div>
  );
}
