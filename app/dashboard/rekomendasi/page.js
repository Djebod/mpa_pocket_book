"use client";

import { useState } from "react";
import { KB, TREE, CATEGORIES, WIZARD_DISCLAIMER } from "@/lib/productWizard";

function ProductCard({ code, note, dimmed = false }) {
  const product = KB[code];
  if (!product) return null;
  return (
    <div
      className={`rounded-lg border px-4 py-4 ${
        dimmed ? "border-ink/10 bg-paper-dark/30" : "border-brass/40 bg-card shadow-stamp"
      }`}
    >
      <span className="font-mono text-xs font-semibold tracking-wide text-brass bg-brass/10 px-2 py-1 rounded">
        {code.replace(/_/g, " ")}
      </span>
      <p className="font-display text-lg text-ink mt-2 mb-1">{product.name}</p>
      <p className="text-sm text-charcoal/75 leading-relaxed">{product.spec}</p>
      {note && (
        <p className="text-xs text-ink/70 mt-2 pt-2 border-t border-ink/10">
          <span className="font-semibold">Catatan: </span>
          {note}
        </p>
      )}
    </div>
  );
}

export default function RekomendasiProdukPage() {
  // stack: daftar node pertanyaan yang sudah dilalui (untuk tombol Kembali)
  const [categoryId, setCategoryId] = useState(null);
  const [stack, setStack] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [result, setResult] = useState(null);

  function reset() {
    setCategoryId(null);
    setStack([]);
    setBreadcrumb([]);
    setResult(null);
  }

  function selectCategory(cat) {
    setCategoryId(cat.id);
    setStack([TREE[cat.id]]);
    setBreadcrumb([cat.label]);
    setResult(null);
  }

  function selectOption(option) {
    const nextBreadcrumb = [...breadcrumb, option.label];
    if (option.next.result) {
      setBreadcrumb(nextBreadcrumb);
      setResult(option.next.result);
    } else {
      setStack([...stack, option.next]);
      setBreadcrumb(nextBreadcrumb);
    }
  }

  function goBack() {
    if (result) {
      setResult(null);
      setBreadcrumb(breadcrumb.slice(0, -1));
      return;
    }
    if (stack.length > 1) {
      setStack(stack.slice(0, -1));
      setBreadcrumb(breadcrumb.slice(0, -1));
      return;
    }
    // Di pertanyaan pertama kategori -> kembali ke menu kategori
    reset();
  }

  const currentNode = stack[stack.length - 1];
  const onCategoryMenu = categoryId === null;

  return (
    <div className="max-w-[480px] mx-auto">
      <div className="mb-1">
        <h1 className="font-display italic text-2xl sm:text-3xl text-ink">Rekomendasi Produk</h1>
        <p className="text-sm text-ink/60 mt-1">
          Jawab beberapa pertanyaan tap-pilih untuk menemukan produk yang tepat untuk nasabah.
        </p>
      </div>

      {/* Breadcrumb jejak keputusan */}
      {breadcrumb.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 mb-2">
          {breadcrumb.map((b, i) => (
            <span
              key={i}
              className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-ink text-paper/90"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Navigasi atas: Kembali + Mulai ulang */}
      {!onCategoryMenu && (
        <div className="flex items-center justify-between mt-3 mb-4">
          <button
            onClick={goBack}
            className="text-xs font-semibold text-ink/60 hover:text-brass underline underline-offset-2"
          >
            ← Kembali
          </button>
          <button onClick={reset} className="text-xs font-semibold text-rust/70 hover:text-rust">
            Mulai ulang
          </button>
        </div>
      )}

      {/* ---- Layar 1: Menu kategori kebutuhan ---- */}
      {onCategoryMenu && (
        <div className="grid grid-cols-1 gap-3 mt-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat)}
              className="text-left bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp hover:border-brass transition-colors"
            >
              <span className="font-display text-lg text-ink">{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ---- Layar 2: Pertanyaan ---- */}
      {!onCategoryMenu && !result && currentNode && (
        <div>
          <h2 className="font-display text-xl text-ink mb-4">{currentNode.question}</h2>
          <div className="grid grid-cols-1 gap-3">
            {currentNode.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectOption(opt)}
                className="text-left bg-card border border-ink/10 rounded-lg px-5 py-4 shadow-stamp hover:border-brass transition-colors"
              >
                <span className="font-semibold text-ink block">{opt.label}</span>
                {opt.subtext && <span className="text-xs text-ink/55 block mt-1">{opt.subtext}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Layar 3: Hasil rekomendasi ---- */}
      {result && (
        <div>
          <span className="inline-block font-mono text-[11px] font-bold tracking-wider text-sage bg-sage/10 px-3 py-1 rounded-full mb-3">
            REKOMENDASI
          </span>

          <ProductCard code={result.code} note={result.note} />

          {result.alt && result.alt.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide mb-2">Alternatif</p>
              <div className="space-y-2">
                {result.alt.map((a, i) => (
                  <ProductCard key={i} code={a.code} note={a.note} dimmed />
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 bg-paper-dark/30 border border-ink/10 rounded-lg px-4 py-4">
            <p className="text-xs font-semibold text-ink/60 mb-2">Dasar rekomendasi</p>
            <p className="text-sm text-charcoal/80">{breadcrumb.join(" → ")}</p>
          </div>

          <p className="text-xs text-ink/45 leading-relaxed mt-4">{WIZARD_DISCLAIMER}</p>

          <button
            onClick={reset}
            className="mt-5 w-full bg-brass text-ink font-semibold text-sm px-5 py-3 rounded-md hover:bg-brass-light transition-colors"
          >
            Nasabah berikutnya →
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-ink/35 mt-8 mb-2">
        Alat bantu agen — bukan pengganti ilustrasi resmi.
      </p>
    </div>
  );
}
