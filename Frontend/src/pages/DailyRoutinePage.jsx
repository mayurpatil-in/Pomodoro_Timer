import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  BookOpen,
  Coffee,
  Dumbbell,
  Code2,
  Utensils,
  Moon,
  Briefcase,
  Music,
  PlayCircle,
  PauseCircle,
  Clock,
  ListTodo,
  CheckCircle2,
  Timer,
  Hourglass,
  Square,
} from "lucide-react";

// ── Activity categories ──────────────────────────────────────────
const CATEGORIES = [
  {
    id: "study",
    label: "Study",
    color: "bg-blue-500",
    light: "bg-blue-50 text-blue-700 border-blue-200",
    dark: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    hex: "#3b82f6",
    icon: BookOpen,
  },
  {
    id: "work",
    label: "Work",
    color: "bg-indigo-500",
    light: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dark: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    hex: "#6366f1",
    icon: Briefcase,
  },
  {
    id: "break",
    label: "Break",
    color: "bg-amber-500",
    light: "bg-amber-50 text-amber-700 border-amber-200",
    dark: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    hex: "#f59e0b",
    icon: Coffee,
  },
  {
    id: "exercise",
    label: "Exercise",
    color: "bg-emerald-500",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dark: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    hex: "#10b981",
    icon: Dumbbell,
  },
  {
    id: "meal",
    label: "Meal",
    color: "bg-orange-500",
    light: "bg-orange-50 text-orange-700 border-orange-200",
    dark: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    hex: "#f97316",
    icon: Utensils,
  },
  {
    id: "coding",
    label: "Coding",
    color: "bg-purple-500",
    light: "bg-purple-50 text-purple-700 border-purple-200",
    dark: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    hex: "#a855f7",
    icon: Code2,
  },
  {
    id: "hobby",
    label: "Hobby",
    color: "bg-pink-500",
    light: "bg-pink-50 text-pink-700 border-pink-200",
    dark: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    hex: "#ec4899",
    icon: Music,
  },
  {
    id: "sleep",
    label: "Sleep",
    color: "bg-slate-500",
    light: "bg-slate-100 text-slate-600 border-slate-200",
    dark: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    hex: "#64748b",
    icon: Moon,
  },
];

const TIME_SLOTS = [
  { hour: 3.5, label: "3:30 AM", endLabel: "4:00 AM", key: "03:30" },
  ...Array.from({ length: 20 }, (_, i) => {
    const h = i + 4; // 4 AM to 11 PM
    const label =
      h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
    const end = h + 1;
    const endLabel =
      end < 12 ? `${end}:00 AM` : end === 12 ? "12:00 PM" : `${end - 12}:00 PM`;
    return {
      hour: h,
      label,
      endLabel,
      key: `${String(h).padStart(2, "0")}:00`,
    };
  }),
];

