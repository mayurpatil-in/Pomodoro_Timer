import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import {
  Target,
  CheckSquare,
  Clock,
  Flame,
  PlayCircle,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Activity,
  Droplet,
  Settings,
  EyeOff,
  Eye,
  GripVertical,
  BarChart2,
  Briefcase,
  FolderKanban,
  Rocket,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Column span per widget ───────────────────────────────────────────────────
const WIDGET_COLS = {
  "stat-pomodoros": "col-span-1",
  "stat-focus": "col-span-1",
  "stat-productivity": "col-span-1",
  "stat-tasks": "col-span-1",
  "stat-goal-ring": "col-span-1",
  timer: "sm:col-span-2 lg:col-span-2",
  finance: "sm:col-span-2 lg:col-span-2",
  bills: "sm:col-span-2 lg:col-span-2",
  tasks: "sm:col-span-2 lg:col-span-2",
  gym: "col-span-1",
  goal: "col-span-1",
  routine: "col-span-1",
  weekly_chart: "sm:col-span-2 lg:col-span-4",
  goals_widget: "sm:col-span-2 lg:col-span-2",
  interviews_widget: "sm:col-span-2 lg:col-span-2",
  projects_widget: "sm:col-span-2 lg:col-span-2",
};

const DEFAULT_LAYOUT = [
  "stat-pomodoros",
  "stat-focus",
  "stat-productivity",
  "stat-tasks",
  "stat-goal-ring",
  "timer",
  "finance",
  "bills",
  "tasks",
  "gym",
  "goal",
  "routine",
  "weekly_chart",
  "goals_widget",
  "interviews_widget",
  "projects_widget",
];

// ── Sortable wrapper ─────────────────────────────────────────────────────────
function SortableWidget({
  id,
  isEditing,
  isHidden,
  onToggleHide,
  darkMode,
  children,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  if (isHidden && !isEditing) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative h-full ${WIDGET_COLS[id] || "col-span-1"} ${
        isHidden ? "opacity-40 grayscale" : ""
      }`}
    >
      {/* Edit-mode overlay controls */}
      {isEditing && (
        <div
          className={`absolute top-2 right-2 z-50 flex items-center gap-1 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg border ${
            darkMode
              ? "bg-slate-700/95 border-slate-600 text-slate-200"
              : "bg-white/95 border-slate-200 text-slate-700"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide(id);
            }}
            className={`p-1 rounded-lg transition-colors ${
              darkMode ? "hover:text-indigo-400" : "hover:text-indigo-600"
            }`}
            title={isHidden ? "Show" : "Hide"}
          >
            {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <div
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors ${
              darkMode ? "hover:text-indigo-400" : "hover:text-indigo-600"
            }`}
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </div>
        </div>
      )}

      {/* Content wrapper — disable pointer events while editing so drags work */}
      <div className={`${isEditing ? "pointer-events-none" : ""} h-full`}>
        {children}
      </div>
    </div>
  );
}

// ── Stat mini-card (used inside renderContent) ────────────────────────────────
function MiniStat({
  title,
  value,
  icon,
  trend,
  trendLabel,
  colorClass,
  darkMode,
}) {
  return (
    <div
      className={`flex flex-col p-5 rounded-2xl border h-full transition-all hover:shadow-lg ${
        darkMode
          ? "bg-slate-900/40 border-white/5 shadow-black/20 relative overflow-hidden group"
          : "bg-white border-slate-100 shadow-slate-200/50"
      }`}
    >
      {darkMode && (
        <div
          className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20 ${colorClass}`}
        />
      )}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3
            className={`text-xs font-semibold tracking-wider uppercase mb-1 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {title}
          </h3>
          <div
            className={`text-2xl font-bold font-inter tracking-tight ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {value}
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${colorClass} ${
            darkMode ? "shadow-black/30 ring-1 ring-white/10" : ""
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
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
          className={`text-xs font-medium font-outfit ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {trendLabel}
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ darkMode }) {
  const { user, api, updateDashboardPreferences } = useAuth();
  const { settings } = useSettings();

  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [taskStats, setTaskStats] = useState({ pending: 0, completed: 0 });
  const [sessionCount, setSessionCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [todayRoutine, setTodayRoutine] = useState([]);
  const [financeData, setFinanceData] = useState({ income: 0, expense: 0 });
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [gymData, setGymData] = useState({
    water_glasses: 0,
    pushups: 0,
    pullups: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [goalsData, setGoalsData] = useState({
    total: 0,
    active: 0,
    done: 0,
    streaks: [],
    recent_active: [],
  });
  const [interviewsData, setInterviewsData] = useState({
    total: 0,
    pipeline: {},
    offers: 0,
    upcoming_interviews: [],
  });
  const [projectsData, setProjectsData] = useState({
    total: 0,
    active: 0,
    recent: [],
  });
  const [productivityData, setProductivityData] = useState({
    score: 0,
    points: 0,
    target: 100,
  });

  // ── Load preferences ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.dashboard_preferences) {
      try {
        const prefs =
          typeof user.dashboard_preferences === "string"
            ? JSON.parse(user.dashboard_preferences)
            : user.dashboard_preferences;

        if (Array.isArray(prefs.layout) && prefs.layout.length > 0) {
          // Merge: keep saved order, but add any NEW default IDs at the end
          const saved = prefs.layout;
          const missing = DEFAULT_LAYOUT.filter((id) => !saved.includes(id));
          setLayout([...saved, ...missing]);
        }
        if (Array.isArray(prefs.hiddenWidgets))
          setHiddenWidgets(prefs.hiddenWidgets);
      } catch (e) {
        console.error("Failed to parse dashboard preferences", e);
      }
    }
  }, [user?.dashboard_preferences]);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user && api) {
      const d = new Date();
      const localISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      api
        .get(`/dashboard/summary?local_iso_date=${localISO}`)
        .then((res) => {
          const data = res.data;
          setTaskStats(data.tasks.stats);
          setPendingTasks(data.tasks.pending_preview);
          setSessionCount(data.today_pomodoros);
          setTodayRoutine(data.routine);
          setGymData(data.gym);
          setFinanceData(data.finance);
          setUpcomingBills(data.upcoming_bills);
          if (data.weekly_sessions) setWeeklyData(data.weekly_sessions);
          if (data.goals) setGoalsData(data.goals);
          if (data.interviews) setInterviewsData(data.interviews);
          if (data.projects) setProjectsData(data.projects);
          if (data.productivity) setProductivityData(data.productivity);
        })
        .catch(console.error);
    }
  }, [user, api]);

  // ── DnD ────────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setLayout((prev) => {
        const oldIdx = prev.indexOf(active.id);
        const newIdx = prev.indexOf(over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const toggleHide = (id) =>
    setHiddenWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );

  const saveLayout = async () => {
    setIsEditing(false);
    await updateDashboardPreferences(JSON.stringify({ layout, hiddenWidgets }));
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const focusHours = ((sessionCount * 25) / 60).toFixed(1);
  const formatINR = (v) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);

  // ── Widget renderer ────────────────────────────────────────────────────────
  const renderContent = (id) => {
    switch (id) {
      /* ── Stat cards ── */
      case "stat-pomodoros":
        return (
          <MiniStat
            key={id}
            title="Today's Pomodoros"
            value={`${sessionCount}`}
            icon={<Target size={20} />}
            trend={12}
            trendLabel="vs last week"
            colorClass="bg-emerald-500"
            darkMode={darkMode}
          />
        );
      case "stat-focus":
        return (
          <MiniStat
            key={id}
            title="Focus Time"
            value={`${focusHours}h`}
            icon={<Clock size={20} />}
            trend={5}
            trendLabel="vs yesterday"
            colorClass="bg-indigo-500"
            darkMode={darkMode}
          />
        );
      case "stat-tasks":
        return (
          <MiniStat
            key={id}
            title="Pending Tasks"
            value={taskStats.pending}
            icon={<CheckSquare size={20} />}
            trend={-2}
            trendLabel="vs yesterday"
            colorClass="bg-rose-500"
            darkMode={darkMode}
          />
        );
      case "stat-productivity":
        return (
          <div
            key={id}
            className={`flex items-center justify-between p-5 rounded-2xl border h-full transition-all hover:shadow-lg ${
              darkMode
                ? "bg-slate-900/40 border-white/5 shadow-black/20"
                : "bg-white border-slate-100 shadow-slate-200/50"
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3
                  className={`text-xs font-semibold tracking-wider uppercase mb-1 flex items-center gap-1.5 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <Rocket size={14} className="text-amber-500" />
                  Productivity
                </h3>
                <div
                  className={`text-3xl font-bold font-inter tracking-tight flex items-baseline gap-1.5 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {productivityData.score}
                  <span
                    className={`text-sm font-outfit uppercase tracking-wider font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Score
                  </span>
                </div>
              </div>
              <div className="mt-auto">
                <p
                  className={`text-[10px] uppercase font-semibold font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  <span
                    className={darkMode ? "text-amber-400" : "text-amber-600"}
                  >
                    {productivityData.points}
                  </span>{" "}
                  pts today
                </p>
              </div>
            </div>

            <div className="relative w-16 h-16 flex-shrink-0">
              <svg
                className="w-full h-full -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  strokeWidth="8"
                  className={darkMode ? "stroke-slate-800" : "stroke-slate-100"}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (productivityData.score / 100) * 264}
                  className={`transition-all duration-1000 ${
                    productivityData.score >= 100
                      ? "stroke-emerald-500"
                      : productivityData.score >= 50
                        ? "stroke-amber-500"
                        : "stroke-rose-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      case "stat-goal-ring":
        return (
          <MiniStat
            key={id}
            title="Daily Goal"
            value={`${sessionCount} / ${user?.daily_goal || 8}`}
            icon={<Flame size={20} />}
            trend={
              sessionCount >= (user?.daily_goal || 8)
                ? 100
                : Math.round((sessionCount / (user?.daily_goal || 8)) * 100)
            }
            trendLabel="completion"
            colorClass="bg-amber-500"
            darkMode={darkMode}
          />
        );

      /* ── Full widgets ── */
      case "timer":
        return (
          <Link
            key={id}
            to="/timer"
            className={`group h-full w-full relative rounded-2xl p-6 border overflow-hidden flex items-center justify-between transition-all hover:shadow-xl ${
              darkMode
                ? "bg-slate-900/50 border-white/5 hover:border-indigo-500/50"
                : "bg-white border-slate-100 hover:border-indigo-200"
            }`}
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-indigo-500/20" />
            <div className="relative z-10 flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  darkMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <PlayCircle size={32} />
              </div>
              <div>
                <h3
                  className={`font-inter font-bold text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  Start Focus Session
                </h3>
                <p
                  className={`text-sm font-outfit mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {settings?.focusDuration || 25} min focus ·{" "}
                  {settings?.shortBreak || 5} min break
                </p>
              </div>
            </div>
            <div
              className={`relative z-10 rounded-full p-2.5 transition-colors ${
                darkMode
                  ? "bg-white/5 group-hover:bg-white/10 text-white"
                  : "bg-slate-50 group-hover:bg-indigo-50 text-indigo-600"
              }`}
            >
              <PlayCircle size={22} className="ml-0.5" />
            </div>
          </Link>
        );

      case "finance":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <Wallet size={20} />
                </div>
                <h3
                  className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  Monthly Finances
                </h3>
              </div>
              <Link
                to="/finances"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-slate-50 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                View Tracker
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
              <div className="flex flex-col">
                <span
                  className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Income
                </span>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span
                    className={`font-bold font-inter text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {formatINR(financeData.income)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Expense
                </span>
                <div className="flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-rose-500" />
                  <span
                    className={`font-bold font-inter text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {formatINR(financeData.expense)}
                  </span>
                </div>
              </div>
              <div
                className={`flex flex-col col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4 ${darkMode ? "border-white/10" : "border-slate-200"}`}
              >
                <span
                  className={`text-xs uppercase tracking-wider font-semibold mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Net Balance
                </span>
                <span
                  className={`font-bold font-inter text-lg ${
                    financeData.income - financeData.expense >= 0
                      ? darkMode
                        ? "text-emerald-400"
                        : "text-emerald-600"
                      : darkMode
                        ? "text-rose-400"
                        : "text-rose-600"
                  }`}
                >
                  {formatINR(financeData.income - financeData.expense)}
                </span>
              </div>
            </div>
          </div>
        );

      case "bills":
        if (upcomingBills.length === 0 && !isEditing) return null;
        return (
          <div
            key={id}
            className={`rounded-xl border p-5 h-full w-full flex flex-col gap-3 shadow-lg ${
              darkMode
                ? "bg-rose-500/10 border-rose-500/20"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                size={18}
                className={darkMode ? "text-rose-400" : "text-rose-600"}
              />
              <h4
                className={`font-semibold font-inter ${darkMode ? "text-rose-400" : "text-rose-600"}`}
              >
                Upcoming Bills
              </h4>
              {upcomingBills.length === 0 && isEditing && (
                <span className="text-xs text-rose-500 italic ml-2">
                  (empty — hidden normally)
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900/40 border-rose-500/10"
                      : "bg-white border-rose-100"
                  }`}
                >
                  <div>
                    <p
                      className={`font-medium text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                    >
                      {bill.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Due{" "}
                      {bill.daysLeft === 0
                        ? "Today"
                        : `in ${bill.daysLeft} days`}{" "}
                      ({bill.due_date}th)
                    </p>
                  </div>
                  <span
                    className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {formatINR(bill.used)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "tasks":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                Pending Tasks
              </h3>
              <Link
                to="/tasks"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-slate-50 text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                View All
              </Link>
            </div>
            <div className="flex-1">
              {pendingTasks.length === 0 ? (
                <p
                  className={`text-sm font-outfit italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  No pending tasks. You're all caught up!
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingTasks.map((task) => (
                    <Link
                      key={task.id}
                      to="/tasks"
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        darkMode
                          ? "bg-slate-800/40 border-white/5 hover:border-white/10 hover:bg-slate-800/80"
                          : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <CheckSquare
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                        >
                          {task.title}
                        </p>
                        <p
                          className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${
                            task.priority === "high"
                              ? "text-red-500"
                              : task.priority === "medium"
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {task.priority}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "gym":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                Gym & Fitness
              </h3>
              <Link
                to="/gym"
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-50 text-slate-500 hover:text-indigo-600"}`}
              >
                <Activity size={16} />
              </Link>
            </div>
            <div className="flex items-center justify-between gap-2 flex-1">
              {[
                {
                  icon: <Droplet size={18} className="text-blue-500 mb-1" />,
                  val: gymData.water_glasses,
                  label: "Water",
                },
                {
                  icon: <Flame size={18} className="text-orange-500 mb-1" />,
                  val: gymData.pushups,
                  label: "Pushups",
                },
                {
                  icon: <Activity size={18} className="text-indigo-500 mb-1" />,
                  val: gymData.pullups,
                  label: "Pullups",
                },
              ].map(({ icon, val, label }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl flex-1 border ${
                    darkMode
                      ? "bg-slate-800/50 border-white/5"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  {icon}
                  <span
                    className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {val}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-semibold font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "goal":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col items-center justify-center text-center ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <h3
              className={`font-inter font-bold text-base w-full text-left mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Daily Goal
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center mb-3">
              <svg
                className="w-full h-full transform -rotate-90 drop-shadow-md"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeWidth="8"
                  className={darkMode ? "stroke-slate-800" : "stroke-slate-100"}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    251.2 -
                    Math.min(sessionCount / (user?.daily_goal || 8), 1) * 251.2
                  }
                  className={`transition-all duration-1000 ${sessionCount >= (user?.daily_goal || 8) ? "stroke-emerald-500" : "stroke-indigo-500"}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  {sessionCount}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  / {user?.daily_goal || 8}
                </span>
              </div>
            </div>
            <p
              className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {sessionCount >= (user?.daily_goal || 8) ? (
                <span
                  className={darkMode ? "text-emerald-400" : "text-emerald-600"}
                >
                  Awesome! Goal reached 🎉
                </span>
              ) : (
                `${(user?.daily_goal || 8) - sessionCount} more sessions to go`
              )}
            </p>
          </div>
        );

      case "routine":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                Today's Routine
              </h3>
              <Link
                to="/routine"
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-50 text-slate-500 hover:text-indigo-600"}`}
              >
                <Calendar size={16} />
              </Link>
            </div>
            <div className="flex-1">
              {todayRoutine.length === 0 ? (
                <p
                  className={`text-sm font-outfit italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  No habits planned for today.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayRoutine.slice(0, 4).map((r, i) => (
                    <Link
                      key={i}
                      to="/routine"
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        darkMode
                          ? "border-white/5 bg-slate-800/30 hover:bg-slate-800/80"
                          : "border-slate-50 bg-slate-50/50 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full shadow-sm ${r.completed ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      <span
                        className={`text-sm flex-1 truncate font-medium ${
                          r.completed
                            ? darkMode
                              ? "text-slate-500 line-through"
                              : "text-slate-400 line-through"
                            : darkMode
                              ? "text-slate-200"
                              : "text-slate-700"
                        }`}
                      >
                        {r.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold font-outfit px-1.5 py-0.5 rounded-md ${darkMode ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}
                      >
                        {r.slot}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      /* ── Weekly Focus Chart ── */
      case "weekly_chart": {
        const todayStr = new Date().toISOString().slice(0, 10);
        const chartData = weeklyData.map((d) => ({
          day: new Date(d.date + "T12:00:00Z").toLocaleDateString("en-US", {
            weekday: "short",
          }),
          count: d.count,
          date: d.date,
        }));
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
                >
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3
                    className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Weekly Focus
                  </h3>
                  <p
                    className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Sessions over the last 7 days
                  </p>
                </div>
              </div>
              <Link
                to="/analytics"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-50 text-indigo-600 hover:bg-indigo-50"}`}
              >
                Full Analytics
              </Link>
            </div>
            <div className="flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: darkMode ? "#64748b" : "#94a3b8",
                      fontFamily: "Outfit",
                    }}
                  />
                  <YAxis hide allowDecimals={false} />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#0f172a" : "#fff",
                      borderColor: darkMode ? "#334155" : "#e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: darkMode ? "#fff" : "#000",
                    }}
                    cursor={{
                      fill: darkMode
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.03)",
                      radius: 8,
                    }}
                    formatter={(v) => [`${v} sessions`, "Focus"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.date}
                        fill={
                          entry.date === todayStr
                            ? "#6366f1"
                            : darkMode
                              ? "#312e81"
                              : "#c7d2fe"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      /* ── Active Goals ── */
      case "goals_widget":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"}`}
                >
                  <Rocket size={18} />
                </div>
                <div>
                  <h3
                    className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Active Goals
                  </h3>
                  <p
                    className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {goalsData.active} active · {goalsData.done} done
                  </p>
                </div>
              </div>
              <Link
                to="/goals"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-50 text-amber-600 hover:bg-amber-50"}`}
              >
                View All
              </Link>
            </div>
            {goalsData.streaks.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {goalsData.streaks.map((g, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`}
                  >
                    <Flame size={12} className="animate-pulse" /> {g.streak}d –{" "}
                    {g.title.slice(0, 18)}
                    {g.title.length > 18 ? "…" : ""}
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3 flex-1">
              {goalsData.recent_active.length === 0 ? (
                <p
                  className={`text-sm italic font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  No active goals. Create one!
                </p>
              ) : (
                goalsData.recent_active.map((g) => {
                  const pct =
                    g.steps_total > 0
                      ? Math.round((g.steps_done / g.steps_total) * 100)
                      : 0;
                  return (
                    <Link
                      to="/goals"
                      key={g.id}
                      className={`rounded-xl border p-3 transition-all flex flex-col gap-2 ${darkMode ? "border-white/5 bg-slate-800/30 hover:bg-slate-800/60" : "border-slate-100 bg-slate-50/50 hover:bg-white"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold flex-1 truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                        >
                          {g.title}
                        </p>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${g.priority === "high" ? "text-rose-500 bg-rose-500/10" : g.priority === "medium" ? "text-amber-500 bg-amber-500/10" : "text-slate-500 bg-slate-500/10"}`}
                        >
                          {g.priority}
                        </span>
                      </div>
                      {g.steps_total > 0 && (
                        <div>
                          <div
                            className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
                          >
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p
                            className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {g.steps_done}/{g.steps_total} steps · {pct}%
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );

      /* ── Interview Pipeline ── */
      case "interviews_widget": {
        const STAGES = [
          "Applied",
          "HR Round",
          "Technical Round",
          "Final Round",
          "Offer",
          "Rejected",
        ];
        const STAGE_COLORS = {
          Applied: "bg-indigo-500",
          "HR Round": "bg-blue-500",
          "Technical Round": "bg-purple-500",
          "Final Round": "bg-amber-500",
          Offer: "bg-emerald-500",
          Rejected: "bg-rose-500",
        };
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                >
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3
                    className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Interview Pipeline
                  </h3>
                  <p
                    className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {interviewsData.total} applications ·{" "}
                    {interviewsData.offers} offer
                    {interviewsData.offers !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Link
                to="/interviews"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-50 text-purple-600 hover:bg-purple-50"}`}
              >
                View Board
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {STAGES.map((s) => (
                <div
                  key={s}
                  className={`flex flex-col items-center p-2 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mb-1 ${STAGE_COLORS[s]}`}
                  />
                  <span
                    className={`text-lg font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {interviewsData.pipeline[s] || 0}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-semibold font-outfit text-center leading-tight ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {s.replace(" Round", "")}
                  </span>
                </div>
              ))}
            </div>
            {interviewsData.upcoming_interviews.length > 0 && (
              <div
                className={`rounded-xl p-3 border ${darkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}
              >
                <p
                  className={`text-[10px] uppercase font-bold mb-2 ${darkMode ? "text-amber-400" : "text-amber-600"}`}
                >
                  📅 Upcoming Interviews
                </p>
                <div className="flex flex-col gap-1.5">
                  {interviewsData.upcoming_interviews.map((iv) => (
                    <div key={iv.id} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${iv.days_left === 0 ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/15 text-blue-500"}`}
                      >
                        {iv.days_left === 0 ? "Today" : `+${iv.days_left}d`}
                      </span>
                      <span
                        className={`text-xs flex-1 truncate ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                      >
                        {iv.role} @ {iv.company}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      /* ── Projects ── */
      case "projects_widget":
        return (
          <div
            key={id}
            className={`rounded-2xl border p-6 h-full w-full flex flex-col ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <FolderKanban size={18} />
                </div>
                <div>
                  <h3
                    className={`font-inter font-bold text-base ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Projects
                  </h3>
                  <p
                    className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {projectsData.active} active of {projectsData.total} total
                  </p>
                </div>
              </div>
              <Link
                to="/projects"
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-50 text-emerald-600 hover:bg-emerald-50"}`}
              >
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {projectsData.recent.length === 0 ? (
                <p
                  className={`text-sm italic font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  No active projects. Start one!
                </p>
              ) : (
                projectsData.recent.map((p) => {
                  const pct =
                    p.total_tasks > 0
                      ? Math.round((p.done_tasks / p.total_tasks) * 100)
                      : 0;
                  const statusColors = {
                    "in-progress": "text-blue-500",
                    review: "text-amber-500",
                    completed: "text-emerald-500",
                  };
                  return (
                    <Link
                      to="/projects"
                      key={p.id}
                      className={`rounded-xl border p-3 transition-all flex flex-col gap-2 ${darkMode ? "border-white/5 bg-slate-800/30 hover:bg-slate-800/60" : "border-slate-100 bg-slate-50/50 hover:bg-white"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.color && (
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                          )}
                          <p
                            className={`text-sm font-semibold truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                          >
                            {p.name}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold flex-shrink-0 ${statusColors[p.status] || "text-slate-500"}`}
                        >
                          {p.status.replace("-", " ")}
                        </span>
                      </div>
                      {p.total_tasks > 0 && (
                        <div>
                          <div
                            className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
                          >
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p
                            className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {p.done_tasks}/{p.total_tasks} tasks · {pct}%
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div
        className={`relative w-full rounded-2xl p-8 overflow-hidden shadow-lg ${
          darkMode
            ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"
        }`}
      >
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 translate-y-12 -translate-x-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-inter text-white mb-2 tracking-tight">
            Welcome back, {user?.email?.split("@")[0] || "User"}{" "}
            <span className="inline-block animate-wave origin-bottom-right">
              👋
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-white/80 font-outfit text-sm">
              Here's what's happening in your{" "}
              <span className="font-semibold underline decoration-white/30 underline-offset-4">
                Focus Sessions
              </span>{" "}
              today.
            </p>
            <button
              onClick={isEditing ? saveLayout : () => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-md transition-all border border-white/5 shadow-sm w-fit"
            >
              <Settings size={15} className={isEditing ? "animate-spin" : ""} />
              {isEditing ? "Save Layout" : "Customize Dashboard"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit mode banner */}
      {isEditing && (
        <div
          className={`flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border text-sm font-medium ${
            darkMode
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
              : "bg-indigo-50 border-indigo-200 text-indigo-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <GripVertical size={16} className="opacity-70" />
            <span>
              Drag any card to reorder · click the{" "}
              <Eye size={13} className="inline" /> icon to hide/show · click{" "}
              <strong>Save Layout</strong> when done.
            </span>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs opacity-70 hover:opacity-100 underline underline-offset-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Unified sortable grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={layout} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
            {layout.map((id) => {
              const content = renderContent(id);
              // Some widgets return null (e.g., bills when empty). Still keep the sortable wrapper for edit mode.
              if (!content && !isEditing) return null;
              return (
                <SortableWidget
                  key={id}
                  id={id}
                  isEditing={isEditing}
                  isHidden={hiddenWidgets.includes(id)}
                  onToggleHide={toggleHide}
                  darkMode={darkMode}
                >
                  {content || (
                    <div
                      className={`h-full min-h-[80px] rounded-2xl border border-dashed flex items-center justify-center text-sm font-medium ${
                        darkMode
                          ? "border-white/10 text-slate-600"
                          : "border-slate-200 text-slate-400"
                      }`}
                    >
                      (empty widget)
                    </div>
                  )}
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
