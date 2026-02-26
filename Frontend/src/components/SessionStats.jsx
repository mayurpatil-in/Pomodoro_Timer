import { useState, useEffect } from "react";
import { Target, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SessionStats({ sessionCount, darkMode, mode }) {
  const isPomo = mode === "pomodoro";
  const { user, updateDailyGoal } = useAuth();

  // Daily Goal Logic
  const dailyGoal = user?.daily_goal || 8;

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  // Sync tempGoal with user's actual goal when user loads
  useEffect(() => {
    if (user) {
      setTempGoal(user.daily_goal);
    }
  }, [user]);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    const val = Math.max(1, parseInt(tempGoal, 10) || 8);
    await updateDailyGoal(val);
    setIsEditingGoal(false);
  };

  const dotActive = isPomo
    ? "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
    : "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]";
  const goalProgress = Math.min(
    100,
    Math.round((sessionCount / dailyGoal) * 100),
  );

  return (
    <div
      className={`w-full px-6 py-5 rounded-2xl border transition-colors duration-500 ${
        darkMode
          ? "bg-slate-900/50 border-white/6 backdrop-blur-md"
          : "bg-white/60 border-black/8 backdrop-blur-md shadow-sm"
      }`}
    >
      {/* Top Header: Total & Daily Goal */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span
            className={`text-[10px] font-outfit font-semibold tracking-[0.2em] uppercase flex items-center gap-1.5 mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <TrendingUp size={12} /> Today's Focus
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-bold font-inter leading-none ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {sessionCount}
            </span>
            <span
              className={`text-xs font-normal font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              sessions
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span
            className={`text-[10px] font-outfit font-semibold tracking-[0.2em] uppercase flex items-center gap-1.5 mb-1 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <Target size={12} /> Daily Goal
          </span>

          {isEditingGoal ? (
            <form onSubmit={handleGoalSubmit} className="flex justify-end mt-1">
              <input
                type="number"
                min="1"
                max="50"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                autoFocus
                onBlur={handleGoalSubmit}
                className={`w-14 px-2 py-0.5 text-center text-sm font-bold border rounded outline-none ${
                  darkMode
                    ? "bg-slate-800 text-white border-white/20 focus:border-blue-400"
                    : "bg-white text-slate-900 border-black/20 focus:border-blue-500"
                }`}
              />
            </form>
          ) : (
            <div
              onClick={() => setIsEditingGoal(true)}
              className="group cursor-pointer flex items-center justify-end gap-1.5 mt-0.5"
              title="Click to edit daily goal"
            >
              <span
                className={`text-2xl font-bold font-inter leading-none transition-colors ${
                  darkMode
                    ? "text-slate-300 group-hover:text-white"
                    : "text-slate-700 group-hover:text-black"
                }`}
              >
                {dailyGoal}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Goal Progress Bar */}
      <div
        className={`w-full h-1.5 rounded-full mb-5 overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}
      >
        <div
          className={`h-full transition-all duration-1000 ease-out ${isPomo ? "bg-blue-500" : "bg-purple-500"}`}
          style={{
            width: `${goalProgress}%`,
            boxShadow: `0 0 10px ${isPomo ? "rgba(59,130,246,0.5)" : "rgba(168,85,247,0.5)"}`,
          }}
        />
      </div>

      {/* 4 dots = 1 pomodoro cycle (current cycle tracking) */}
      <div className="flex flex-col items-center">
        <span
          className={`text-[10px] font-outfit uppercase tracking-[0.25em] font-semibold mb-2 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          Current Cycle
        </span>
        <div className="flex items-center gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => {
            const filled =
              sessionCount % 4 > i ||
              (sessionCount > 0 && sessionCount % 4 === 0);
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-400 ${
                  filled
                    ? dotActive
                    : darkMode
                      ? "bg-slate-700"
                      : "bg-slate-200"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
