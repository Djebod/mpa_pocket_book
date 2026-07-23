"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import * as store from "@/lib/store";
import PhotoInput from "@/components/PhotoInput";
import Stamp from "@/components/Stamp";
import ValidationBadge from "@/components/ValidationBadge";

const today = () => new Date().toISOString().slice(0, 10);
const NEW_CONTACT_VALUE = "__new__";

export default function ActivitiesPage() {
  const { session } = useAuth();
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({ validPoints: 0, unconfirmedPoints: 0 });
  const [contacts, setContacts] = useState([]);

  const [jalur, setJalur] = useState(null); // "nasabah" | "agen" | null
  const [typeKey, setTypeKey] = useState("");
  const [contactSelect, setContactSelect] = useState(""); // id kontak, atau NEW_CONTACT_VALUE
  const [newContactName, setNewContactName] = useState("");
  const [newContactProfession, setNewContactProfession] = useState("");
  const [newContactCategory, setNewContactCategory] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [productSold, setProductSold] = useState("");
  const [premiumNominal, setPremiumNominal] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  const categories = store.getActivityCategories();
  const contactCategoryOptions = store.getContactCategories();

  function refresh() {
    if (!session) return;
    setActivities(store.getActivitiesByMember(session.memberId));
    setSummary(store.getMemberPointsSummary(session.memberId));
    setContacts(store.getContactsByMember(session.memberId));
  }

  useEffect(refresh, [session]);

  const activeCategory = jalur ? categories.find((c) => c.key === jalur) : null;
  const activeTypeConfig = activeCategory && typeKey ? store.getActivityTypeConfig(jalur, typeKey) : null;

  const filteredContacts = activeCategory
    ? contacts.filter((c) => activeCategory.contactCategories.includes(c.category))
    : [];

  const selectedContact = contacts.find((c) => c.id === contactSelect) || null;

  function resetForm() {
    setJalur(null);
    setTypeKey("");
    setContactSelect("");
    setNewContactName("");
    setNewContactProfession("");
    setNewContactCategory("");
    setNote("");
    setPhoto(null);
    setProductSold("");
    setPremiumNominal("");
    setEditingId(null);
    setError("");
  }

  function chooseJalur(key) {
    setJalur(key);
    setTypeKey("");
    setContactSelect("");
    setNewContactName("");
    setNewContactProfession("");
    setNewContactCategory("");
    setNote("");
    setPhoto(null);
    setProductSold("");
    setPremiumNominal("");
    setEditingId(null);
    setError("");
  }

  async function handleSaveNewContact() {
    setError("");
    if (!newContactName.trim() || !newContactProfession.trim() || !newContactCategory) {
      setError("Nama, Profesi, dan Kategori kontak baru wajib diisi.");
      return;
    }
    setSavingContact(true);
    try {
      const created = await store.addContact({
        memberId: session.memberId,
        name: newContactName.trim(),
        profession: newContactProfession.trim(),
        category: newContactCategory,
      });
      setContacts(store.getContactsByMember(session.memberId));
      setContactSelect(created.id);
      setNewContactName("");
      setNewContactProfession("");
      setNewContactCategory("");
    } catch (err) {
      setError(err.message || "Kontak gagal disimpan.");
    }
    setSavingContact(false);
  }

  function startEdit(act) {
    setJalur(act.category);
    setTypeKey(act.type);
    setContactSelect(act.contactId || "");
    setNewContactName("");
    setNewContactProfession("");
    setNewContactCategory("");
    setNote(act.note || "");
    setPhoto(act.photo || null);
    setProductSold(act.productSold || "");
    setPremiumNominal(act.premiumNominal ? String(act.premiumNominal) : "");
    setEditingId(act.id);
    setError("");
    setTimeout(() => {
      document.getElementById("activity-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    if (!activeTypeConfig) {
      setError("Pilih Type Activity terlebih dahulu.");
      return;
    }
    if (!selectedContact) {
      setError("Pilih Nama dari Database, atau tambahkan kontak baru terlebih dahulu.");
      return;
    }
    if (!note.trim()) {
      setError(`${activeTypeConfig.noteLabel} wajib diisi.`);
      return;
    }
    if (!photo) {
      setError(`${activeTypeConfig.photoLabel} wajib dilampirkan.`);
      return;
    }
    if (activeTypeConfig.hasSaleFields) {
      if (!productSold.trim()) {
        setError("Produk yang dijual wajib diisi.");
        return;
      }
      if (!premiumNominal || Number(premiumNominal) <= 0) {
        setError("Nominal Premi/Tahun wajib diisi (angka saja).");
        return;
      }
    }

    setSubmitting(true);
    const photoValue = await uploadPhotoIfNeeded(photo);

    try {
      const payload = {
        category: jalur,
        type: typeKey,
        points: activeTypeConfig.points,
        date: today(),
        contactId: selectedContact.id,
        contactName: selectedContact.name,
        contactProfession: selectedContact.profession,
        note: note.trim(),
        photo: photoValue || "",
        productSold: activeTypeConfig.hasSaleFields ? productSold.trim() : "",
        premiumNominal: activeTypeConfig.hasSaleFields ? Number(premiumNominal) : "",
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

      {/* Langkah 1: pilih jalur */}
      {!jalur && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => chooseJalur(cat.key)}
              className="text-left bg-card border border-ink/10 rounded-lg px-5 py-5 shadow-stamp hover:border-brass transition-colors"
            >
              <span className="font-display text-xl text-ink block">{cat.label}</span>
              <span className="text-xs text-ink/50">{cat.sublabel}</span>
            </button>
          ))}
        </div>
      )}

      {/* Langkah 2: form terpadu */}
      {jalur && (
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

          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-display text-lg text-ink">{activeCategory.label}</span>
              <span className="text-xs text-ink/50 block">{activeCategory.sublabel}</span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-ink/50 hover:text-brass underline underline-offset-2"
            >
              Ganti Jalur
            </button>
          </div>

          {/* Type Activity: radio wajib */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-ink mb-2">
              Type Activity <span className="text-rust">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {activeCategory.types.map((t) => (
                <label key={t.key} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="radio"
                    name="activityType"
                    value={t.key}
                    checked={typeKey === t.key}
                    onChange={() => setTypeKey(t.key)}
                    className="accent-brass w-4 h-4"
                  />
                  {t.label} <span className="text-xs text-ink/40">({t.points} poin)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tanggal — tetap, tidak bisa diubah */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-ink mb-1.5">Tanggal</label>
            <div className="rounded-md border border-ink/15 bg-paper-dark/40 px-3.5 py-2.5 text-sm text-ink/60 font-mono">
              {today()} <span className="text-ink/40">(otomatis hari ini, tidak bisa diubah)</span>
            </div>
          </div>

          {/* Nama dari Database */}
          <div className="mb-2">
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Nama (Database Calon Nasabah / Calon Agen) <span className="text-rust">*</span>
            </label>
            <select
              value={contactSelect}
              onChange={(e) => setContactSelect(e.target.value)}
              className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
            >
              <option value="">— Pilih nama —</option>
              {filteredContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
              <option value={NEW_CONTACT_VALUE}>➕ Tambah Kontak Baru…</option>
            </select>
          </div>

          {contactSelect === NEW_CONTACT_VALUE && (
            <div className="mb-5 bg-paper-dark/40 border border-ink/10 rounded-md px-4 py-4">
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-3">Tambah Kontak Baru</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Nama</label>
                  <input
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Contoh: Syam Shugi"
                    className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Profesi</label>
                  <input
                    value={newContactProfession}
                    onChange={(e) => setNewContactProfession(e.target.value)}
                    placeholder="Contoh: Wiraswasta"
                    className="w-full rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-ink mb-1.5">Kategori</label>
                <div className="flex flex-wrap gap-4">
                  {contactCategoryOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                      <input
                        type="radio"
                        name="newContactCategory"
                        value={opt}
                        checked={newContactCategory === opt}
                        onChange={() => setNewContactCategory(opt)}
                        className="accent-brass w-4 h-4"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveNewContact}
                disabled={savingContact}
                className="text-xs font-semibold bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingContact ? "Menyimpan…" : "Simpan Kontak"}
              </button>
              <p className="text-xs text-ink/40 mt-2">Tanggal kontak ini tercatat otomatis: {today()}</p>
            </div>
          )}

          {/* Profesi — otomatis dari kontak terpilih */}
          {selectedContact && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-ink mb-1.5">Profesi</label>
              <div className="rounded-md border border-ink/15 bg-paper-dark/40 px-3.5 py-2.5 text-sm text-ink/70 font-mono">
                {selectedContact.profession}
              </div>
            </div>
          )}

          {activeTypeConfig && (
            <>
              {/* Field khusus Closing */}
              {activeTypeConfig.hasSaleFields && (
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Produk yang Dijual <span className="text-rust">*</span>
                    </label>
                    <input
                      value={productSold}
                      onChange={(e) => setProductSold(e.target.value)}
                      placeholder="Contoh: Mulia Sehat Keluarga"
                      className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      Nominal Premi / Tahun <span className="text-rust">*</span>
                    </label>
                    <input
                      value={premiumNominal}
                      onChange={(e) => setPremiumNominal(e.target.value.replace(/\D/g, ""))}
                      inputMode="numeric"
                      placeholder="Contoh: 5000000"
                      className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                    <p className="text-xs text-ink/45 mt-1">Angka saja, tanpa titik/koma.</p>
                  </div>
                </div>
              )}

              {/* Catatan / Hasil Pertemuan (atau Level Agen untuk Recruit) */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  {activeTypeConfig.noteLabel} <span className="text-rust">*</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-ink/20 bg-paper px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              {/* Foto bukti — selalu wajib */}
              <div className="mb-5">
                <PhotoInput value={photo} onChange={setPhoto} label={activeTypeConfig.photoLabel} required />
              </div>
            </>
          )}

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
                  {(act.contactName || act.contactProfession) && (
                    <p className="text-sm text-ink/70 font-medium">
                      {act.contactName || "—"}
                      {act.contactProfession && (
                        <span className="text-ink/45 font-normal"> · {act.contactProfession}</span>
                      )}
                    </p>
                  )}
                  {act.productSold && (
                    <p className="text-sm text-ink/70">
                      Produk: {act.productSold}
                      {act.premiumNominal
                        ? ` · Premi: Rp${Number(act.premiumNominal).toLocaleString("id-ID")}/th`
                        : ""}
                    </p>
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
