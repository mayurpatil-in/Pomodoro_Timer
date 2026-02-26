import FlipClock from "./FlipClock";
import ProgressRing from "./ProgressRing";
import { Maximize, Minimize } from "lucide-react";
import { useState, useEffect } from "react";

export default function Timer({
  timeLeft,
  progress,
  mode,
  sessionCount,
  darkMode,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const paddedMins = String(minutes).padStart(2, "0");
  const paddedSecs = String(seconds).padStart(2, "0");

  const isPomo = mode === "pomodoro";
  const glowClass = isPomo ? "glow-blue" : "glow-purple";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /* ── Fullscreen: overlay that hides everything else ── */
  if (isFullscreen) {
    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${darkMode ? "bg-[#080d18]" : "bg-[#f0f4ff]"}`}
      >
        {/* Ambient glow */}
        <div
          className={`absolute w-96 h-96 rounded-full blur-[160px] opacity-20 ${isPomo ? "bg-blue-500" : "bg-purple-600"}`}
        />

        <div className="relative flex items-center gap-6 sm:gap-10">
          <FlipClock
            timeValue={paddedMins}
            mode={mode}
            darkMode={darkMode}
            isFullscreen
          />
          <span
            className={`text-7xl sm:text-[10rem] font-bold font-inter pb-4 leading-none ${glowClass}`}
          >
            :
          </span>
          <FlipClock
            timeValue={paddedSecs}
            mode={mode}
            darkMode={darkMode}
            isFullscreen
          />
        </div>

        {/* Mode label */}
        <p
          className={`mt-8 text-sm font-outfit tracking-[0.25em] uppercase opacity-50 ${darkMode ? "text-slate-300" : "text-slate-600"}`}
        >
          {mode === "pomodoro"
            ? "Focus Session"
            : mode === "shortBreak"
              ? "Short Break"
              : "Long Break"}
        </p>

        {/* Exit button (shown on hover) */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-5 right-5 p-3 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur text-white"
          title="Exit Fullscreen"
        >
          <Minimize size={22} />
        </button>
      </div>
    );
  }

  /* ── Normal layout ── */
  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Progress ring (sits behind) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 scale-[1.15]">
        <ProgressRing progress={progress} isPomo={isPomo} />
      </div>

      {/* Card */}
      <div className="glass relative z-10 px-8 py-10 sm:px-14 sm:py-12 flex flex-col items-center gap-3 group">
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className={`absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            darkMode
              ? "text-slate-400 hover:text-white hover:bg-white/10"
              : "text-slate-400 hover:text-slate-900 hover:bg-black/8"
          }`}
          title="Fullscreen"
        >
          <Maximize size={18} />
        </button>

        {/* Time label */}
        <span
          className={`text-[10px] font-outfit font-semibold tracking-[0.3em] uppercase mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {mode === "pomodoro"
            ? "Focus Session"
            : mode === "shortBreak"
              ? "Short Break"
              : "Long Break"}
        </span>

        {/* Digits */}
        <div className="flex items-center gap-3 sm:gap-5">
          <FlipClock timeValue={paddedMins} mode={mode} darkMode={darkMode} />
          <span
            className={`text-5xl sm:text-7xl font-bold font-inter pb-2 leading-none ${glowClass}`}
          >
            :
          </span>
          <FlipClock timeValue={paddedSecs} mode={mode} darkMode={darkMode} />
        </div>

        {/* Focus Time Metric underneath the clock */}
        <div
          className={`mt-4 px-4 py-2 flex items-center gap-4 rounded-xl border ${darkMode ? "bg-slate-800/50 border-white/5" : "bg-white/50 border-black/5"}`}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Pomodoros
            </span>
            <span
              className={`text-sm font-bold font-inter ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
            >
              #{sessionCount || 0}
            </span>
          </div>
          <div
            className={`w-px h-6 opacity-30 ${darkMode ? "bg-white" : "bg-black"}`}
          ></div>
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Focus Time
            </span>
            <span
              className={`text-sm font-bold font-inter ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
            >
              {((sessionCount || 0) * 25) / 60 >= 1
                ? (((sessionCount || 0) * 25) / 60).toFixed(1) + "h"
                : (sessionCount || 0) * 25 + "m"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
