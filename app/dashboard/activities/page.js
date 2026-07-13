"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import PhotoInput from "@/components/PhotoInput";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";

const today = () => new Date().toISOString().slice(0, 10);

export default function ActivitiesPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({ validPoints: 0, unconfirmedPoints: 0 });
  const [selected, setSelected] = useState(null); // { categoryKey, typeKey } | null
  const [date, setDate] = useState(today());
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  const categories = store.getActivityCategories();

  function refresh() {
    if (!session) return;
    setActivities(store.getActivitiesByMember(session.memberId));
    setSummary(store.getMemberPointsSummary(session.memberId));
  }

  useEffect(refresh, [session]);

  function resetForm() {
    setSelected(null);
    setDate(today());
    setContactName("");
    setContactPhone("");
    setPhoto(null);
    setPolicyNumber("");
    setNote("");
    setEditingId(null);
    setError("");
  }

  function startLog(categoryKey, typeKey) {
    setSelected({ categoryKey, typeKey });
    setDate(today());
    setContactName("");
    setContactPhone("");
    setPhoto(null);
    setPolicyNumber("");
    setNote("");
    setEditingId(null);
    setError("");
    setTimeout(() => {
      document.getElementById("activity-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function startEdit(act) {
    setSelected({ categoryKey: act.category, typeKey: act.type });
    setDate(act.date || today());
    setContactName(act.contactName || "");
    setContactPhone(act.contactPhone || "");
    setPhoto(act.photo || null);
    setPolicyNumber(act.policyNumber || "");
    setNote(act.note || "");
    setEditingId(act.id);
    setError("");
    setTimeout(() => {
      document.getElementById("activity-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function uploadPhotoIfNeeded(value) {
    if (!value || !value.startsWith("data:")) return value;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: value, filename: `aktivitas-${session.memberId}-${Date.now()}.jpg` }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.ok && data.url) return data.url;
      if (data.error) console.warn("Upload foto ke Google Drive gagal, pakai foto lokal:", data.error);
    } catch (err) {
      console.warn("Upload foto ke Google Drive gagal/timeout, pakai foto lokal:", err);
    }
    return value;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!selected) return;

    const config = store.getActivityTypeConfig(selected.categoryKey, selected.typeKey);
    if (!config) {
      setError("Jenis aktivitas tidak ditemukan.");
      return;
    }

    if (!contactName.trim()) {
      setError(`${selectedCategory?.contactLabel || "Nama"} wajib diisi.`);
      return;
    }
    if (config.proofType === "photo" && !photo) {
      setError("Foto bukti wajib dilampirkan.");
      return;
    }
    if (config.proofType === "policy" && !policyNumber.trim()) {
      setError("Nomor polis wajib diisi.");
      return;
    }

    setSubmitting(true);
    const photoValue = await uploadPhotoIfNeeded(photo);

    try {
      const payload = {
        category: selected.categoryKey,
        type: selected.typeKey,
        points: config.points,
        date,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        photo: photoValue || "",
        policyNumber: policyNumber.trim(),
        note: note.trim(),
      };

      if (editingId) {
        // Mengubah aktivitas yang sudah ada -> perlu divalidasi ulang oleh Admin.
        store.updateActivity(editingId, { ...payload, validated: false, validatedAt: null, validatedBy: null });
      } else {
        store.addActivity({
          memberId: session.memberId,
          memberName: session.name,
          ...payload,
        });
      }

      resetForm();
      refresh();
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 1600);
    } catch (err) {
      setError(err.message || "Aktivitas gagal disimpan. Coba lagi.");
    }
    setSubmitting(false);
  }

  const selectedConfig = selected ? store.getActivityTypeConfig(selected.categoryKey, selected.typeKey) : null;
  const selectedCategory = selected ? categories.find((c) => c.key === selected.categoryKey) : null;

  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Aktivitas</h1>
      <p className="text-sm text-ink/60 mb-6">
        Catat aktivitas Anda untuk mendapatkan poin. Poin masuk sebagai <strong>Valid Point</strong> setelah
        diverifikasi Admin.
      </p>

      {/* Ringkasan poin */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-ink text-paper rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl">{summary.validPoints}</p>
          <p className="text-xs text-paper/70 mt-1">Valid Point</p>
        </div>
        <div className="bg-card border border-brass/30 rounded-lg px-5 py-5 shadow-stamp">
          <p className="font-mono text-3xl text-brass">{summary.unconfirmedPoints}</p>
          <p className="text-xs text-ink/60 mt-1">Unconfirmed Point</p>
        </div>
      </div>

      {/* 2 kategori */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {categories.map((cat) => (
          <div key={cat.key} className="bg-card border border-ink/10 rounded-lg shadow-stamp overflow-hidden">
            <div className="px-5 py-4 border-b border-ink/10 bg-paper-dark/30">
              <h2 className="font-display text-lg text-ink">{cat.label}</h2>
              <p className="text-xs text-ink/50">{cat.sublabel}</p>
            </div>
            <div className="divide-y divide-ink/5">
              {cat.types.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal">{t.label}</p>
                    <p className="text-xs text-ink/45">{t.points} poin · {t.proofLabel}</p>
                  </div>
                  <button
                    onClick={() => startLog(cat.key, t.key)}
                    className="shrink-0 text-xs font-semibold bg-brass text-ink px-3.5 py-2 rounded-md hover:bg-brass-light transition-colors"
                  >
                    Catat
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form pencatatan */}
      {selected && selectedConfig && (
        <form
          id="activity-form"
          onSubmit={handleSubmit}
          className="bg-card border border-brass/40 rounded-lg shadow-stamp px-4 sm:px-6 py-5 sm:py-6 mb-10 perforated relative"
        >
          {justStamped && (
            <div className="absolute top-5 right-6 stamp text-sage px-3 py-1 text-xs font-semibold uppercase">
              {editingId ? "Tersimpan ✓" : "Tercatat ✓"}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Stamp type={selectedConfig.label} category={selected.categoryKey} />
            <span className="font-mono text-xs text-ink/50">{selectedCategory?.label}</span>
            <span className="font-mono text-xs text-brass font-semibold">{selectedConfig.points} poin</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                {selectedCategory?.contactLabel || "Nama"}
              </label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={selected.categoryKey === "agen" ? "Contoh: Budi Santoso" : "Contoh: Bapak Andi Wijaya"}
                className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Nomor Telepon</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
              />
            </div>
            {selectedConfig.proofType === "policy" && (
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Nomor Polis</label>
                <input
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Contoh: 0123456789"
                  className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-ink mb-1.5">Catatan (opsional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <PhotoInput value={photo} onChange={setPhoto} required={selectedConfig.proofType === "photo"} />
            {selectedConfig.proofType === "policy" && (
              <p className="text-xs text-ink/45 mt-1.5">Foto di atas opsional untuk jenis aktivitas ini.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-rust mb-4" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Catat Aktivitas"}
            </button>
            <button type="button" onClick={resetForm} className="text-sm font-semibold text-ink/60 hover:text-ink px-3">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Riwayat */}
      <h2 className="font-display text-lg text-ink mb-3">Riwayat Aktivitas ({activities.length})</h2>

      {activities.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat.
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((act) => {
            const config = store.getActivityTypeConfig(act.category, act.type);
            const editable = store.isActivityEditableToday(act);
            return (
              <li
                key={act.id}
                className="flex items-start gap-4 bg-card border border-ink/10 rounded-lg px-4 py-4 shadow-stamp"
              >
                {act.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={act.photo} alt="" className="w-16 h-16 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Stamp type={config?.label || act.type} category={act.category} small />
                    <span className="font-mono text-[11px] text-brass font-semibold">{act.points} poin</span>
                    <ValidationBadge validated={act.validated} small />
                    <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                  </div>
                  {(act.contactName || act.contactPhone) && (
                    <p className="text-sm text-ink/70 font-medium">
                      {act.contactName || "—"}
                      {act.contactPhone && <span className="text-ink/45 font-normal"> · {act.contactPhone}</span>}
                    </p>
                  )}
                  {act.policyNumber && (
                    <p className="text-sm text-ink/70 font-medium">Nomor Polis: {act.policyNumber}</p>
                  )}
                  {act.note && <p className="text-sm text-charcoal/80">{act.note}</p>}
                </div>
                {editable && (
                  <button
                    onClick={() => startEdit(act)}
                    className="text-xs text-ink/60 hover:text-brass shrink-0"
                    aria-label="Ubah aktivitas"
                  >
                    Ubah
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
