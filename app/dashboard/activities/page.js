"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import PhotoInput from "@/components/PhotoInput";
import Stamp from "@/components/Stamp";

const today = () => new Date().toISOString().slice(0, 10);

export default function ActivitiesPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [type, setType] = useState(store.getActivityTypes()[0]);
  const [date, setDate] = useState(today());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [justStamped, setJustStamped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    if (!session) return;
    setActivities(store.getActivitiesByMember(session.memberId));
  }

  useEffect(refresh, [session]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!photo) {
      setError("Foto bukti aktivitas wajib dilampirkan.");
      return;
    }

    setSubmitting(true);
    // Coba unggah foto ke Google Drive dulu (kalau sudah dikonfigurasi lewat
    // .env). Kalau belum dikonfigurasi / gagal / offline, foto tetap
    // disimpan sebagai data lokal supaya aktivitas tidak batal tercatat.
    let photoValue = photo;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl: photo,
          filename: `aktivitas-${session.memberId}-${Date.now()}.jpg`,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.ok && data.url) {
        photoValue = data.url;
      } else if (data.error) {
        console.warn("Upload foto ke Google Drive gagal, pakai foto lokal:", data.error);
      }
    } catch (err) {
      console.warn("Upload foto ke Google Drive gagal/timeout, pakai foto lokal:", err);
    }

    try {
      store.addActivity({
        memberId: session.memberId,
        memberName: session.name,
        type,
        date,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        note: note.trim(),
        photo: photoValue,
      });
      setCustomerName("");
      setCustomerPhone("");
      setNote("");
      setPhoto(null);
      setDate(today());
      refresh();
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 1600);
    } catch (err) {
      setError(err.message || "Aktivitas gagal disimpan. Coba lagi.");
    }
    setSubmitting(false);
  }

  function handleDelete(id) {
    store.deleteActivity(id);
    refresh();
  }

  return (
    <div>
      <h1 className="font-display italic text-3xl text-ink mb-1">Aktivitas</h1>
      <p className="text-sm text-ink/60 mb-8">Catat aktivitas harian Anda lengkap dengan foto bukti.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-ink/10 rounded-lg shadow-stamp px-6 py-6 mb-10 perforated relative"
      >
        {justStamped && (
          <div className="absolute top-5 right-6 stamp text-sage px-3 py-1 text-xs font-semibold uppercase">
            Tercatat ✓
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Jenis Aktivitas</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            >
              {store.getActivityTypes().map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
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
            <label className="block text-sm font-semibold text-ink mb-1.5">Nama Nasabah</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Bapak Andi Wijaya"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">No. Telpon Nasabah</label>
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-ink mb-1.5">Catatan (opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Contoh: kunjungan ke Bapak Andi membahas produk kesehatan"
            className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <PhotoInput value={photo} onChange={setPhoto} />
        </div>

        {error && (
          <p className="text-sm text-rust mb-4" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-brass text-ink font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Menyimpan…" : "Catat Aktivitas"}
        </button>
      </form>

      <h2 className="font-display text-lg text-ink mb-3">Riwayat Aktivitas ({activities.length})</h2>

      {activities.length === 0 ? (
        <div className="bg-card border border-dashed border-ink/20 rounded-lg px-5 py-8 text-center text-sm text-ink/50">
          Belum ada aktivitas tercatat.
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((act) => (
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
                  <Stamp type={act.type} small />
                  <span className="font-mono text-[11px] text-ink/45">{act.date}</span>
                </div>
                {(act.customerName || act.customerPhone) && (
                  <p className="text-sm text-ink/70 font-medium">
                    {act.customerName || "—"}
                    {act.customerPhone && (
                      <span className="text-ink/45 font-normal"> · {act.customerPhone}</span>
                    )}
                  </p>
                )}
                {act.note && <p className="text-sm text-charcoal/80">{act.note}</p>}
              </div>
              <button
                onClick={() => handleDelete(act.id)}
                className="text-xs text-rust/70 hover:text-rust shrink-0"
                aria-label="Hapus aktivitas"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
