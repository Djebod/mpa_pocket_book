const TYPE_COLORS = {
  "Visit Customer": "text-sage",
  Recruit: "text-brass",
  "Role Play": "text-ink-light",
  "Join Visit": "text-rust",
  Other: "text-charcoal",
};

export default function Stamp({ type, small = false }) {
  const color = TYPE_COLORS[type] || "text-ink";
  return (
    <span
      className={`stamp ${color} ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} font-semibold uppercase`}
    >
      {type}
    </span>
  );
}
