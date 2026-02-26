import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Target,
  Flame,
  Clock,
  Trophy,
  Save,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const DAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
];

const TODAY_KEY =
  DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.key;

const DEFAULT_GOALS = {
  dailySessions: 8,
  weeklyFocusHours: 20,
  dailyFocusHours: 4,
  schedule: {
    mon: { enabled: true, sessions: 8, focusHours: 4 },
    tue: { enabled: true, sessions: 8, focusHours: 4 },
    wed: { enabled: true, sessions: 8, focusHours: 4 },
    thu: { enabled: true, sessions: 8, focusHours: 4 },
    fri: { enabled: true, sessions: 8, focusHours: 4 },
    sat: { enabled: false, sessions: 4, focusHours: 2 },
    sun: { enabled: false, sessions: 4, focusHours: 2 },
  },
};

function loadGoals() {
  try {
    const s = localStorage.getItem("pomofocusGoals");
    return s
      ? {
          ...DEFAULT_GOALS,
          ...JSON.parse(s),
          schedule: { ...DEFAULT_GOALS.schedule, ...JSON.parse(s).schedule },
        }
      : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

function StatBubble({ icon, label, value, sub, color, darkMode }) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} `}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {label}
        </p>
        <p
          className={`text-2xl font-bold font-inter mt-0.5 ${darkMode ? "text-white" : "text-slate-900"}`}
        >
          {value}
        </p>
        <p
          className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

function NumberStepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
  darkMode,
  accent = "indigo",
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${darkMode ? "border-white/10 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5" : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-700"}`}
      >
        −
      </button>
      <div
        className={`min-w-[64px] text-center px-3 py-1.5 rounded-xl border text-sm font-bold font-inter tabular-nums ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
      >
        {value}
        <span className="text-xs font-normal opacity-60 ml-0.5">{unit}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className={`w-8 h-8 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${darkMode ? "border-white/10 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5" : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-700"}`}
      >
        +
      </button>
    </div>
  );
}

