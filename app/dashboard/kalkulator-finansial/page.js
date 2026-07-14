"use client";

export default function KalkulatorFinansialPage() {
  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Kalkulator Finansial</h1>
      <p className="text-sm text-ink/60 mb-6">
        Estimasi cepat 4 kebutuhan finansial nasabah: Asuransi Jiwa, Sakit Kritis, Dana Pensiun, dan Dana
        Pendidikan — hitung otomatis saat Anda mengetik.
      </p>

      <div className="rounded-lg overflow-hidden border border-ink/10 shadow-stamp bg-paper">
        <iframe
          src="/kalkulator-finansial.html"
          title="Kalkulator Perencanaan Keuangan — Mulia Putri Agency"
          className="w-full border-0"
          style={{ height: "calc(100vh - 220px)", minHeight: "820px" }}
        />
      </div>
    </div>
  );
}
