import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Calendar,
  CalendarDays,
  Rocket,
  Trophy,
  Flag,
  ListChecks,
  ArrowRight,
  Loader2,
  Archive,
  GripVertical,
  BarChart3,
  Download,
  Bell,
  Settings2,
  Grid,
  Search,
  LayoutList,
  Link as LinkIcon,
  Image as ImageIcon,
  Pin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";

const transformImageUrl = (url) => {
  if (!url) return "";
  let trimmed = url.trim().split("?")[0].split("#")[0];

  // Handle local uploads
  if (trimmed.startsWith("/uploads/")) {
    return `http://${window.location.hostname}:5000${trimmed}`;
  }

  if (trimmed.includes("unsplash.com/photos/")) {
    const parts = trimmed.split("/");
    const lastPart = parts[parts.length - 1];
    const id = lastPart.split("-").pop();
    if (id && id.length >= 5) {
      return `https://source.unsplash.com/${id}`;
    }
  }
  return trimmed;
};

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDeadlineStatus(deadline) {
  if (!deadline) return null;
  // Use a date parsing trick to avoid timezone shifts:
  // deadline is "YYYY-MM-DD", appending "T00:00:00" ensures local parsing.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline + "T00:00:00");
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      icon: "⚠️",
    };
  if (diffDays === 0)
    return {
      text: "Due today",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: "⚡",
    };
  if (diffDays <= 3)
    return {
      text: `${diffDays}d left`,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: "⏳",
    };
  return {
    text: `${diffDays}d left`,
    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    icon: "📅",
  };
}

const CATEGORIES = [
  "Career",
  "Health",
  "Finance",
  "Learning",
  "Personal",
  "Other",
];
const COLORS = [
  { label: "Slate", value: "slate", bg: "bg-slate-500" },
  { label: "Blue", value: "blue", bg: "bg-blue-500" },
  { label: "Emerald", value: "emerald", bg: "bg-emerald-500" },
  { label: "Amber", value: "amber", bg: "bg-amber-500" },
  { label: "Rose", value: "rose", bg: "bg-rose-500" },
  { label: "Purple", value: "purple", bg: "bg-purple-500" },
  { label: "Indigo", value: "indigo", bg: "bg-indigo-500" },
];

