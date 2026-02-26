import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, Target, Clock, Flame, Award } from "lucide-react";

const DAY_LABELS = {
  Mon: true,
  Tue: true,
  Wed: true,
  Thu: true,
  Fri: true,
  Sat: true,
  Sun: true,
};

// Format a YYYY-MM-DD date to short weekday
function formatDay(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// Custom Bar tooltip
function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`px-3 py-2 rounded-xl border text-xs shadow-lg font-outfit ${
        darkMode
          ? "bg-slate-800 border-white/10 text-white"
          : "bg-white border-slate-200 text-slate-700"
      }`}
    >
      <p className="font-bold">{label}</p>
      <p className={darkMode ? "text-indigo-400" : "text-indigo-600"}>
        {payload[0].value} {payload[0].value === 1 ? "session" : "sessions"}
      </p>
    </div>
  );
}

export default function AnalyticsPage({ darkMode }) {
  const { api, user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayStats, setTodayStats] = useState({ total_sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weeklyRes, todayRes] = await Promise.all([
          api.get("/sessions/stats/weekly"),
          api.get("/sessions/stats/today"),
        ]);
        setWeeklyData(weeklyRes.data);
        setTodayStats(todayRes.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  // Derive summary stats from weekly data
  const totalWeekSessions = weeklyData.reduce((s, d) => s + d.count, 0);
  const totalWeekFocusMin = totalWeekSessions * 25;
  const bestDay = weeklyData.reduce(
    (best, d) => (d.count > (best?.count || 0) ? d : best),
    null,
  );
  const dailyGoal = user?.daily_goal || 8;
  const todayCount =
    todayStats?.today_pomodoros ?? todayStats?.total_sessions ?? 0;
  const goalPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  // Recharts data with weekday label
  const chartData = weeklyData.map((d) => ({
    day: formatDay(d.date),
    count: d.count,
    date: d.date,
  }));

  // Highlight today's bar
  const today = new Date().toISOString().slice(0, 10);

  const summaryCards = [
    {
      label: "This Week",
      value: totalWeekSessions,
      unit: "sessions",
      icon: <Target size={20} />,
      color: "text-emerald-500",
      bg: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
    },
    {
      label: "Focus Time",
      value:
        totalWeekFocusMin >= 60
          ? `${(totalWeekFocusMin / 60).toFixed(1)}h`
          : `${totalWeekFocusMin}m`,
      unit: "this week",
      icon: <Clock size={20} />,
      color: "text-indigo-500",
      bg: darkMode ? "bg-indigo-500/10" : "bg-indigo-50",
    },
    {
      label: "Best Day",
      value: bestDay ? formatDay(bestDay.date) : "–",
      unit: bestDay ? `${bestDay.count} sessions` : "no data",
      icon: <Award size={20} />,
      color: "text-amber-500",
      bg: darkMode ? "bg-amber-500/10" : "bg-amber-50",
    },
    {
      label: "Today's Goal",
      value: `${goalPct}%`,
      unit: `${todayCount} / ${dailyGoal}`,
      icon: <Flame size={20} />,
      color: goalPct >= 100 ? "text-emerald-500" : "text-rose-400",
      bg: darkMode ? "bg-rose-500/10" : "bg-rose-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            darkMode
              ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <TrendingUp size={22} />
        </div>
        <div>
          <h2
            className={`text-2xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Analytics
          </h2>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Your focus performance over the last 7 days
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 transition-all ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm shadow-slate-200/50"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {card.label}
            </p>
            <p
              className={`text-2xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {card.value}
            </p>
            <p
              className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
            >
              {card.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly Bar Chart */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          darkMode
            ? "bg-slate-900/40 border-white/5"
            : "bg-white border-slate-100 shadow-sm shadow-slate-200/50"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`font-inter font-bold text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Weekly Sessions
            </h3>
            <p
              className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Focus sessions completed per day (last 7 days)
            </p>
          </div>
          <div
            className={`flex items-center gap-2 text-xs font-outfit px-3 py-1.5 rounded-full ${
              darkMode
                ? "bg-indigo-500/10 text-indigo-400"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Focus Sessions
          </div>
        </div>

        {loading ? (
          <div
            className={`h-56 flex items-center justify-center text-sm font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            Loading chart data...
          </div>
        ) : totalWeekSessions === 0 ? (
          <div
            className={`h-56 flex flex-col items-center justify-center gap-3 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            <TrendingUp size={32} className="opacity-30" />
            <p className="text-sm font-outfit">
              No sessions recorded yet. Complete your first Pomodoro!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barCategoryGap="35%" barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"
                }
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{
                  fontSize: 12,
                  fontFamily: "Outfit",
                  fill: darkMode ? "#64748b" : "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                  fontFamily: "Outfit",
                  fill: darkMode ? "#64748b" : "#94a3b8",
                }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={<CustomTooltip darkMode={darkMode} />}
                cursor={{
                  fill: darkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                  radius: 8,
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={
                      entry.date === today
                        ? "#6366f1" // indigo for today
                        : darkMode
                          ? "#312e81" // deep indigo-900 for past days (dark)
                          : "#c7d2fe" // indigo-200 for past days (light)
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily Goal Progress */}
      <div
        className={`rounded-2xl border p-6 ${
          darkMode
            ? "bg-slate-900/40 border-white/5"
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <h3
          className={`font-inter font-bold text-base mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          Today's Goal Progress
        </h3>
        <p
          className={`text-xs font-outfit mb-5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {todayCount} of {dailyGoal} focus sessions completed today
        </p>

        <div
          className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${goalPct >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span
            className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            0
          </span>
          <span
            className={`text-xs font-outfit font-semibold ${goalPct >= 100 ? (darkMode ? "text-emerald-400" : "text-emerald-600") : darkMode ? "text-indigo-400" : "text-indigo-600"}`}
          >
            {goalPct >= 100 ? "🎉 Goal Reached!" : `${goalPct}%`}
          </span>
          <span
            className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            {dailyGoal}
          </span>
        </div>
      </div>
    </div>
  );
}
