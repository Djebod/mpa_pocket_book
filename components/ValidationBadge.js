export default function ValidationBadge({ validated, small = false }) {
  const base = small ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  if (validated) {
    return (
      <span className={`${base} font-semibold uppercase rounded-full bg-sage/15 text-sage`}>
        ✓ Valid
      </span>
    );
  }
  return (
    <span className={`${base} font-semibold uppercase rounded-full bg-brass/15 text-brass`}>
      Menunggu Validasi
    </span>
  );
}
