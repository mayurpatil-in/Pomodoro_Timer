import { useState, useEffect } from "react";
import TaskList from "../components/TaskList";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { Target, CheckSquare, Clock, Flame } from "lucide-react";

export default function Dashboard({ darkMode }) {
  const { user, api } = useAuth();

  const [taskStats, setTaskStats] = useState({ pending: 0, completed: 0 });
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (user && api) {
      // Fetch Tasks
      api
        .get("/tasks")
        .then((res) => {
          const tasks = res.data;
          setTaskStats({
            completed: tasks.filter((t) => t.is_completed).length,
            pending: tasks.filter((t) => !t.is_completed).length,
          });
        })
        .catch(console.error);

      // Fetch Today's Session Counts
      api
        .get("/sessions/stats/today")
        .then((res) => {
          setSessionCount(res.data.total_sessions || 0);
        })
        .catch(console.error);
    }
  }, [user, api]);

  // Calculate Focus Time
  const focusTimeHours = ((sessionCount * 25) / 60).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome Banner ── */}
      <div
        className={`relative w-full rounded-2xl p-8 overflow-hidden shadow-lg ${
          darkMode
            ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 translate-y-12 -translate-x-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-inter text-white mb-2 tracking-tight">
            Welcome back, {user?.email?.split("@")[0] || "User"}{" "}
            <span className="inline-block animate-wave origin-bottom-right">
              👋
            </span>
          </h2>
          <p className="text-white/80 font-outfit text-sm">
            Here's what's happening in your{" "}
            <span className="font-semibold underline decoration-white/30 underline-offset-4">
              Focus Sessions
            </span>{" "}
            today.
          </p>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Pomodoros"
          value={`${sessionCount}`}
          icon={<Target size={24} />}
          trend={12}
          trendLabel="vs last week"
          colorClass="bg-emerald-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Focus Time"
          value={`${focusTimeHours}h`}
          icon={<Clock size={24} />}
          trend={5}
          trendLabel="vs yesterday"
          colorClass="bg-indigo-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Pending Tasks"
          value={taskStats.pending}
          icon={<CheckSquare size={24} />}
          trend={-2}
          trendLabel="vs yesterday"
          colorClass="bg-rose-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Daily Goal"
          value={`${sessionCount} / ${user?.daily_goal || 8}`}
          icon={<Flame size={24} />}
          trend={sessionCount >= (user?.daily_goal || 8) ? 100 : 0}
          trendLabel="completion"
          colorClass="bg-amber-500"
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
