import { Play, Pause, RotateCcw } from "lucide-react";

export default function Controls({
  isActive,
  toggleTimer,
  resetTimer,
  mode,
  darkMode,
}) {
  const isPomo = mode === "pomodoro";

  return (
    <div className="flex gap-4 sm:gap-6 items-center mt-2 z-10">
      <button
        onClick={toggleTimer}
        className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 shadow-xl ${
          isPomo
            ? isActive
              ? "bg-white text-electric-blue border-4 border-electric-blue"
              : "bg-electric-blue text-white hover:scale-105 neon-shadow-blue"
            : isActive
              ? "bg-white text-neon-purple border-4 border-neon-purple"
              : "bg-neon-purple text-white hover:scale-105 neon-shadow-purple"
        }`}
        aria-label={isActive ? "Pause Task" : "Start Task"}
      >
        {isActive ? (
          <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
        ) : (
          <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
        )}
      </button>

      <button
        onClick={resetTimer}
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 hover:rotate-180 border ${
          darkMode
            ? "bg-navy-card/80 text-gray-300 border-white/10 hover:text-white hover:bg-white/10"
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-900 shadow-sm"
        }`}
        aria-label="Reset Timer"
        title="Reset"
      >
        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}
