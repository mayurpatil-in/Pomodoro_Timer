import { Play, Pause, RotateCcw } from "lucide-react";

export default function Controls({
  isActive,
  toggleTimer,
  resetTimer,
  mode,
  darkMode,
}) {
  const isPomo = mode === "pomodoro";

  const playBg = isPomo
    ? "bg-blue-500 hover:bg-blue-400 shadow-[0_0_28px_rgba(59,130,246,0.5)]"
    : "bg-purple-500 hover:bg-purple-400 shadow-[0_0_28px_rgba(168,85,247,0.5)]";

  const pauseBg = isPomo
    ? "border-2 border-blue-500 text-blue-400 hover:bg-blue-500/15 shadow-[0_0_18px_rgba(59,130,246,0.3)]"
    : "border-2 border-purple-500 text-purple-400 hover:bg-purple-500/15 shadow-[0_0_18px_rgba(168,85,247,0.3)]";

  return (
    <div className="flex items-center gap-5">
      {/* Reset */}
      <button
        onClick={resetTimer}
        className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 hover:rotate-[-20deg] ${
          darkMode
            ? "bg-slate-800/60 border-white/8 text-slate-400 hover:text-white hover:border-white/20 hover:bg-slate-700/60"
            : "bg-white/70 border-black/10 text-slate-500 hover:text-slate-900 hover:bg-white"
        }`}
        title="Reset (R)"
        aria-label="Reset"
      >
        <RotateCcw size={18} />
      </button>

      {/* Play / Pause */}
      <button
        onClick={toggleTimer}
        className={`w-20 h-20 flex items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95 ${
          isActive ? pauseBg : `${playBg} text-white`
        }`}
        title="Start / Pause (Space)"
        aria-label={isActive ? "Pause" : "Start"}
      >
        {isActive ? (
          <Pause size={30} className="fill-current" />
        ) : (
          <Play size={30} className="ml-1 fill-current" />
        )}
      </button>

      {/* Spacer so reset doesn't look odd on left */}
      <div className="w-12" />
    </div>
  );
}
