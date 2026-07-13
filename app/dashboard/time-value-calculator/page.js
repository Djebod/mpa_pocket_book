"use client";

export default function TimeValueCalculatorPage() {
  return (
    <div>
      <h1 className="font-display italic text-2xl sm:text-3xl text-ink mb-1">Time Value Calculator</h1>
      <p className="text-sm text-ink/60 mb-6">
        Kalkulator nilai waktu uang (Present Value, Future Value, Pembayaran, Bunga, Periode) untuk membantu
        simulasi cepat ke nasabah.
      </p>

      <div className="rounded-lg overflow-hidden border border-ink/10 shadow-stamp bg-paper">
        <iframe
          src="/kalkulator-nilai-waktu-uang.html"
          title="Kalkulator Nilai Waktu Uang — Mulia Putri Agency"
          className="w-full border-0"
          style={{ height: "calc(100vh - 220px)", minHeight: "780px" }}
        />
      </div>
    </div>
  );
}
