import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  X,
  Plus,
  Loader2,
  PlayCircle,
  Flag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    dot: "bg-red-500",
    badge: "text-red-500 bg-red-500/10 border-red-500/20",
    ring: "ring-red-500/30",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-500",
    badge: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    ring: "ring-amber-500/30",
  },
  low: {
    label: "Low",
    dot: "bg-emerald-500",
    badge: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
};

export default function TaskList({ darkMode, isPomo }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [isLoading, setIsLoading] = useState(true);
  const { api, activeTask, setActiveTask } = useAuth();

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [api]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask = {
      id: tempId,
      title: input,
      priority: newPriority,
      is_completed: false,
    };
    setTasks([newTask, ...tasks]);
    setInput("");

    try {
      const res = await api.post("/tasks", {
        title: newTask.title,
        priority: newPriority,
      });
      setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
    } catch (err) {
      console.error("Failed to add task:", err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const changePriority = async (id, currentPriority) => {
    const order = ["low", "medium", "high"];
    const next = order[(order.indexOf(currentPriority) + 1) % order.length];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: next } : t)),
    );
    try {
      await api.put(`/tasks/${id}`, { priority: next });
    } catch (err) {
      console.error("Failed to update priority:", err);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, priority: currentPriority } : t,
        ),
      );
    }
  };

  const toggleTask = async (id, currentStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );
    if (activeTask?.id === id && !currentStatus === true) setActiveTask(null);
    try {
      await api.put(`/tasks/${id}`, { is_completed: !currentStatus });
    } catch (err) {
      console.error("Failed to update task:", err);
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, is_completed: currentStatus } : t,
        ),
      );
    }
  };

  const removeTask = async (id) => {
    const backup = tasks.find((t) => t.id === id);
    setTasks(tasks.filter((t) => t.id !== id));
    if (activeTask?.id === id) setActiveTask(null);
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTasks([backup, ...tasks]);
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;

  // Sort: uncompleted first, then by priority order (high first), then by date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    const pOrder = { high: 0, medium: 1, low: 2 };
    return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
  });

  return (
    <div className="w-full p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`font-outfit font-semibold tracking-wide text-sm uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Current Tasks
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            darkMode
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {completedCount} / {tasks.length}
        </span>
      </div>

      {/* Active Task Banner */}
      {activeTask && (
        <div
          className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl border text-xs font-medium ${
            darkMode
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
              : "bg-indigo-50 border-indigo-200 text-indigo-700"
          }`}
        >
          <PlayCircle size={14} className="flex-shrink-0 text-indigo-500" />
          <span className="flex-1 truncate">
            Now focusing: <strong>{activeTask.title}</strong>
          </span>
          <button
            onClick={() => setActiveTask(null)}
            className="opacity-60 hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Add Task Form */}
      <div className="mb-4 space-y-2">
        <form onSubmit={addTask} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you working on?"
            className={`w-full py-2.5 pl-4 pr-10 text-sm rounded-xl outline-none transition-all ${
              darkMode
                ? "bg-slate-800/60 text-white placeholder-slate-500 border border-white/5 focus:border-white/20"
                : "bg-white text-slate-900 placeholder-slate-400 border border-black/10 focus:border-black/20"
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-[50%] p-1 rounded-lg transition-colors ${
              !input.trim()
                ? "opacity-40 cursor-not-allowed"
                : "text-indigo-500 hover:bg-indigo-500/10"
            }`}
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Priority selector for new task */}
        <div className="flex items-center gap-1.5">
          <Flag
            size={12}
            className={darkMode ? "text-slate-500" : "text-slate-400"}
          />
          <span
            className={`text-[10px] font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Priority:
          </span>
          {["low", "medium", "high"].map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setNewPriority(p)}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold font-outfit transition-all ${
                  newPriority === p
                    ? cfg.badge + " border"
                    : darkMode
                      ? "text-slate-600 border-white/5 hover:border-white/10"
                      : "text-slate-400 border-black/5 hover:border-black/10"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1 stylish-scrollbar min-h-[140px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full opacity-50">
            <Loader2 className="animate-spin w-5 h-5 text-current" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <p
            className={`text-xs text-center italic py-4 h-full flex items-center justify-center ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            No tasks yet. Add one above!
          </p>
        ) : (
          sortedTasks.map((task) => {
            const pCfg = PRIORITY_CONFIG[task.priority ?? "medium"];
            const isActive = activeTask?.id === task.id;
            return (
              <div
                key={task.id}
                className={`group flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                  isActive
                    ? darkMode
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "bg-indigo-50 border border-indigo-200"
                    : task.is_completed
                      ? darkMode
                        ? "bg-slate-800/30 opacity-60"
                        : "bg-slate-100 opacity-60"
                      : darkMode
                        ? "bg-slate-800/80 hover:bg-slate-700"
                        : "bg-white border border-black/5 hover:border-black/15"
                }`}
              >
                {/* Toggle complete */}
                <button
                  onClick={() => toggleTask(task.id, task.is_completed)}
                  className={`flex-shrink-0 transition-colors ${
                    task.is_completed
                      ? "text-indigo-500"
                      : darkMode
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-300 hover:text-slate-500"
                  }`}
                >
                  {task.is_completed ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>

                {/* Priority dot (click to cycle) */}
                {!task.is_completed && (
                  <button
                    title={`Priority: ${pCfg.label} (click to change)`}
                    onClick={() => changePriority(task.id, task.priority)}
                    className={`flex-shrink-0 w-2 h-2 rounded-full ${pCfg.dot} mt-0.5 hover:ring-2 ${pCfg.ring} transition-all`}
                  />
                )}

                {/* Title */}
                <span
                  className={`text-sm flex-1 truncate ${
                    task.is_completed
                      ? "line-through text-slate-500"
                      : darkMode
                        ? "text-slate-200"
                        : "text-slate-700"
                  }`}
                >
                  {task.title}
                </span>

                {/* Priority badge */}
                {!task.is_completed && (
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${pCfg.badge} hidden group-hover:inline-flex opacity-0 group-hover:opacity-100 transition-all`}
                  >
                    {pCfg.label}
                  </span>
                )}

                {/* Focus button */}
                {!task.is_completed && (
                  <button
                    onClick={() => setActiveTask(isActive ? null : task)}
                    title={isActive ? "Stop focusing" : "Focus on this task"}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${
                      isActive
                        ? "opacity-100 text-indigo-500"
                        : darkMode
                          ? "text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <PlayCircle size={15} />
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => removeTask(task.id)}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-colors ${
                    darkMode
                      ? "text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                      : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
