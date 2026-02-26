export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  colorClass,
  darkMode,
}) {
  // Extract colors from the class string (e.g., 'bg-emerald-500') or define variants manually
  return (
    <div
      className={`flex flex-col p-6 rounded-2xl border transition-all hover:shadow-lg ${
        darkMode
          ? "bg-slate-900/40 border-white/5 shadow-black/20 relative overflow-hidden group"
          : "bg-white border-slate-100 shadow-slate-200/50"
      }`}
    >
      {/* Decorative background glow on dark mode */}
      {darkMode && (
        <div
          className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20 ${colorClass}`}
        />
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3
            className={`text-xs font-semibold tracking-wider uppercase mb-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            {title}
          </h3>
          <div
            className={`text-3xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {value}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${colorClass} ${darkMode ? "shadow-black/30 ring-1 ring-white/10" : ""}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
            trend > 0
              ? "bg-emerald-500/10 text-emerald-500"
              : trend < 0
                ? "bg-rose-500/10 text-rose-500"
                : "bg-slate-500/10 text-slate-500"
          }`}
        >
          {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"} {Math.abs(trend)}%
        </div>
        <span
          className={`text-xs font-medium font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {trendLabel}
        </span>
      </div>
    </div>
  );
}