// ── Helper ───────────────────────────────────────────────────────
function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function monthStart(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthEnd(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
const MNAMES = [
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
const DNAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Mini Calendar ────────────────────────────────────────────────
function MiniCalendar({ selected, onSelect, dots, darkMode }) {
  const [cursor, setCursor] = useState(new Date(selected));
  const start = monthStart(cursor);
  const end = monthEnd(cursor);
  const leading = start.getDay();
  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= end.getDate(); d++)
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  return (
    <div
      className={`rounded-2xl border p-4 w-full ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          className={`text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          {MNAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DNAMES.map((d) => (
          <div
            key={d}
            className={`text-center text-[10px] font-semibold font-outfit py-1 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />;
          const iso = toISO(day);
          const isSelected = iso === toISO(selected);
          const isToday = iso === toISO(new Date());
          const hasDot = dots?.includes(iso);
          return (
            <button
              key={iso}
              onClick={() => onSelect(day)}
              className={`relative flex flex-col items-center justify-center h-8 w-full rounded-lg text-xs font-medium font-inter transition-all
                ${
                  isSelected
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : isToday
                      ? darkMode
                        ? "text-indigo-400 font-bold"
                        : "text-indigo-600 font-bold"
                      : darkMode
                        ? "text-slate-400 hover:bg-white/5"
                        : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              {day.getDate()}
              {hasDot && !isSelected && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-500"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Slot Entry editor modal ───────────────────────────────────────
function SlotModal({ slot, entry, globalTasks, onSave, onClose, darkMode }) {
  const [title, setTitle] = useState(entry?.title || "");
  const [note, setNote] = useState(entry?.note || "");
  const [category, setCategory] = useState(entry?.category || "study");
  const [duration, setDuration] = useState(entry?.duration || 60);
  const [linkedTaskId, setLinkedTaskId] = useState(entry?.linkedTaskId || "");

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`rounded-2xl border w-full max-w-md p-6 shadow-2xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`font-inter font-bold text-base mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          {slot.label} – {slot.endLabel}
        </h3>
        <p
          className={`text-xs font-outfit mb-5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          Add activity for this time slot
        </p>

        {/* Task Linkage Dropdown */}
        {globalTasks && globalTasks.length > 0 && (
          <div className="mb-4">
            <label
              className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${darkMode ? "text-indigo-400/80" : "text-indigo-600/80"} flex flex-col`}
            >
              <span>Link Global Task (Optional)</span>
              <span
                className={`text-[9px] font-normal normal-case mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Checking this slot off will also complete the master task.
              </span>
            </label>
            <select
              value={linkedTaskId}
              onChange={(e) => {
                const taskId = e.target.value;
                setLinkedTaskId(taskId);
                if (taskId) {
                  const selectedTask = globalTasks.find((t) => t.id === taskId);
                  if (selectedTask && !title) {
                    setTitle(selectedTask.title);
                  }
                }
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-outfit outline-none transition-all appearance-none cursor-pointer ${
                darkMode
                  ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-100 hover:bg-indigo-950/40"
                  : "bg-indigo-50/50 border-indigo-200 text-indigo-900 hover:bg-indigo-50"
              }`}
            >
              <option value="">-- No link (Independent Time Block) --</option>
              {globalTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label
            className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Activity Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="e.g. Learn Python, Read Book..."
            className={`w-full px-3 py-2.5 rounded-xl border text-sm font-outfit outline-none transition-all ${
              darkMode
                ? "bg-slate-800 border-white/10 text-white placeholder-slate-600 focus:border-indigo-500/50"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-300"
            }`}
          />
        </div>

        {/* Category pills */}
        <div className="mb-4">
          <label
            className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold font-outfit transition-all
                  ${category === cat.id ? (darkMode ? cat.dark : cat.light) + " ring-2 ring-offset-1 ring-indigo-400/50" : darkMode ? "border-white/5 text-slate-500 hover:border-white/10" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-5">
          <label
            className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Duration (min): <span className="text-indigo-400">{duration}</span>
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Note */}
        <div className="mb-5">
          <label
            className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Any extra notes..."
            className={`w-full px-3 py-2 rounded-xl border text-sm font-outfit outline-none resize-none transition-all ${
              darkMode
                ? "bg-slate-800 border-white/10 text-white placeholder-slate-600 focus:border-indigo-500/50"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-300"
            }`}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-outfit border transition-colors ${darkMode ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onSave({
                  title: title.trim(),
                  category,
                  duration,
                  note,
                  linkedTaskId: linkedTaskId || null,
                });
                onClose();
              }
            }}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-outfit font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Save Activity
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Analytics Ring Chart ────────────────────────────────
function CategoryRingChart({ entries, darkMode }) {
  const stats = {};
  CATEGORIES.forEach((c) => {
    stats[c.id] = { ...c, totalMins: 0 };
  });

  let totalTrackedMins = 0;

  Object.values(entries).forEach((e) => {
    let mins = Math.floor((e.elapsedSeconds || 0) / 60);
    if (e.completed && mins === 0) {
      mins = e.duration || 0;
    }
    if (stats[e.category]) {
      stats[e.category].totalMins += mins;
      totalTrackedMins += mins;
    }
  });

  const sortedStats = Object.values(stats)
    .filter((s) => s.totalMins > 0)
    .sort((a, b) => b.totalMins - a.totalMins);

  if (totalTrackedMins === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div
          className={`w-36 h-36 rounded-full border-8 flex items-center justify-center ${
            darkMode ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <span
            className={`text-xs font-outfit uppercase tracking-wider ${
              darkMode ? "text-slate-600" : "text-slate-400"
            }`}
          >
            No Data
          </span>
        </div>
      </div>
    );
  }

  // Build conic gradient string
  let currentPct = 0;
  const gradientStops = sortedStats
    .map((stat) => {
      const percentage = (stat.totalMins / totalTrackedMins) * 100;
      const start = currentPct;
      const end = currentPct + percentage;
      currentPct = end;
      return `${stat.hex} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-7 pt-2">
      {/* Donut Chart */}
      <div
        className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        {/* Inner hole */}
        <div
          className={`absolute inset-0 m-auto w-28 h-28 rounded-full flex flex-col items-center justify-center border shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] ${
            darkMode
              ? "bg-slate-900 border-white/10"
              : "bg-white border-slate-100"
          }`}
        >
          <span
            className={`text-xl font-bold font-inter ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {Math.floor(totalTrackedMins / 60)}h {totalTrackedMins % 60}m
          </span>
          <span
            className={`text-[10px] font-outfit uppercase tracking-widest mt-0.5 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Logged
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 w-full">
        {sortedStats.map((stat) => {
          const pct = Math.round((stat.totalMins / totalTrackedMins) * 100);
          return (
            <div
              key={stat.id}
              className="flex items-center justify-between text-sm group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: stat.hex }}
                />
                <span
                  className={`font-outfit font-medium transition-colors ${
                    darkMode
                      ? "text-slate-300 group-hover:text-white"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold tabular-nums font-inter ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {stat.totalMins}m
                </span>
                <span
                  className={`text-xs font-bold tabular-nums w-9 text-right bg-black/5 dark:bg-white/5 py-1 px-1.5 rounded-md ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function DailyRoutinePage({ darkMode }) {
  const { api, setActiveTask } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState({}); // { "08:00": { title, category, duration, note } }
  const [calDots, setCalDots] = useState([]); // ISO dates with saved data
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null); // { slot } | null
  const [activeTimer, setActiveTimer] = useState(null); // { slotKey, elapsedSeconds: number, isRunning: boolean }
  const [draggedSlotKey, setDraggedSlotKey] = useState(null);
  const [globalTasks, setGlobalTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateModal, setTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const dateISO = toISO(selectedDate);

  // Timer tick effect
  useEffect(() => {
    let interval;
    if (activeTimer?.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev || !prev.isRunning) return prev;
          return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  // Save active timer to entry
  const stopAndSaveTimer = useCallback(() => {
    if (!activeTimer) return;
    setEntries((e) => {
      const entry = e[activeTimer.slotKey];
      if (!entry) return e;
      const prevElapsed = entry.elapsedSeconds || 0;
      return {
        ...e,
        [activeTimer.slotKey]: {
          ...entry,
          elapsedSeconds: prevElapsed + activeTimer.elapsedSeconds,
        },
      };
    });
    setActiveTimer(null);
  }, [activeTimer]);

  // Load calendar summary (dots)
  useEffect(() => {
    if (!api) return;
    api
      .get("/routines/calendar")
      .then((res) => setCalDots(res.data.map((r) => r.date)))
      .catch(console.error);
  }, [api]);

  // Load entries for selected date
  useEffect(() => {
    if (!api) return;
    setEntries({});
    api
      .get(`/routines/${dateISO}`)
      .then((res) => {
        const map = {};
        res.data.entries.forEach((e) => {
          map[e.slot] = e;
        });
        setEntries(map);
      })
      .catch(console.error);
  }, [api, dateISO]);

  // Load global tasks for timeboxing
  useEffect(() => {
    if (!api) return;
    api
      .get("/tasks")
      .then((res) => setGlobalTasks(res.data))
      .catch(console.error);
  }, [api]);

  // Load routine templates
  useEffect(() => {
    if (!api) return;
    api
      .get("/routines/templates")
      .then((res) => setTemplates(res.data))
      .catch(console.error);
  }, [api]);

  const saveRoutine = async () => {
    setSaving(true);
    const entryList = Object.entries(entries).map(([slot, data]) => ({
      slot,
      ...data,
    }));
    try {
      await api.put(`/routines/${dateISO}`, { entries: entryList });
      setSaved(true);
      if (!calDots.includes(dateISO)) setCalDots((d) => [...d, dateISO]);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save routine:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || Object.keys(entries).length === 0) return;
    const entryList = Object.entries(entries).map(([slot, data]) => ({
      slot,
      ...data,
      completed: false, // Don't save completions into a template!
    }));
    try {
      const res = await api.post("/routines/templates", {
        name: templateName.trim(),
        entries: entryList,
      });
      setTemplates((prev) => [res.data, ...prev]);
      setTemplateModal(false);
      setTemplateName("");
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  const loadTemplate = async (e) => {
    const templateId = e.target.value;
    if (!templateId) return;

    // Find the template
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Load it into state and immediately auto-save
    const map = {};
    template.entries.forEach((entry) => {
      map[entry.slot] = { ...entry, completed: false };
    });

    setEntries(map);
    e.target.value = ""; // Reset dropdown

    // Auto-save the newly loaded entries to this date
    setSaving(true);
    try {
      await api.put(`/routines/${dateISO}`, { entries: template.entries });
      setSaved(true);
      if (!calDots.includes(dateISO)) setCalDots((d) => [...d, dateISO]);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to auto-save template load:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = useCallback((slot, data) => {
    setEntries((e) => ({
      ...e,
      [slot.key]: {
        ...data,
        slot: slot.key,
        completed: e[slot.key]?.completed || false,
      },
    }));
  }, []);

  const removeEntry = (slotKey) => {
    setEntries((e) => {
      const n = { ...e };
      delete n[slotKey];
      return n;
    });
  };

  const toggleComplete = async (slotKey) => {
    let linkedTaskId = null;
    let newCompletedState = false;

    setEntries((e) => {
      const entry = e[slotKey];
      if (!entry) return e;
      linkedTaskId = entry.linkedTaskId;
      newCompletedState = !entry.completed;
      return {
        ...e,
        [slotKey]: { ...entry, completed: newCompletedState },
      };
    });

    // Fire off completion to global task system if linked
    if (linkedTaskId && api) {
      try {
        await api.put(`/tasks/${linkedTaskId}`, {
          is_completed: newCompletedState,
        });
        // Refresh global tasks to reflect completion silently
        const res = await api.get("/tasks");
        setGlobalTasks(res.data);
      } catch (err) {
        console.error("Failed to sync global task completion:", err);
      }
    }
  };

  const copyYesterday = async () => {
    const yest = new Date(selectedDate);
    yest.setDate(yest.getDate() - 1);
    const yestISO = toISO(yest);
    try {
      const res = await api.get(`/routines/${yestISO}`);
      const map = {};
      res.data.entries.forEach((e) => {
        map[e.slot] = { ...e, completed: false };
      });
      setEntries((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Failed to copy yesterday's routine:", err);
    }
  };

  const completedCount = Object.values(entries).filter(
    (e) => e.completed,
  ).length;

  // --- HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e, slotKey) => {
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setDraggedSlotKey(slotKey), 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSlotKey) => {
    e.preventDefault();
    if (!draggedSlotKey || draggedSlotKey === targetSlotKey) {
      setDraggedSlotKey(null);
      return;
    }

    setEntries((prev) => {
      const draggedEntry = prev[draggedSlotKey];
      const targetEntry = prev[targetSlotKey];

      const newEntries = { ...prev };

      if (draggedEntry) {
        newEntries[targetSlotKey] = { ...draggedEntry, slot: targetSlotKey };
      } else {
        delete newEntries[targetSlotKey];
      }

      if (targetEntry) {
        newEntries[draggedSlotKey] = { ...targetEntry, slot: draggedSlotKey };
      } else {
        delete newEntries[draggedSlotKey];
      }

      return newEntries;
    });

    setSaved(false);
    setDraggedSlotKey(null);
  };

  const handleDragEnd = () => {
    setDraggedSlotKey(null);
  };
  // ------------------------------------

  const totalCount = Object.keys(entries).length;

  const plannedTimeTotalMin = Object.values(entries).reduce((acc, e) => {
    return acc + (e.duration || 0);
  }, 0);
  const plannedHrs = Math.floor(plannedTimeTotalMin / 60);
  const plannedMins = plannedTimeTotalMin % 60;
  const hmPlannedFormat =
    plannedHrs > 0 ? `${plannedHrs}h ${plannedMins}m` : `${plannedMins}m`;

  const focusTimeTotalMin = Object.values(entries).reduce((acc, e) => {
    const elapsedMins = Math.floor((e.elapsedSeconds || 0) / 60);
    // If completed but no timer used, fallback to planned duration
    const timeToAdd =
      e.completed && elapsedMins === 0 ? e.duration || 0 : elapsedMins;
    return acc + timeToAdd;
  }, 0);
  const focusHrs = Math.floor(focusTimeTotalMin / 60);
  const focusMins = focusTimeTotalMin % 60;
  const hmFormat =
    focusHrs > 0 ? `${focusHrs}h ${focusMins}m` : `${focusMins}m`;

  const getSlotEndTime = (hour) => (hour === 3.5 ? 4 : hour + 1);
  const now = new Date();
  const currentFloatHour = now.getHours() + now.getMinutes() / 60;
  const isSelectedToday = dateISO === toISO(now);

  // ── Progress percentage for completion bar ──
  const completionPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col xl:flex-row gap-5 w-full min-h-full">
      {/* ════════════════════════════════════════════════════════════
          Left Panel: Calendar + Analytics
      ════════════════════════════════════════════════════════════ */}
      <div className="xl:w-72 flex-shrink-0 flex flex-col gap-4">
        {/* Mini Calendar */}
        <MiniCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          dots={calDots}
          darkMode={darkMode}
        />

        {/* Day Summary Card */}
        <div
          className={`rounded-2xl border overflow-hidden ${darkMode ? "bg-gradient-to-br from-slate-900 to-slate-900/60 border-white/5" : "bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm"}`}
        >
          {/* Accent strip */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-4">
            <p
              className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Selected Day
            </p>
            <p
              className={`text-lg font-extrabold font-inter leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <p
              className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {selectedDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            {/* Completion progress bar */}
            {totalCount > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-outfit font-semibold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Day Progress
                  </span>
                  <span
                    className={`text-[10px] font-inter font-bold ${completionPct === 100 ? "text-emerald-500" : darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                  >
                    {completionPct}%
                  </span>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-700/80" : "bg-slate-200"}`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p
                  className={`text-[10px] font-outfit mt-1 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                >
                  {completedCount} of {totalCount} activities done
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Analytics */}
        <div
          className={`rounded-2xl border p-5 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Category Breakdown
            </h3>
            <span
              className={`text-[9px] font-outfit font-semibold uppercase px-2 py-0.5 rounded-full border ${darkMode ? "border-white/10 text-slate-500 bg-white/5" : "border-slate-200 text-slate-400 bg-slate-50"}`}
            >
              Today
            </span>
          </div>
          <CategoryRingChart entries={entries} darkMode={darkMode} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          Right Panel: Header + Stats + Time Grid
      ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* ── Header ── */}
        <div
          className={`rounded-2xl border overflow-hidden ${darkMode ? "bg-gradient-to-r from-indigo-900/40 via-slate-900/50 to-purple-900/30 border-white/5" : "bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-100 shadow-sm"}`}
        >
          <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
              >
                <Timer size={20} />
              </div>
              <div>
                <h2
                  className={`text-xl font-extrabold font-inter leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Daily Routine
                </h2>
                <p
                  className={`text-xs font-outfit ${darkMode ? "text-indigo-300/60" : "text-indigo-500/70"}`}
                >
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Template Selector */}
              {templates.length > 0 && (
                <select
                  onChange={loadTemplate}
                  defaultValue=""
                  disabled={saving}
                  className={`px-3 py-2 rounded-xl text-xs font-medium font-outfit transition-all border outline-none appearance-none cursor-pointer ${
                    darkMode
                      ? "bg-slate-800/80 border-white/8 text-slate-300 hover:bg-slate-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <option value="" disabled>
                    📋 Load Template…
                  </option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Copy Yesterday */}
              {totalCount === 0 && (
                <button
                  onClick={copyYesterday}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-outfit transition-all border ${
                    darkMode
                      ? "bg-slate-800/80 border-white/8 text-slate-300 hover:bg-slate-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <Copy size={13} />
                  <span>Copy Yesterday</span>
                </button>
              )}

              {/* Save Template */}
              <button
                onClick={() => setTemplateModal(true)}
                disabled={totalCount === 0 || saving}
                title="Save current layout as a reusable Template"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold font-outfit transition-all border ${
                  darkMode
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-40"
                    : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 shadow-sm disabled:opacity-40"
                }`}
              >
                <ListTodo size={13} />
                <span>Save Template</span>
              </button>

              {/* Save Routine */}
              <button
                onClick={saveRoutine}
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-outfit text-white transition-all shadow-md ${
                  saved
                    ? "bg-emerald-500 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/20 disabled:opacity-60"
                }`}
              >
                {saving ? (
                  <svg
                    className="animate-spin w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : saved ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <Save size={13} />
                )}
                {saving ? "Saving…" : saved ? "Saved!" : "Save Routine"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Planned",
              value: totalCount,
              unit: "tasks",
              icon: ListTodo,
              color: darkMode
                ? "from-indigo-500/20 to-indigo-800/10 border-indigo-500/15 text-indigo-400"
                : "from-indigo-50 to-indigo-100/50 border-indigo-200 text-indigo-600",
            },
            {
              label: "Completed",
              value: completedCount,
              unit: `/ ${totalCount}`,
              icon: CheckCircle2,
              color: darkMode
                ? "from-emerald-500/20 to-emerald-800/10 border-emerald-500/15 text-emerald-400"
                : "from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-600",
            },
            {
              label: "Planned Time",
              value: hmPlannedFormat,
              unit: null,
              icon: Hourglass,
              color: darkMode
                ? "from-blue-500/20 to-blue-800/10 border-blue-500/15 text-blue-400"
                : "from-blue-50 to-blue-100/50 border-blue-200 text-blue-600",
            },
            {
              label: "Focus Time",
              value: hmFormat,
              unit: null,
              icon: Clock,
              color: darkMode
                ? "from-amber-500/20 to-amber-800/10 border-amber-500/15 text-amber-400"
                : "from-amber-50 to-amber-100/50 border-amber-200 text-amber-600",
            },
          ].map(({ label, value, unit, icon: Icon, color }) => (
            <div
              key={label}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${color} flex items-center gap-3 transition-all`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-70">
                  {label}
                </p>
                <div className="flex items-baseline gap-1">
                  <p
                    className={`text-xl font-extrabold font-inter leading-none ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {value}
                  </p>
                  {unit && (
                    <span
                      className={`text-[10px] font-outfit opacity-60 ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Time Grid ── */}
        <div
          className={`rounded-2xl border overflow-hidden flex-1 ${darkMode ? "border-white/5 bg-slate-900/30" : "border-slate-200 shadow-sm bg-white"}`}
        >
          {/* Grid Header */}
          <div
            className={`hidden sm:grid sm:grid-cols-[100px_1fr_180px] md:grid-cols-[120px_1fr_220px] text-[10px] font-bold uppercase tracking-widest px-5 py-3 border-b ${
              darkMode
                ? "bg-slate-800/60 border-white/5 text-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <span>Time</span>
            <span>Activity</span>
            <span className="text-right">Duration / Actions</span>
          </div>

          {/* Slots */}
          <div className="flex flex-col">
            {TIME_SLOTS.map((slot) => {
              const entry = entries[slot.key];
              const cat =
                CATEGORIES.find((c) => c.id === entry?.category) ||
                CATEGORIES[0];
              const CatIcon = cat.icon;

              const slotEnd = getSlotEndTime(slot.hour);
              const isActiveSlot =
                isSelectedToday &&
                currentFloatHour >= slot.hour &&
                currentFloatHour < slotEnd;

              // ── Visual Merging Logic ──
              const prevSlot = TIME_SLOTS[TIME_SLOTS.indexOf(slot) - 1];
              const nextSlot = TIME_SLOTS[TIME_SLOTS.indexOf(slot) + 1];
              const prevEntry = prevSlot ? entries[prevSlot.key] : null;
              const nextEntry = nextSlot ? entries[nextSlot.key] : null;

              const isIdentical = (e1, e2) => {
                if (!e1 || !e2) return false;
                return (
                  e1.title === e2.title &&
                  e1.category === e2.category &&
                  e1.note === e2.note &&
                  e1.completed === e2.completed
                );
              };

              const sameAsPrev = isIdentical(entry, prevEntry);
              const sameAsNext = isIdentical(entry, nextEntry);
              const isFirstOfGroup = entry && !sameAsPrev && sameAsNext;
              const isMiddleOfGroup = entry && sameAsPrev && sameAsNext;
              const isLastOfGroup = entry && sameAsPrev && !sameAsNext;
              const isGrouped =
                isFirstOfGroup || isMiddleOfGroup || isLastOfGroup;

              return (
                <div
                  key={slot.key}
                  onClick={() => !entry && setModal({ slot })}
                  draggable={!!entry}
                  onDragStart={(e) => handleDragStart(e, slot.key)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slot.key)}
                  onDragEnd={handleDragEnd}
                  className={`group relative grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_180px] md:grid-cols-[120px_1fr_220px] items-center px-4 sm:px-5 py-3 transition-all gap-x-3 gap-y-1.5 sm:gap-3 overflow-hidden ${
                    darkMode
                      ? "border-b border-white/[0.035]"
                      : "border-b border-slate-100"
                  } ${sameAsPrev ? "border-t-0" : ""} ${
                    sameAsNext ? "!border-b-0" : ""
                  } ${
                    draggedSlotKey === slot.key
                      ? "opacity-40 ring-2 ring-indigo-500"
                      : ""
                  } ${
                    entry?.completed
                      ? darkMode
                        ? "bg-emerald-900/5"
                        : "bg-emerald-50/40"
                      : entry
                        ? isGrouped
                          ? darkMode
                            ? "!bg-slate-800/60"
                            : "!bg-slate-50/80"
                          : darkMode
                            ? "bg-slate-800/30"
                            : "bg-white"
                        : darkMode
                          ? "hover:bg-white/[0.015] cursor-pointer"
                          : "hover:bg-slate-50/80 cursor-pointer"
                  }`}
                >
                  {/* Active time glow */}
                  {isActiveSlot && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 shadow-[2px_0_12px_theme('colors.indigo.500')] z-10" />
                  )}

                  {/* Grouped block left bar */}
                  {isGrouped && !isActiveSlot && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ backgroundColor: cat.hex }}
                    />
                  )}

                  {/* ── Col 1: Time + Checkbox ── */}
                  <div
                    className={`flex items-center gap-2 ${isGrouped ? "pl-2" : ""}`}
                  >
                    {entry && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(slot.key);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                          entry.completed
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                            : darkMode
                              ? "border-2 border-slate-600 hover:border-emerald-400"
                              : "border-2 border-slate-300 hover:border-emerald-500"
                        }`}
                      >
                        {entry.completed && <Check size={11} strokeWidth={3} />}
                      </button>
                    )}
                    <div className={entry ? "" : "ml-7"}>
                      <p
                        className={`text-[10px] sm:text-xs font-bold font-inter tabular-nums whitespace-nowrap ${
                          isActiveSlot
                            ? "text-indigo-500"
                            : entry?.completed
                              ? darkMode
                                ? "text-slate-500 line-through"
                                : "text-slate-400 line-through"
                              : darkMode
                                ? "text-slate-300"
                                : "text-slate-700"
                        }`}
                      >
                        {slot.label}
                      </p>
                      <p
                        className={`text-[9px] sm:text-[10px] font-outfit whitespace-nowrap ${entry?.completed ? "opacity-40" : ""} ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                      >
                        – {slot.endLabel}
                      </p>
                    </div>
                  </div>

                  {/* ── Col 2: Activity ── */}
                  <div
                    className={`min-w-0 transition-opacity ${entry?.completed ? "opacity-50" : ""}`}
                  >
                    {entry ? (
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 transition-all ${sameAsPrev ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"}`}
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold font-outfit flex-shrink-0 ${darkMode ? cat.dark : cat.light}`}
                        >
                          <CatIcon size={11} />
                          {cat.label}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold font-inter truncate ${darkMode ? "text-slate-100" : "text-slate-800"} ${draggedSlotKey === slot.key ? "text-indigo-400" : ""}`}
                          >
                            {entry.title}
                          </p>
                          {entry.note && (
                            <p
                              className={`text-[10px] font-outfit truncate ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                            >
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                      >
                        <Plus size={13} />
                        Click to add activity
                      </div>
                    )}
                  </div>

                  {/* ── Col 3: Duration / Actions ── */}
                  <div
                    className={`${entry ? "flex" : "hidden sm:flex"} col-start-2 sm:col-auto items-center justify-start sm:justify-end flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 w-full mt-0.5 sm:mt-0`}
                  >
                    {entry ? (
                      <>
                        {/* Timer widget */}
                        {activeTimer?.slotKey === slot.key ? (
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 ${darkMode ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
                          >
                            <span className="text-xs font-bold tabular-nums font-inter">
                              {formatTime(activeTimer.elapsedSeconds)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTimer((p) => ({
                                  ...p,
                                  isRunning: !p.isRunning,
                                }));
                              }}
                              className="p-0.5 hover:bg-black/10 rounded transition-colors"
                            >
                              {activeTimer.isRunning ? (
                                <PauseCircle size={14} />
                              ) : (
                                <PlayCircle size={14} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                stopAndSaveTimer();
                              }}
                              className="p-0.5 hover:bg-black/10 rounded transition-colors"
                              title="Stop and save"
                            >
                              <Square size={11} className="fill-current" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTimer({
                                slotKey: slot.key,
                                elapsedSeconds: 0,
                                isRunning: true,
                              });
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 mr-0 sm:mr-1 rounded-lg transition-all flex items-center gap-1 text-[10px] sm:text-xs font-outfit font-medium flex-shrink-0 ${
                              darkMode
                                ? "text-indigo-400 hover:bg-indigo-400/10"
                                : "text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title="Start Tracking Time"
                          >
                            <PlayCircle size={14} />
                            <span className="hidden lg:inline">Start</span>
                          </button>
                        )}

                        {/* Duration badge */}
                        <span
                          className={`text-[10px] sm:text-xs font-outfit font-bold tabular-nums px-2 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${darkMode ? "bg-slate-700/60 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                        >
                          {entry.elapsedSeconds > 0 ||
                          activeTimer?.slotKey === slot.key ? (
                            <>
                              <span
                                className={
                                  darkMode
                                    ? "text-indigo-400"
                                    : "text-indigo-600"
                                }
                              >
                                {Math.floor(
                                  ((entry.elapsedSeconds || 0) +
                                    (activeTimer?.slotKey === slot.key
                                      ? activeTimer.elapsedSeconds
                                      : 0)) /
                                    60,
                                )}
                                m /
                              </span>
                              <span>{entry.duration}m</span>
                            </>
                          ) : (
                            <span>{entry.duration}m</span>
                          )}
                        </span>

                        {/* Edit + Delete */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ slot, entry });
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all text-[10px] sm:text-xs font-outfit font-medium ${darkMode ? "text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10" : "text-slate-300 hover:text-indigo-600 hover:bg-indigo-50"}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEntry(slot.key);
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${darkMode ? "text-slate-600 hover:text-red-400 hover:bg-red-400/10" : "text-slate-300 hover:text-red-500 hover:bg-red-50"}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <Plus
                        size={14}
                        className={`opacity-0 group-hover:opacity-50 transition-opacity ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Slot Modal ── */}
      {modal && (
        <SlotModal
          slot={modal.slot}
          entry={modal.entry}
          globalTasks={globalTasks}
          onSave={(data) => handleAddEntry(modal.slot, data)}
          onClose={() => setModal(null)}
          darkMode={darkMode}
        />
      )}

      {/* ── Template Save Modal ── */}
      {templateModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setTemplateModal(false)}
        >
          <div
            className={`rounded-2xl border w-full max-w-sm p-6 shadow-2xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
            >
              <ListTodo size={20} />
            </div>
            <h3
              className={`font-inter font-bold text-base mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Save as Template
            </h3>
            <p
              className={`text-xs font-outfit mb-5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Give this daily layout a name to easily reuse it later.
            </p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
              placeholder="e.g. Standard Workday"
              className={`w-full px-3 py-2.5 mb-5 rounded-xl border text-sm font-outfit outline-none transition-all ${
                darkMode
                  ? "bg-slate-800 border-white/10 text-white placeholder-slate-600 focus:border-indigo-500/50"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-300"
              }`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setTemplateModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-outfit border transition-colors ${darkMode ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={!templateName.trim() || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-outfit font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