const GOAL_TEMPLATES = [
  {
    title: "Read a Book",
    category: "Learning",
    color: "blue",
    priority: "medium",
    steps: [
      "Choose a book",
      "Read 20 pages every day",
      "Write a summary/review",
    ],
  },
  {
    title: "Launch a Side Project",
    category: "Career",
    color: "indigo",
    priority: "high",
    steps: [
      "Define MVP features",
      "Setup project repository",
      "Draft UI mockups",
      "Complete core functionality",
      "Deploy to production",
    ],
  },
  {
    title: "Improve Fitness",
    category: "Health",
    color: "emerald",
    priority: "medium",
    steps: [
      "Set a weekly workout schedule",
      "Track daily water intake",
      "Complete first 5km run",
      "Prepare healthy meal plan",
    ],
  },
  {
    title: "Financial Planning",
    category: "Finance",
    color: "amber",
    priority: "high",
    steps: [
      "Review past month's expenses",
      "Set savings goal for the year",
      "Setup automatic savings transfer",
      "Research investment options",
    ],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  todo: { label: "To Do", color: "bg-slate-400", ring: "ring-slate-300" },
  inprogress: {
    label: "In Progress",
    color: "bg-blue-500",
    ring: "ring-blue-300",
  },
  done: { label: "Done", color: "bg-emerald-500", ring: "ring-emerald-300" },
};

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    dot: "bg-rose-500",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressDashboard({ stats, darkMode }) {
  if (!stats) return null;

  const COLORS_CHART = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
  ];

  return (
    <div
      className={`rounded-3xl border p-6 mb-8 transition-all ${
        darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className={`text-lg font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Efficiency Analytics
          </h3>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Visualizing your goal completion momentum
          </p>
        </div>
        <div
          className={`p-2 rounded-xl ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
        >
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Momentum Chart */}
        <div className="lg:col-span-2">
          <h4
            className={`text-xs font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Completion Momentum
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <AreaChart data={stats.weekly_progress}>
                <defs>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#ffffff10" : "#00000010"}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: darkMode ? "#64748b" : "#94a3b8",
                  }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                    borderColor: darkMode ? "#334155" : "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: darkMode ? "#fff" : "#000",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div>
          <h4
            className={`text-xs font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Category Focus
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_CHART[index % COLORS_CHART.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                    borderColor: darkMode ? "#334155" : "#e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {Object.entries(stats.status).map(([key, count]) => (
          <div key={key} className="flex flex-col">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {key}
            </span>
            <span
              className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {count}
            </span>
          </div>
        ))}
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Success Rate
          </span>
          <span
            className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {stats.total > 0
              ? Math.round((stats.status.done / stats.total) * 100)
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, onChange, darkMode }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-outfit transition-all ${
          darkMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
        {cfg.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full mt-1 z-50 rounded-xl border shadow-xl overflow-hidden min-w-[140px] ${
            darkMode
              ? "bg-slate-900 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          {Object.entries(STATUS_CONFIG).map(([key, s]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-outfit font-medium transition-all ${
                darkMode
                  ? "hover:bg-white/5 text-slate-300"
                  : "hover:bg-slate-50 text-slate-700"
              } ${status === key ? (darkMode ? "bg-white/10" : "bg-slate-100") : ""}`}
            >
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority, onChange, darkMode }) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-outfit transition-all ${cfg.color} ${cfg.bg}`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full mt-1 z-50 rounded-xl border shadow-xl overflow-hidden min-w-[130px] ${
            darkMode
              ? "bg-slate-900 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-outfit font-medium transition-all ${
                darkMode
                  ? "hover:bg-white/5 text-slate-300"
                  : "hover:bg-slate-50 text-slate-700"
              } ${priority === key ? (darkMode ? "bg-white/10" : "bg-slate-100") : ""}`}
            >
              <span className={`w-2 h-2 rounded-full ${p.dot}`} />
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableGoalCard({
  goal,
  onUpdate,
  onDelete,
  onEdit,
  darkMode,
  allGoals,
  projects,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [newStep, setNewStep] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(goal.description);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(goal.notes || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(goal.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSteps = goal.steps.filter((s) => s.done).length;
  const totalSteps = goal.steps.length;
  const progress =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const getBgColor = () => {
    // If goal is "done", we might override or just stick to the custom color with an opacity tweak
    if (goal.status === "done") {
      return darkMode
        ? "bg-gradient-to-br from-emerald-900/30 to-slate-900"
        : "bg-gradient-to-br from-emerald-50/60 to-white";
    }

    if (!goal.color || goal.color === "slate") {
      return darkMode
        ? "bg-gradient-to-br from-slate-800 to-slate-900"
        : "bg-gradient-to-br from-slate-50 to-white";
    }

    const bgs = {
      blue: darkMode
        ? "bg-gradient-to-br from-blue-900/40 to-slate-900"
        : "bg-gradient-to-br from-blue-50/80 to-white",
      emerald: darkMode
        ? "bg-gradient-to-br from-emerald-900/40 to-slate-900"
        : "bg-gradient-to-br from-emerald-50/80 to-white",
      amber: darkMode
        ? "bg-gradient-to-br from-amber-900/40 to-slate-900"
        : "bg-gradient-to-br from-amber-50/80 to-white",
      rose: darkMode
        ? "bg-gradient-to-br from-rose-900/40 to-slate-900"
        : "bg-gradient-to-br from-rose-50/80 to-white",
      purple: darkMode
        ? "bg-gradient-to-br from-purple-900/40 to-slate-900"
        : "bg-gradient-to-br from-purple-50/80 to-white",
      indigo: darkMode
        ? "bg-gradient-to-br from-indigo-900/40 to-slate-900"
        : "bg-gradient-to-br from-indigo-50/80 to-white",
    };

    return (
      bgs[goal.color] ||
      (darkMode
        ? "bg-gradient-to-br from-slate-800 to-slate-900"
        : "bg-gradient-to-br from-slate-50 to-white")
    );
  };

  const getBorderColor = () => {
    if (!goal.color || goal.color === "slate")
      return darkMode ? "border-slate-700" : "border-slate-200/80";
    const colors = {
      blue: darkMode ? "border-blue-500/30" : "border-blue-300",
      emerald: darkMode ? "border-emerald-500/30" : "border-emerald-300",
      amber: darkMode ? "border-amber-500/30" : "border-amber-300",
      rose: darkMode ? "border-rose-500/30" : "border-rose-300",
      purple: darkMode ? "border-purple-500/30" : "border-purple-300",
      indigo: darkMode ? "border-indigo-500/30" : "border-indigo-300",
    };
    return (
      colors[goal.color] ||
      (darkMode ? "border-slate-700" : "border-slate-200/80")
    );
  };

  const deadlineInfo = getDeadlineStatus(goal.deadline);

  const addStep = () => {
    if (!newStep.trim()) return;
    const updatedSteps = [
      ...goal.steps,
      {
        id: `tmp-${Date.now()}`,
        text: newStep.trim(),
        done: false,
        is_milestone: false,
      },
    ];
    onUpdate({ ...goal, steps: updatedSteps });
    setNewStep("");
  };

  const toggleStep = (sid) => {
    // Check if blocked by dependencies
    const blockedBy = (goal.dependency_ids || [])
      .map((id) => {
        const g = allGoals.find((x) => x.id === id);
        return g && g.status !== "done" ? g.title : null;
      })
      .filter(Boolean);

    if (blockedBy.length > 0) {
      alert(`This goal is blocked by: ${blockedBy.join(", ")}`);
      return;
    }

    const updatedSteps = goal.steps.map((s) =>
      s.id === sid ? { ...s, done: !s.done } : s,
    );
    onUpdate({ ...goal, steps: updatedSteps });
  };

  const deleteStep = (sid) => {
    const updatedSteps = goal.steps.filter((s) => s.id !== sid);
    onUpdate({ ...goal, steps: updatedSteps });
  };

  const saveTitle = () => {
    if (titleDraft.trim()) onUpdate({ ...goal, title: titleDraft.trim() });
    setEditingTitle(false);
  };

  const saveDesc = () => {
    onUpdate({ ...goal, description: descDraft.trim() });
    setEditingDesc(false);
  };

  const saveNotes = () => {
    onUpdate({ ...goal, notes: notesDraft.trim() });
    setEditingNotes(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${getBgColor()} ${getBorderColor()} ${goal.status === "done" ? "opacity-80" : ""} ${isDragging ? "shadow-2xl ring-2 ring-indigo-500 z-50 cursor-grabbing" : ""}`}
    >
      {goal.color && goal.color !== "slate" && (
        <div
          className={`h-1.5 w-full opacity-80 ${COLORS.find((c) => c.value === goal.color)?.bg || "bg-slate-500"}`}
        />
      )}
      {goal.image_url && (
        <div className="h-32 w-full overflow-hidden border-b border-white/5">
          <img
            src={transformImageUrl(goal.image_url)}
            alt={goal.title}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {goal.status !== "done" && (
            <div
              {...attributes}
              {...listeners}
              className={`mt-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors ${darkMode ? "hover:text-slate-400" : ""}`}
            >
              <GripVertical size={14} />
            </div>
          )}
          <div
            className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-2 ${
              STATUS_CONFIG[goal.status]?.color || "bg-slate-400"
            } ${STATUS_CONFIG[goal.status]?.ring || "ring-slate-300"}`}
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {editingTitle ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  autoFocus
                  className={`flex-1 w-full text-sm font-bold font-inter rounded-lg px-2 py-1 border outline-none ${
                    darkMode
                      ? "bg-slate-800 border-white/20 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveTitle}
                    className="text-emerald-500 hover:text-emerald-400"
                  >
                    <Save size={15} />
                  </button>
                  <button
                    onClick={() => setEditingTitle(false)}
                    className={darkMode ? "text-slate-500" : "text-slate-400"}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <h4
                  className={`text-sm font-bold font-inter leading-tight ${
                    goal.status === "done"
                      ? "line-through " +
                        (darkMode ? "text-slate-500" : "text-slate-400")
                      : darkMode
                        ? "text-white"
                        : "text-slate-900"
                  }`}
                >
                  {goal.title}
                </h4>
                <button
                  onClick={() => {
                    setTitleDraft(goal.title);
                    setEditingTitle(true);
                  }}
                  className="opacity-0 group-hover/title:opacity-100 transition-opacity"
                >
                  <Edit3
                    size={12}
                    className={darkMode ? "text-slate-500" : "text-slate-400"}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ ...goal, is_pinned: !goal.is_pinned });
                  }}
                  className={`ml-auto shrink-0 p-1.5 rounded-md transition-all ${
                    goal.is_pinned
                      ? darkMode
                        ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : "text-amber-500 bg-amber-50 hover:bg-amber-100"
                      : "opacity-0 group-hover/title:opacity-100 " +
                        (darkMode
                          ? "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100")
                  }`}
                  title={goal.is_pinned ? "Unpin Goal" : "Pin Goal to Top"}
                >
                  <Pin
                    size={13}
                    className={goal.is_pinned ? "fill-current" : ""}
                  />
                </button>
              </div>
            )}
            {goal.category && (
              <div
                className={`inline-flex items-center mt-1.5 mr-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-white/10 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {goal.category}
              </div>
            )}
            {deadlineInfo && goal.status !== "done" && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${deadlineInfo.color}`}
              >
                <span>{deadlineInfo.icon}</span>
                {deadlineInfo.text}
              </div>
            )}

            {/* Streak & Dependency Badges */}
            {goal.streak_count > 0 && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 ml-2 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-orange-50 text-orange-600 border-orange-100"
                }`}
              >
                <Flame size={12} className="animate-pulse" />
                {goal.streak_count}d
              </div>
            )}

            {(goal.dependency_ids || []).some(
              (id) =>
                (allGoals || []).find((x) => x.id === id)?.status !== "done",
            ) && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 ml-2 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                }`}
              >
                <LinkIcon size={12} />
                Blocked
              </div>
            )}
            {goal.recurrence && goal.status !== "done" && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 ml-2 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
              >
                <ListChecks size={10} className="animate-pulse" />
                {goal.recurrence}
              </div>
            )}

            {goal.project_id && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 ml-2 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    : "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}
              >
                <LinkIcon size={10} />
                {(projects || []).find((p) => p.id === goal.project_id)?.name ||
                  "Project"}
              </div>
            )}

            {goal.deadline && goal.status === "done" && (
              <div
                className={`inline-flex items-center gap-1 mt-1.5 text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                <Calendar size={11} />
                <span className="line-through">{goal.deadline}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end mt-2 sm:mt-0">
            {!goal.is_archived && goal.status === "done" && (
              <button
                onClick={() => onUpdate({ ...goal, is_archived: true })}
                title="Archive Goal"
                className={`p-1.5 rounded-lg transition-all ${
                  darkMode
                    ? "hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400"
                    : "hover:bg-indigo-50 text-slate-400 hover:text-indigo-500"
                }`}
              >
                <Archive size={14} />
              </button>
            )}
            {goal.is_archived && (
              <button
                onClick={() => onUpdate({ ...goal, is_archived: false })}
                title="Unarchive Goal"
                className={`text-xs px-2 py-1 rounded-md transition-all ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/20 text-slate-300"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                Restore
              </button>
            )}
            <PriorityBadge
              priority={goal.priority}
              onChange={(p) => onUpdate({ ...goal, priority: p })}
              darkMode={darkMode}
            />
            <StatusBadge
              status={goal.status}
              onChange={(s) => {
                if (s === "done" && goal.status !== "done") {
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#6366f1", "#10b981", "#f59e0b"],
                  });
                }
                onUpdate({ ...goal, status: s });
              }}
              darkMode={darkMode}
            />
            <button
              onClick={() => onEdit(goal)}
              className={`p-1.5 rounded-lg transition-all ${
                darkMode
                  ? "hover:bg-white/10 text-slate-500 hover:text-slate-300"
                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              }`}
              title="Edit Goal"
            >
              <Settings2 size={14} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className={`p-1.5 rounded-lg transition-all ${
                darkMode
                  ? "hover:bg-rose-500/20 text-slate-600 hover:text-rose-400"
                  : "hover:bg-rose-50 text-slate-300 hover:text-rose-500"
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {totalSteps > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div
              className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-white/10" : "bg-slate-200"}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-bold ${progress === 100 ? "text-emerald-500" : darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {completedSteps}/{totalSteps}
            </span>
          </div>
        )}

        <button
          onClick={() => setExpanded((e) => !e)}
          className={`mt-3 flex items-center gap-1.5 text-xs font-outfit font-medium transition-all ${
            darkMode
              ? "text-slate-500 hover:text-slate-300"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ListChecks size={13} />
          {totalSteps === 0
            ? "Add plan steps"
            : `${totalSteps} plan step${totalSteps !== 1 ? "s" : ""}`}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {expanded && (
        <div
          className={`px-4 pb-4 border-t ${darkMode ? "border-white/5" : "border-slate-100"}`}
        >
          <div className="pt-3 mb-3">
            {editingDesc ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={2}
                  placeholder="Add a description…"
                  autoFocus
                  className={`w-full text-xs font-outfit rounded-lg px-3 py-2 border outline-none resize-none ${
                    darkMode
                      ? "bg-slate-800 border-white/20 text-slate-300 placeholder:text-slate-600"
                      : "bg-white border-slate-200 text-slate-600 placeholder:text-slate-300"
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDesc}
                    className="text-xs font-outfit font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Save size={11} /> Save
                  </button>
                  <button
                    onClick={() => setEditingDesc(false)}
                    className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDescDraft(goal.description);
                  setEditingDesc(true);
                }}
                className={`w-full text-left text-xs font-outfit rounded-lg px-3 py-2 border transition-all ${
                  goal.description
                    ? darkMode
                      ? "border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300"
                      : "border-slate-100 text-slate-600 hover:border-slate-200"
                    : darkMode
                      ? "border-white/5 text-slate-600 hover:border-white/10 hover:text-slate-500"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                }`}
              >
                {goal.description || "✏️ Add description…"}
              </button>
            )}
          </div>

          <div
            className={`divide-y ${darkMode ? "divide-white/5" : "divide-slate-50"}`}
          >
            {goal.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 py-1.5 group"
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="flex-shrink-0"
                >
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : step.is_milestone ? (
                    <Trophy size={16} className="text-amber-500" />
                  ) : (
                    <Circle
                      size={16}
                      className={darkMode ? "text-slate-600" : "text-slate-300"}
                    />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm font-outfit transition-all ${
                    step.done
                      ? darkMode
                        ? "line-through text-slate-600"
                        : "line-through text-slate-400"
                      : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                  } ${step.is_milestone ? "font-bold" : ""}`}
                >
                  {step.is_milestone && !step.done && "🚩 "}
                  {step.text}
                </span>
                <div className="flex items-center gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const updatedSteps = goal.steps.map((s) =>
                        s.id === step.id
                          ? { ...s, is_milestone: !s.is_milestone }
                          : s,
                      );
                      onUpdate({ ...goal, steps: updatedSteps });
                    }}
                    title={
                      step.is_milestone
                        ? "Remove Milestone"
                        : "Mark as Milestone"
                    }
                    className={`p-1 rounded-lg transition-all ${
                      step.is_milestone
                        ? "bg-amber-500/20 text-amber-500"
                        : darkMode
                          ? "hover:bg-white/5 text-slate-600 hover:text-slate-400"
                          : "hover:bg-slate-50 text-slate-300 hover:text-slate-500"
                    }`}
                  >
                    <Star
                      size={13}
                      fill={step.is_milestone ? "currentColor" : "none"}
                    />
                  </button>
                  <input
                    type="date"
                    value={step.deadline || ""}
                    onChange={(e) => {
                      const updatedSteps = goal.steps.map((s) =>
                        s.id === step.id
                          ? { ...s, deadline: e.target.value }
                          : s,
                      );
                      onUpdate({ ...goal, steps: updatedSteps });
                    }}
                    title="Step Deadline"
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded cursor-pointer outline-none transition-all ${
                      step.deadline
                        ? darkMode
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-outfit [color-scheme:dark]"
                          : "bg-indigo-50 text-indigo-600 border border-indigo-200 font-outfit"
                        : darkMode
                          ? "bg-slate-800 text-slate-500 hover:text-slate-300 font-outfit [color-scheme:dark]"
                          : "bg-slate-100 text-slate-400 hover:text-slate-600 font-outfit"
                    }`}
                  />
                  <button
                    onClick={() => deleteStep(step.id)}
                    className={`p-1 rounded-lg transition-all ${
                      darkMode
                        ? "hover:bg-rose-500/20 text-slate-600 hover:text-rose-400"
                        : "hover:bg-rose-50 text-slate-300 hover:text-rose-500"
                    }`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`flex items-center gap-2 mt-2 pt-2 border-t ${darkMode ? "border-white/5" : "border-slate-100"}`}
          >
            <ArrowRight
              size={13}
              className={darkMode ? "text-slate-600" : "text-slate-300"}
            />
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addStep();
              }}
              placeholder="Add a plan step…"
              className={`flex-1 text-sm font-outfit bg-transparent border-none outline-none ${
                darkMode
                  ? "text-slate-300 placeholder:text-slate-700"
                  : "text-slate-700 placeholder:text-slate-300"
              }`}
            />
            {newStep.trim() && (
              <button
                onClick={addStep}
                className="text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <Plus size={15} />
              </button>
            )}
          </div>

          <div
            className={`mt-4 pt-3 border-t ${darkMode ? "border-white/5" : "border-slate-100"}`}
          >
            <h5
              className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Journal / Notes
            </h5>
            {editingNotes ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  placeholder="Log progress, thoughts, or resources..."
                  autoFocus
                  className={`w-full text-xs font-outfit rounded-lg px-3 py-2 border outline-none resize-y ${
                    darkMode
                      ? "bg-slate-800 border-white/20 text-slate-300 placeholder:text-slate-600"
                      : "bg-white border-slate-200 text-slate-600 placeholder:text-slate-300"
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    className="text-xs font-outfit font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Save size={11} /> Save
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setNotesDraft(goal.notes || "");
                  setEditingNotes(true);
                }}
                className={`w-full text-left text-xs font-outfit rounded-lg px-3 py-2 border cursor-pointer transition-all ${
                  goal.notes
                    ? darkMode
                      ? "bg-slate-800/50 border-white/5 text-slate-300 hover:border-white/10"
                      : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200"
                    : darkMode
                      ? "border-dashed border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
                      : "border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500"
                }`}
              >
                {goal.notes ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {goal.notes}
                  </div>
                ) : (
                  "📝 Add journal entries or notes here..."
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalModal({
  type,
  onAdd,
  onUpdate,
  onClose,
  darkMode,
  allGoals,
  projects,
  initialGoal,
}) {
  const { api } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!initialGoal;
  const [title, setTitle] = useState(initialGoal?.title || "");
  const [deadline, setDeadline] = useState(initialGoal?.deadline || "");
  const [priority, setPriority] = useState(initialGoal?.priority || "medium");
  const [category, setCategory] = useState(initialGoal?.category || "");
  const [color, setColor] = useState(initialGoal?.color || "slate");
  const [recurrence, setRecurrence] = useState(initialGoal?.recurrence || "");
  const [dependencyIds, setDependencyIds] = useState(
    initialGoal?.dependency_ids || [],
  );
  const [steps, setSteps] = useState(initialGoal?.steps || []);
  const [projectId, setProjectId] = useState(initialGoal?.project_id || "");
  const [imageUrl, setImageUrl] = useState(initialGoal?.image_url || "");
  const [isPinned, setIsPinned] = useState(initialGoal?.is_pinned || false);

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setColor(tpl.color);
    setPriority(tpl.priority);
    setSteps(
      tpl.steps.map((s) => ({
        id: `tpl-${Date.now()}-${Math.random()}`,
        text: s,
        done: false,
      })),
    );
  };

  const handle = () => {
    if (!title.trim()) return;
    const goalData = {
      ...(isEdit ? initialGoal : {}),
      type,
      title: title.trim(),
      description: initialGoal?.description || "",
      deadline,
      priority,
      status: initialGoal?.status || "todo",
      category,
      color,
      recurrence,
      dependency_ids: dependencyIds,
      project_id: projectId || null,
      image_url: transformImageUrl(imageUrl),
      is_archived: initialGoal?.is_archived || false,
      is_pinned: isPinned,
      steps: steps.length > 0 ? steps : [],
    };

    if (isEdit) {
      onUpdate(goalData);
    } else {
      onAdd(goalData);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative z-10 rounded-2xl border shadow-2xl w-full max-w-[95%] sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${
          darkMode
            ? "bg-slate-900 border-white/10"
            : "bg-white border-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              type === "short"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {type === "short" ? <Flame size={20} /> : <Rocket size={20} />}
          </div>
          <div>
            <h3
              className={`font-bold font-inter text-base ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              New {type === "short" ? "Short-Term" : "Long-Term"} Goal
            </h3>
            <p
              className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {type === "short" ? "Days to weeks" : "Months to years"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  onClick={() => applyTemplate(tpl)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-all ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Goal Title *
              </label>
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isPinned
                      ? darkMode
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-amber-100 text-amber-600"
                      : darkMode
                        ? "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                        : "bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  }`}
                  title={isPinned ? "Unpin Goal" : "Pin Goal to Top"}
                >
                  <Pin size={14} className={isPinned ? "fill-current" : ""} />
                  {isPinned ? "Pinned" : "Pin"}
                </button>
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handle();
              }}
              autoFocus
              placeholder={
                type === "short"
                  ? "e.g. Finish chapter 5 by Friday"
                  : "e.g. Learn machine learning by Dec"
              }
              className={`w-full mt-1.5 rounded-xl border px-4 py-3 text-sm font-outfit outline-none transition-all ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all ${
                  darkMode
                    ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50 [color-scheme:dark]"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all ${
                  darkMode
                    ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all ${
                  darkMode
                    ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                }`}
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all ${
                  darkMode
                    ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                }`}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Related Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all ${
                  darkMode
                    ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                }`}
              >
                <option value="">None</option>
                {(projects || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Inspiration Image URL
              </label>
              <div className="relative group">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-outfit outline-none transition-all pr-12 ${
                    darkMode
                      ? "bg-slate-800 border-white/10 text-white focus:border-indigo-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400"
                  }`}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute right-2 top-1.5 p-2 rounded-lg transition-all ${
                    darkMode
                      ? "bg-white/5 hover:bg-white/10 text-slate-400"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  } ${uploading ? "animate-pulse cursor-not-allowed" : ""}`}
                  title="Upload image"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      setUploading(true);
                      const response = await api.post(
                        "/goals/upload",
                        formData,
                        {
                          headers: { "Content-Type": "multipart/form-data" },
                        },
                      );
                      setImageUrl(response.data.url);
                    } catch (err) {
                      console.error("Upload failed", err);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </div>
              {imageUrl && (
                <div className="mt-2 relative rounded-xl overflow-hidden h-20 border border-white/10">
                  <img
                    src={transformImageUrl(imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider drop-shadow-md">
                      Preview
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className={`block text-xs font-semibold font-outfit uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Depends On (Prerequisites)
            </label>
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
              {(allGoals || []).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setDependencyIds((prev) =>
                      prev.includes(g.id)
                        ? prev.filter((x) => x !== g.id)
                        : [...prev, g.id],
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-outfit border transition-all ${
                    dependencyIds.includes(g.id)
                      ? darkMode
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                        : "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                      : darkMode
                        ? "bg-white/5 border-white/5 text-slate-500 hover:border-white/10"
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {g.title}
                </button>
              ))}
              {(!allGoals || allGoals.length === 0) && (
                <span className="text-[10px] text-slate-500 italic">
                  No existing goals to link
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold font-outfit uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Color Label
            </label>
            <div className="flex items-center gap-2 mt-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.bg} ${color === c.value ? "ring-2 ring-offset-2 " + (darkMode ? "ring-white ring-offset-slate-900" : "ring-slate-900 ring-offset-white") : "opacity-50 hover:opacity-100"} transition-all`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-outfit font-medium border transition-all ${
              darkMode
                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={!title.trim()}
            className={`flex-1 py-2.5 rounded-xl text-sm font-outfit font-semibold text-white transition-all ${
              title.trim()
                ? type === "short"
                  ? "bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/20"
                  : "bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-slate-400 cursor-not-allowed"
            }`}
          >
            {isEdit ? "Update Goal" : "Add Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VisionBoard({ goals, darkMode, onEdit }) {
  const goalsWithImages = goals.filter((g) => g.image_url && !g.is_archived);

  if (goalsWithImages.length === 0) {
    return (
      <div
        className={`rounded-3xl border-2 border-dashed flex flex-col items-center justify-center py-20 gap-4 transition-all ${
          darkMode
            ? "border-white/10 text-slate-600"
            : "border-slate-200 text-slate-400"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
            darkMode ? "bg-white/5" : "bg-slate-100"
          }`}
        >
          <Grid size={32} className="opacity-20" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold font-inter mb-1">
            Vision Board is empty
          </p>
          <p className="text-sm font-outfit max-w-xs mx-auto">
            Add inspiration image URLs to your goals to see them beautifully
            displayed here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {goalsWithImages.map((goal) => (
        <div
          key={goal.id}
          className={`group relative rounded-3xl overflow-hidden aspect-[4/5] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
            darkMode
              ? "border-white/10 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <img
            src={transformImageUrl(goal.image_url)}
            alt={goal.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-white font-bold font-inter text-lg leading-tight line-clamp-2 drop-shadow-md">
                {goal.title}
              </h4>
              <button
                onClick={() => onEdit(goal)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                <Settings2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md`}
              >
                {goal.category || "General"}
              </span>
              {goal.status === "done" && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 text-white backdrop-blur-md">
                  <CheckCircle2 size={10} /> Completed
                </span>
              )}
            </div>

            {/* Progress bar */}
            {goal.steps && goal.steps.length > 0 && (
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.round((goal.steps.filter((s) => s.done).length / goal.steps.length) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalSection({
  type,
  goals,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
  onEdit,
  editingGoal,
  darkMode,
  allGoals,
  projects,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const isShort = type === "short";

  const activeGoals = goals.filter((g) => !g.is_archived);
  const archivedGoals = goals.filter((g) => g.is_archived);

  const done = activeGoals.filter((g) => g.status === "done").length;
  const inProgress = activeGoals.filter(
    (g) => g.status === "inprogress",
  ).length;

  useEffect(() => {
    if (showArchived && archivedGoals.length === 0) {
      setShowArchived(false);
    }
  }, [archivedGoals.length, showArchived]);

  const renderedGoals = showArchived ? archivedGoals : activeGoals;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id);
      const newIndex = goals.findIndex((g) => g.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(type, arrayMove(goals, oldIndex, newIndex));
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isShort
                ? "bg-blue-500/15 text-blue-500"
                : "bg-amber-500/15 text-amber-500"
            }`}
          >
            {isShort ? <Flame size={18} /> : <Rocket size={18} />}
          </div>
          <div>
            <h3
              className={`font-bold font-inter text-base ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              {isShort ? "Short-Term Goals" : "Long-Term Goals"}
            </h3>
            <p
              className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {isShort ? "Days · Weeks" : "Months · Years"}
              {activeGoals.length > 0 && !showArchived && (
                <span className="ml-2">
                  ·{" "}
                  <span className="text-emerald-500 font-semibold">
                    {done} done
                  </span>
                  {inProgress > 0 && (
                    <span className="text-blue-500 font-semibold">
                      {" "}
                      · {inProgress} active
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {archivedGoals.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`text-xs font-outfit font-semibold px-3 py-1.5 rounded-lg transition-all ${
                showArchived
                  ? darkMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                  : darkMode
                    ? "hover:bg-white/10 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              Archive ({archivedGoals.length})
            </button>
          )}
          {!showArchived && (
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-outfit font-semibold transition-all ${
                isShort
                  ? "bg-blue-500 hover:bg-blue-400 text-white shadow-md shadow-blue-500/20"
                  : "bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20"
              }`}
            >
              <Plus size={15} />
              Add Goal
            </button>
          )}
        </div>
      </div>

      {renderedGoals.length === 0 ? (
        <div
          className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-12 gap-3 transition-all ${
            darkMode
              ? "border-white/8 text-slate-600"
              : "border-slate-200 text-slate-300"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isShort ? "bg-blue-500/10" : "bg-amber-500/10"}`}
          >
            {isShort ? (
              <Flag size={22} className="text-blue-400" />
            ) : (
              <Star size={22} className="text-amber-400" />
            )}
          </div>
          <p className="text-sm font-outfit font-medium">
            No {isShort ? "short-term" : "long-term"} goals yet
          </p>
          <button
            onClick={() => setShowModal(true)}
            className={`text-xs font-outfit font-semibold px-4 py-1.5 rounded-full transition-all ${
              darkMode
                ? "bg-white/5 hover:bg-white/10 text-slate-400"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500"
            }`}
          >
            + Create your first goal
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={renderedGoals.map((g) => String(g.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {renderedGoals.length === 0 && showArchived ? (
                <div className="text-center py-6 text-sm text-slate-500 font-outfit">
                  No archived goals here.
                </div>
              ) : (
                renderedGoals.map((goal) => (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    darkMode={darkMode}
                    allGoals={allGoals}
                    projects={projects}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {(showModal || editingGoal) && (
        <GoalModal
          type={type}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onClose={() => {
            setShowModal(false);
            onEdit(null);
          }}
          darkMode={darkMode}
          allGoals={allGoals} // Pass allGoals for dependency selection
          projects={projects}
          initialGoal={editingGoal}
        />
      )}
    </div>
  );
}

function CalendarView({ goals, darkMode, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get days in month
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from(
    { length: firstDay === 0 ? 6 : firstDay - 1 },
    (_, i) => i,
  );

  // Group goals by date string "YYYY-MM-DD"
  const goalsByDate = goals.reduce((acc, goal) => {
    if (goal.deadline) {
      if (!acc[goal.deadline]) acc[goal.deadline] = [];
      acc[goal.deadline].push(goal);
    }
    return acc;
  }, {});

  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-inherit">
        <h3
          className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
        >
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className={`p-2 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-white/10 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            &lt;
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all ${
              darkMode
                ? "bg-white/5 hover:bg-white/10 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-white/10 text-slate-300"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 w-full border-b border-inherit bg-slate-500/5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {blanks.map((b) => (
          <div
            key={`blank-${b}`}
            className="border-b border-r border-inherit p-2 opacity-30 bg-slate-500/5"
          />
        ))}
        {days.map((d) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayGoals = goalsByDate[dateStr] || [];
          const isToday =
            new Date().toDateString() ===
            new Date(year, month, d).toDateString();

          return (
            <div
              key={d}
              className="border-b border-r border-inherit p-2 overflow-hidden hover:bg-slate-500/5 transition-colors group"
            >
              <div
                className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  isToday
                    ? "bg-indigo-500 text-white"
                    : darkMode
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                {d}
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] no-scrollbar">
                {dayGoals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => onEdit(g)}
                    className={`text-[10px] font-bold px-1.5 py-1 rounded truncate cursor-pointer transition-all ${
                      g.status === "done"
                        ? darkMode
                          ? "bg-emerald-500/20 text-emerald-400 line-through"
                          : "bg-emerald-100 text-emerald-600 line-through"
                        : darkMode
                          ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    {g.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function GoalsPage({ darkMode }) {
  const { api } = useAuth();
  const [data, setData] = useState({ short: [], long: [] });
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'vision'
  const [editingGoal, setEditingGoal] = useState(null);

  // Debounce timer ref for saves
  const saveTimer = useRef({});

  const fetchAnalytics = useCallback(async () => {
    if (!api) return;
    try {
      const aRes = await api.get("/goals/analytics");
      setAnalytics(aRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  }, [api]);

  const sortGoals = (goals) => {
    return [...goals].sort((a, b) => {
      // Pinned goals go first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then sort by order
      if (a.order !== b.order) return a.order - b.order;
      // Fallback to creation date
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const fetchAll = useCallback(async () => {
    if (!api) return;
    try {
      const gRes = await api.get("/goals");
      setData({
        short: sortGoals(gRes.data.short || []),
        long: sortGoals(gRes.data.long || []),
      });
      const pRes = await api.get("/projects");
      setProjects(pRes.data);
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api, fetchAnalytics]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Handle Notifications on load
  useEffect(() => {
    if (!loading && (data.short.length > 0 || data.long.length > 0)) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [loading, data]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Goal Tracker - Summary", 20, 20);
    doc.setFontSize(12);
    let y = 35;

    const all = [...data.short, ...data.long];
    all.forEach((g, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, "bold");
      doc.text(`${i + 1}. ${g.title} [${g.status.toUpperCase()}]`, 20, y);
      doc.setFont(undefined, "normal");
      y += 7;
      if (g.category) {
        doc.text(`Category: ${g.category}`, 25, y);
        y += 5;
      }
      if (g.deadline) {
        doc.text(`Deadline: ${g.deadline}`, 25, y);
        y += 5;
      }
      y += 5;
    });

    doc.save("my-goals.pdf");
  }, [data]);

  // ── ADD ──────────────────────────────────────────────────────────────────────
  const addGoal = useCallback(
    async (goalData) => {
      try {
        const res = await api.post("/goals", goalData);
        const created = res.data;
        setData((d) => ({
          ...d,
          [created.type]: sortGoals([created, ...d[created.type]]),
        }));
        fetchAnalytics();
      } catch (err) {
        console.error("Failed to create goal", err);
      }
    },
    [api, fetchAnalytics],
  );

  // ── UPDATE ───────────────────────────────────────────────────────────────────
  const updateGoal = useCallback(
    async (updated) => {
      const type = updated.type;
      // Optimistic UI update
      setData((d) => ({
        ...d,
        [type]: sortGoals(
          d[type].map((g) => (g.id === updated.id ? updated : g)),
        ),
      }));
      // Debounce API call
      clearTimeout(saveTimer.current[updated.id]);
      saveTimer.current[updated.id] = setTimeout(async () => {
        try {
          await api.put(`/goals/${updated.id}`, updated);
          fetchAnalytics();
        } catch (err) {
          console.error("Failed to update goal", err);
        }
      }, 400);
    },
    [api, fetchAnalytics],
  );

  // ── DELETE ───────────────────────────────────────────────────────────────────
  const deleteGoal = useCallback(
    async (id, type) => {
      setData((d) => ({ ...d, [type]: d[type].filter((g) => g.id !== id) }));
      try {
        await api.delete(`/goals/${id}`);
        fetchAnalytics();
      } catch (err) {
        console.error("Failed to delete goal", err);
      }
    },
    [api, fetchAnalytics],
  );

  // ── REORDER ──────────────────────────────────────────────────────────────────
  const reorderGoals = useCallback(
    async (type, newOrderedGoals) => {
      setData((d) => ({ ...d, [type]: newOrderedGoals }));
      try {
        await api.put("/goals/reorder", {
          ordered_ids: newOrderedGoals.map((g) => g.id),
        });
      } catch (err) {
        console.error("Failed to reorder goals", err);
      }
    },
    [api],
  );

  const allGoals = [...data.short, ...data.long];
  const activeGoals = allGoals.filter((g) => !g.is_archived);
  const totalDone = activeGoals.filter((g) => g.status === "done").length;
  const totalActive = activeGoals.filter(
    (g) => g.status === "inprogress",
  ).length;
  const totalGoals = activeGoals.length;

  // ── FILTERING ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const applyFilters = (goalsArray) => {
    return goalsArray.filter((g) => {
      // Search text
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(query);
        const matchesDesc = (g.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Status
      if (filterStatus !== "all" && g.status !== filterStatus) return false;
      // Priority
      if (filterPriority !== "all" && g.priority !== filterPriority)
        return false;
      // Category
      if (filterCategory !== "all" && g.category !== filterCategory)
        return false;
      return true;
    });
  };

  const filteredData = {
    short: applyFilters(data.short),
    long: applyFilters(data.long),
  };
  const filteredAllGoals = applyFilters(allGoals);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            darkMode
              ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <Target size={22} />
        </div>
        <div>
          <h2
            className={`text-2xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Goal Tracker
          </h2>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Plan, track and achieve your goals
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              darkMode
                ? "bg-slate-900 border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? darkMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode("vision")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "vision"
                  ? darkMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Vision Board"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "calendar"
                  ? darkMode
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Calendar View"
            >
              <CalendarDays size={18} />
            </button>
          </div>

          <button
            onClick={exportToPDF}
            className={`p-2.5 rounded-xl border transition-all ${
              darkMode
                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
            title="Export to PDF"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Analytics */}
      {!loading && analytics && (
        <ProgressDashboard stats={analytics} darkMode={darkMode} />
      )}

      {/* Filter Bar */}
      {!loading && (
        <div
          className={`flex flex-col lg:flex-row items-center gap-4 p-4 rounded-2xl border ${
            darkMode
              ? "bg-slate-900 border-white/10"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex-1 relative w-full">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-outfit border outline-none transition-all ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white placeholder:text-slate-500 hover:border-white/20 focus:border-indigo-500/50"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500/30 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2.5 rounded-xl text-sm font-outfit font-medium border outline-none min-w-[120px] cursor-pointer appearance-none ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white hover:border-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-3 py-2.5 rounded-xl text-sm font-outfit font-medium border outline-none min-w-[120px] cursor-pointer appearance-none ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white hover:border-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2.5 rounded-xl text-sm font-outfit font-medium border outline-none min-w-[130px] cursor-pointer appearance-none ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white hover:border-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <option value="all">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Learning">Learning</option>
            </select>

            {(searchQuery ||
              filterStatus !== "all" ||
              filterPriority !== "all" ||
              filterCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                  setFilterPriority("all");
                  setFilterCategory("all");
                }}
                className={`p-2.5 rounded-xl transition-all ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                title="Clear Filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      )}

      {!loading && (
        <>
          {/* KPI strip */}
          {totalGoals > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Target size={18} className="text-indigo-400" />,
                  label: "Total Goals",
                  value: totalGoals,
                  bg: darkMode ? "bg-indigo-500/8" : "bg-indigo-50",
                  border: darkMode
                    ? "border-indigo-500/20"
                    : "border-indigo-100",
                },
                {
                  icon: <Flame size={18} className="text-blue-400" />,
                  label: "In Progress",
                  value: totalActive,
                  bg: darkMode ? "bg-blue-500/8" : "bg-blue-50",
                  border: darkMode ? "border-blue-500/20" : "border-blue-100",
                },
                {
                  icon: <Trophy size={18} className="text-emerald-400" />,
                  label: "Completed",
                  value: totalDone,
                  bg: darkMode ? "bg-emerald-500/8" : "bg-emerald-50",
                  border: darkMode
                    ? "border-emerald-500/20"
                    : "border-emerald-100",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${k.bg} ${k.border}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? "bg-white/5" : "bg-white"} shadow-sm`}
                  >
                    {k.icon}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-outfit font-semibold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {k.label}
                    </p>
                    <p
                      className={`text-2xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {k.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goals Lists / Dynamic View Mode */}
          {viewMode === "vision" ? (
            <VisionBoard
              goals={filteredAllGoals}
              darkMode={darkMode}
              onEdit={setEditingGoal}
            />
          ) : viewMode === "calendar" ? (
            <CalendarView
              goals={filteredAllGoals}
              darkMode={darkMode}
              onEdit={setEditingGoal}
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              <GoalSection
                type="short"
                goals={filteredData.short}
                onUpdate={updateGoal}
                onDelete={(id) => deleteGoal(id, "short")}
                onAdd={(goalData) => addGoal(goalData)}
                onReorder={reorderGoals}
                onEdit={setEditingGoal}
                editingGoal={editingGoal}
                darkMode={darkMode}
                allGoals={allGoals}
                projects={projects}
              />
              <GoalSection
                type="long"
                goals={filteredData.long}
                onUpdate={updateGoal}
                onDelete={(id) => deleteGoal(id, "long")}
                onAdd={(goalData) => addGoal(goalData)}
                onReorder={reorderGoals}
                onEdit={setEditingGoal}
                editingGoal={editingGoal}
                darkMode={darkMode}
                allGoals={allGoals}
                projects={projects}
              />
            </div>
          )}
        </>
      )}

      {/* Global Edit Modal */}
      {editingGoal && (
        <GoalModal
          type={editingGoal.type}
          onAdd={addGoal}
          onUpdate={updateGoal}
          onClose={() => setEditingGoal(null)}
          darkMode={darkMode}
          allGoals={allGoals}
          projects={projects}
          initialGoal={editingGoal}
        />
      )}
    </div>
  );
}