export default function GoalsPage({ darkMode }) {
  const { user, api, updateDailyGoal } = useAuth();
  const [goals, setGoals] = useState(loadGoals);
  const [saved, setSaved] = useState(false);
  const [todayStats, setTodayStats] = useState({ today_pomodoros: 0 });
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (api) {
      Promise.all([
        api.get("/sessions/stats/today"),
        api.get("/sessions/stats/weekly"),
      ])
        .then(([todayRes, weeklyRes]) => {
          setTodayStats(todayRes.data);
          setWeeklyData(weeklyRes.data);
        })
        .catch(console.error);
    }
  }, [api]);

  const todayGoal = goals.schedule[TODAY_KEY] || {
    sessions: goals.dailySessions,
    focusHours: goals.dailyFocusHours,
  };
  const todaySessions = todayStats.today_pomodoros ?? 0;
  const todayFocusHours = (todaySessions * 25) / 60;
  const weekTotalSessions = weeklyData.reduce((s, d) => s + d.count, 0);
  const weekFocusHours = (weekTotalSessions * 25) / 60;

  const handleSave = async () => {
    localStorage.setItem("pomofocusGoals", JSON.stringify(goals));
    // Sync daily_goal to backend
    await updateDailyGoal(goals.dailySessions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setGoals(DEFAULT_GOALS);
    localStorage.setItem("pomofocusGoals", JSON.stringify(DEFAULT_GOALS));
  };

  const updateSchedule = (day, field, value) => {
    setGoals((g) => ({
      ...g,
      schedule: {
        ...g.schedule,
        [day]: { ...g.schedule[day], [field]: value },
      },
    }));
  };

  const toggleDay = (day) => {
    setGoals((g) => ({
      ...g,
      schedule: {
        ...g.schedule,
        [day]: { ...g.schedule[day], enabled: !g.schedule[day].enabled },
      },
    }));
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${darkMode ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" : "bg-amber-100 text-amber-600"}`}
          >
            <Target size={22} />
          </div>
          <div>
            <h2
              className={`text-2xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              My Goals
            </h2>
            <p
              className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Set your focus targets day by day
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-outfit border transition-all ${darkMode ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5" : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium font-outfit text-white transition-all shadow-md ${saved ? "bg-emerald-500 shadow-emerald-500/20" : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20"}`}
          >
            <Save size={14} />
            {saved ? "Saved!" : "Save Goals"}
          </button>
        </div>
      </div>

      {/* Today's Progress */}
      <div
        className={`rounded-2xl border p-6 ${darkMode ? "bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border-white/10" : "bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent"}`}
      >
        <div className="flex items-center gap-2 mb-5">
          <Flame size={18} className="text-white/80" />
          <h3 className="text-white font-bold font-inter text-base">
            Today's Progress
          </h3>
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded-full font-outfit font-medium ${darkMode ? "bg-white/10 text-white/70" : "bg-white/20 text-white"}`}
          >
            {DAYS.find((d) => d.key === TODAY_KEY)?.full}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Sessions progress */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-white/70 text-xs font-outfit mb-1 uppercase tracking-wider">
              Sessions
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold font-inter text-white">
                {todaySessions}
              </span>
              <span className="text-white/50 font-outfit text-sm mb-1">
                / {todayGoal.sessions}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (todaySessions / (todayGoal.sessions || 1)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-white/50 text-[10px] font-outfit mt-1.5">
              {todaySessions >= todayGoal.sessions
                ? "🎉 Goal reached!"
                : `${todayGoal.sessions - todaySessions} more to go`}
            </p>
          </div>
          {/* Focus time progress */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-white/70 text-xs font-outfit mb-1 uppercase tracking-wider">
              Focus Time
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold font-inter text-white">
                {todayFocusHours.toFixed(1)}
              </span>
              <span className="text-white/50 font-outfit text-sm mb-1">
                / {todayGoal.focusHours}h
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, (todayFocusHours / (todayGoal.focusHours || 1)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-white/50 text-[10px] font-outfit mt-1.5">
              {todayFocusHours >= todayGoal.focusHours
                ? "🎉 Goal reached!"
                : `${(todayGoal.focusHours - todayFocusHours).toFixed(1)}h more to go`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBubble
          icon={<Target size={20} className="text-indigo-500" />}
          label="Daily Target"
          value={goals.dailySessions}
          sub="sessions/day"
          color={darkMode ? "bg-indigo-500/10" : "bg-indigo-50"}
          darkMode={darkMode}
        />
        <StatBubble
          icon={<Clock size={20} className="text-blue-500" />}
          label="Daily Focus"
          value={`${goals.dailyFocusHours}h`}
          sub="per day"
          color={darkMode ? "bg-blue-500/10" : "bg-blue-50"}
          darkMode={darkMode}
        />
        <StatBubble
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          label="This Week"
          value={weekTotalSessions}
          sub={`${weekFocusHours.toFixed(1)}h focused`}
          color={darkMode ? "bg-emerald-500/10" : "bg-emerald-50"}
          darkMode={darkMode}
        />
        <StatBubble
          icon={<Trophy size={20} className="text-amber-500" />}
          label="Weekly Goal"
          value={`${goals.weeklyFocusHours}h`}
          sub="focus this week"
          color={darkMode ? "bg-amber-500/10" : "bg-amber-50"}
          darkMode={darkMode}
        />
      </div>

      {/* Global Defaults */}
      <div
        className={`rounded-2xl border p-6 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <h3
          className={`font-inter font-bold text-base mb-5 ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          Default Daily Targets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Focus Sessions
            </p>
            <NumberStepper
              value={goals.dailySessions}
              min={1}
              max={20}
              onChange={(v) => setGoals((g) => ({ ...g, dailySessions: v }))}
              unit=" 🍅"
              darkMode={darkMode}
            />
          </div>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Focus Hours
            </p>
            <NumberStepper
              value={goals.dailyFocusHours}
              min={0.5}
              max={12}
              step={0.5}
              onChange={(v) => setGoals((g) => ({ ...g, dailyFocusHours: v }))}
              unit="h"
              darkMode={darkMode}
            />
          </div>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Weekly Focus Hours
            </p>
            <NumberStepper
              value={goals.weeklyFocusHours}
              min={1}
              max={80}
              step={1}
              onChange={(v) => setGoals((g) => ({ ...g, weeklyFocusHours: v }))}
              unit="h"
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Day-Wise Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
          >
            Weekly Schedule
          </h3>
          <p
            className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            Customize goals per day
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {DAYS.map((day) => {
            const cfg = goals.schedule[day.key];
            const isToday = day.key === TODAY_KEY;
            const dayProgress = isToday
              ? Math.min(100, (todaySessions / (cfg.sessions || 1)) * 100)
              : 0;

            return (
              <div
                key={day.key}
                className={`rounded-2xl border p-4 transition-all ${
                  isToday
                    ? darkMode
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-indigo-200 bg-indigo-50/50"
                    : cfg.enabled
                      ? darkMode
                        ? "border-white/5 bg-slate-900/40 hover:bg-slate-800/40"
                        : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                      : darkMode
                        ? "border-white/5 bg-slate-900/20 opacity-50"
                        : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Day toggle + label */}
                  <div className="flex items-center gap-3 min-w-[80px]">
                    <button
                      onClick={() => toggleDay(day.key)}
                      className={`w-10 h-5.5 rounded-full transition-all duration-300 relative flex-shrink-0 ${cfg.enabled ? "bg-indigo-500" : darkMode ? "bg-slate-700" : "bg-slate-200"}`}
                      style={{ height: "22px", width: "40px" }}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${cfg.enabled ? "translate-x-[18px]" : "translate-x-0"}`}
                      />
                    </button>
                    <div>
                      <p
                        className={`text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        {day.label}
                      </p>
                      {isToday && (
                        <span className="text-[9px] font-outfit font-semibold text-indigo-400 uppercase tracking-wide">
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sessions stepper */}
                  <div className="flex-1 min-w-[180px]">
                    <p
                      className={`text-[10px] font-outfit font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                    >
                      Sessions
                    </p>
                    <NumberStepper
                      value={cfg.sessions}
                      min={0}
                      max={20}
                      onChange={(v) => updateSchedule(day.key, "sessions", v)}
                      unit=" 🍅"
                      darkMode={darkMode}
                    />
                  </div>

                  {/* Focus hours stepper */}
                  <div className="flex-1 min-w-[180px]">
                    <p
                      className={`text-[10px] font-outfit font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                    >
                      Focus Hours
                    </p>
                    <NumberStepper
                      value={cfg.focusHours}
                      min={0}
                      max={12}
                      step={0.5}
                      onChange={(v) => updateSchedule(day.key, "focusHours", v)}
                      unit="h"
                      darkMode={darkMode}
                    />
                  </div>

                  {/* Today progress bar */}
                  {isToday && (
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex justify-between items-center mb-1">
                        <p
                          className={`text-[10px] font-outfit font-semibold uppercase tracking-wider ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                        >
                          Progress
                        </p>
                        <span className="text-[10px] font-outfit text-indigo-400">
                          {dayProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div
                        className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${dayProgress >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                          style={{ width: `${dayProgress}%` }}
                        />
                      </div>
                      {dayProgress >= 100 && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2
                            size={10}
                            className="text-emerald-400"
                          />
                          <span className="text-[9px] font-outfit text-emerald-400">
                            Goal reached!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
