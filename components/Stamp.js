const CATEGORY_COLORS = {
  nasabah: "text-sage",
  agen: "text-brass",
};

export default function Stamp({ type, category, small = false }) {
  const color = CATEGORY_COLORS[category] || "text-ink";
  return (
    <span
      className={`stamp ${color} ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} font-semibold uppercase`}
    >
      {type}
    </span>
  );
}
