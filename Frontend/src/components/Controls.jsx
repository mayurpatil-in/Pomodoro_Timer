import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function Controls({
  isActive,
  toggleTimer,
  resetTimer,
  skipTimer,
  addTime,
  isMuted,
  setIsMuted,
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
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Reset */}
        <button
          onClick={resetTimer}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 hover:rotate-[-20deg] ${
            darkMode
              ? "bg-slate-800/60 border-white/8 text-slate-400 hover:text-white hover:border-white/20 hover:bg-slate-700/60"
              : "bg-white/70 border-black/10 text-slate-500 hover:text-slate-900 hover:bg-white text-slate-500 hover:text-slate-800"
          }`}
          title="Reset (R)"
          aria-label="Reset"
        >
          <RotateCcw size={18} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={toggleTimer}
          className={`w-20 h-20 flex items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95 z-10 ${
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

        {/* Skip Timer */}
        <button
          onClick={skipTimer}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 hover:translate-x-1 ${
            darkMode
              ? "bg-slate-800/60 border-white/8 text-slate-400 hover:text-white hover:border-white/20 hover:bg-slate-700/60"
              : "bg-white/70 border-black/10 text-slate-500 hover:text-slate-900 hover:bg-white"
          }`}
          title="Skip to Next Phase"
          aria-label="Skip"
        >
          <FastForward size={18} />
        </button>
      </div>

      {/* Secondary Controls Row */}
      <div className="flex items-center gap-3">
        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
            darkMode
              ? "bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
              : "bg-white/50 border-black/5 text-slate-500 hover:bg-white hover:text-slate-800 shadow-sm"
          }`}
          title="Toggle Timer Sound"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {isMuted ? "Muted" : "Sound On"}
        </button>

        {/* Quick Add Time */}
        <button
          onClick={() => addTime(300)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
            darkMode
              ? "bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
              : "bg-white/50 border-black/5 text-slate-500 hover:bg-white hover:text-slate-800 shadow-sm"
          }`}
          title="Add 5 Minutes"
        >
          <Plus size={14} />
          <span>5 MIN</span>
        </button>
      </div>
    </div>
  );
}
