"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import { isSuperAdminEmail } from "@/lib/admins";
import { exportMembersToExcel } from "@/lib/exportExcel";

const emptyForm = { name: "", email: "", phone: "", password: "", role: "member" };

export default function AdminMembersPage() {
  const { session } = useAuth();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function refresh() {
    if (!session) return;
    setMembers(store.getVisibleMembers(session.email));
  }

  useEffect(refresh, [session]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || (!editingId && !form.password.trim())) {
      setError("Nama, email, dan password wajib diisi.");
      return;
    }
    const duplicate = store
      .getMembers()
      .find((m) => m.email.toLowerCase() === form.email.trim().toLowerCase() && m.id !== editingId);
    if (duplicate) {
      setError("Email sudah terdaftar untuk member lain.");
      return;
    }

    const payload = { ...form, email: form.email.trim() };
    if (!payload.password) delete payload.password; // saat edit, kosong = biarkan password lama

    if (editingId) {
      store.updateMember(editingId, payload);
    } else {
      store.addMember(payload);
    }
    refresh();
    resetForm();
  }

  function handleEdit(member) {
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      password: "",
      role: store.getEffectiveRole(member),
    });
    setEditingId(member.id);
    setError("");
  }

  function handleDelete(member) {
    if (!store.canDeleteMember(session.email, member)) return;
    if (!confirm(`Hapus member "${member.name}"? Riwayat aktivitasnya akan tetap tersimpan.`)) return;
    store.deleteMember(member.id, session.email);
    refresh();
    if (editingId === member.id) resetForm();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
        <h1 className="font-display italic text-3xl text-ink">Kelola Member</h1>
        <button
          onClick={() => exportMembersToExcel(members)}
          className="bg-ink text-paper text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-ink-light transition-colors shrink-0"
        >
          ⬇ Download Excel
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-8">
        Tambah, ubah, atau hapus akun member — termasuk mengubah level member menjadi Admin.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-ink/10 rounded-lg shadow-stamp px-6 py-6 mb-10 perforated">
        <h2 className="font-display text-lg text-ink mb-4">{editingId ? "Ubah Member" : "Tambah Member Baru"}</h2>
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Nama</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">No. HP</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Password {editingId && <span className="font-normal text-ink/45">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? "••••••••" : ""}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Level / Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-rust mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Member"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-ink/60 hover:text-ink px-3"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-lg text-ink mb-3">Daftar Member ({members.length})</h2>
      <div className="overflow-x-auto bg-card border border-ink/10 rounded-lg shadow-stamp">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-ink/10 text-ink/50 text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">No. HP</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const role = store.getEffectiveRole(m);
              const canDelete = session && store.canDeleteMember(session.email, m);
              const isSuper = isSuperAdminEmail(m.email);
              return (
                <tr key={m.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {m.name}
                    {isSuper && (
                      <span className="ml-2 text-[10px] font-semibold uppercase text-brass align-middle">
                        Super Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal/70 font-mono text-xs">{m.email}</td>
                  <td className="px-4 py-3 text-charcoal/70">{m.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        role === "admin" ? "bg-brass/20 text-brass" : "bg-sage/15 text-sage"
                      }`}
                    >
                      {role === "admin" ? "Admin" : "Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(m)} className="text-xs font-semibold text-ink/60 hover:text-brass mr-3">
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      disabled={!canDelete}
                      title={!canDelete ? "Hanya Super Admin yang bisa menghapus akun Admin." : undefined}
                      className={`text-xs font-semibold ${
                        canDelete ? "text-rust/70 hover:text-rust" : "text-ink/25 cursor-not-allowed"
                      }`}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
