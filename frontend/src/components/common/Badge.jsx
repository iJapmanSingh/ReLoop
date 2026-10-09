const tones = {
  neutral: "bg-canvas text-ink-700 ring-line",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
  amber: "bg-amber-50 text-amber-600 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-700/20",
  red: "bg-red-50 text-red-700 ring-red-700/20",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}