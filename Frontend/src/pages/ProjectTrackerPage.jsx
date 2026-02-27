import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Search,
  Clock,
  CheckSquare,
  AlertCircle,
  LayoutGrid,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Target,
  Edit2,
  GripVertical,
  ChevronDown,
  X,
  Zap,
  Tag,
  Archive,
  FolderKanban,
  TrendingUp,
  StickyNote,
  Save,
  Activity,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Cell } from "recharts";
import CustomConfirmModal from "../components/CustomConfirmModal";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS = [
  { id: "backlog", title: "Backlog", color: "indigo", hex: "#6366f1" },
  { id: "in-progress", title: "In Progress", color: "amber", hex: "#f59e0b" },
  { id: "review", title: "Review", color: "purple", hex: "#a855f7" },
  { id: "completed", title: "Completed", color: "emerald", hex: "#10b981" },
];

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    classes: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  medium: {
    label: "Medium",
    classes: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    bar: "bg-amber-500",
    dot: "bg-amber-400",
  },
  low: {
    label: "Low",
    classes: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

// 6 preset project color labels
const COLOR_LABELS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#06b6d4", name: "Cyan" },
];

function getDueDateBadge(due_date, status) {
  if (!due_date || status === "completed") return null;
  const now = new Date();
  const due = new Date(due_date);
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return {
      label: `Overdue ${Math.abs(diffDays)}d`,
      style: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    };
  } else if (diffDays <= 3) {
    return {
      label: `${diffDays}d left`,
      style: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    };
  }
  return null;
}

function FormField({ label, darkMode, children }) {
  return (
    <div>
      <label
        className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
          darkMode ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = (darkMode) =>
  `w-full px-4 py-2.5 rounded-xl outline-none text-sm transition-all border focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
    darkMode
      ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
  }`;

export default function ProjectTrackerPage({ darkMode }) {
  const { api, setTimerProject, setTimerTask } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "",
    priority: "medium",
    due_date: "",
    status: "backlog",
    color: null,
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [detailsTab, setDetailsTab] = useState("tasks"); // "tasks" | "notes" | "activity"
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const notesSaveTimer = useRef(null);
  const [projectActivities, setProjectActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a855f7", "#10b981", "#f59e0b"],
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", newProject);
      setNewProject({
        name: "",
        description: "",
        category: "",
        priority: "medium",
        due_date: "",
        status: "backlog",
        color: null,
      });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleDeleteProject = (id) => {
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating project status:", error);
      fetchProjects();
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${selectedProjectId}`, editedProject);
      setIsEditingProject(false);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const startEditing = () => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) return;
    setEditedProject({
      name: proj.name || "",
      description: proj.description || "",
      category: proj.category || "",
      priority: proj.priority || "medium",
      status: proj.status || "backlog",
      due_date: proj.due_date ? proj.due_date.split("T")[0] : "",
      color: proj.color || null,
    });
    setIsEditingProject(true);
  };

  const handleToggleArchive = async (projectId, currentArchived) => {
    try {
      await api.put(`/projects/${projectId}`, { archived: !currentArchived });
      fetchProjects();
    } catch (error) {
      console.error("Error toggling project archive:", error);
    }
  };

  const handleAddTask = async (projectId, e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    try {
      await api.post(`/projects/${projectId}/tasks`, { title: newTaskName });
      setNewTaskName("");
      fetchProjects();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (projectId, taskId, isCompleted) => {
    try {
      await api.put(`/projects/tasks/${taskId}`, {
        is_completed: !isCompleted,
      });
      // Check if all tasks will be completed after this toggle
      if (!isCompleted) {
        const proj = projects.find((p) => p.id === projectId);
        if (proj) {
          const remaining = proj.tasks.filter(
            (t) => t.id !== taskId && !t.is_completed,
          ).length;
          if (remaining === 0) fireConfetti();
        }
      }
      fetchProjects();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (projectId, taskId) => {
    try {
      await api.delete(`/projects/tasks/${taskId}`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStartFocus = (projectId) => {
    setTimerProject(projectId);
    setTimerTask(null);
    navigate("/timer");
  };

  const fetchActivities = async (projectId) => {
    setActivitiesLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/activity`);
      setProjectActivities(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error fetching activities:", e);
      setProjectActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const openProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setIsDetailsModalOpen(true);
    setIsEditingProject(false);
    setDetailsTab("tasks");
    setProjectActivities([]);
    const proj = projects.find((p) => p.id === projectId);
    setNotesDraft(proj?.notes || "");
    fetchActivities(projectId);
  };

  const handleNotesChange = (value) => {
    setNotesDraft(value);
    clearTimeout(notesSaveTimer.current);
    notesSaveTimer.current = setTimeout(async () => {
      setNotesSaving(true);
      try {
        await api.put(`/projects/${selectedProjectId}`, { notes: value });
        setProjects((prev) =>
          prev.map((p) =>
            p.id === selectedProjectId ? { ...p, notes: value } : p,
          ),
        );
      } catch (e) {
        console.error("Error saving notes:", e);
      } finally {
        setNotesSaving(false);
      }
    }, 900); // autosave after 900ms of inactivity
  };

  const handleStartTaskFocus = (projectId, taskId) => {
    setTimerProject(projectId);
    setTimerTask(taskId);
    navigate("/timer");
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    const activeProject = projects.find((p) => p.id === active.id);
    if (!activeProject) return;
    const overColumn = COLUMNS.find((col) => col.id === over.id);
    const overProject = projects.find((p) => p.id === over.id);
    const newStatus = overColumn
      ? overColumn.id
      : overProject
        ? overProject.status
        : null;
    if (newStatus && activeProject.status !== newStatus) {
      setProjects((prev) =>
        prev.map((p) => (p.id === active.id ? { ...p, status: newStatus } : p)),
      );
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeProject = projects.find((p) => p.id === active.id);
    if (activeProject) {
      if (activeProject.status === "completed") fireConfetti();
      handleUpdateProjectStatus(activeProject.id, activeProject.status);
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    return Math.round(
      (tasks.filter((t) => t.is_completed).length / tasks.length) * 100,
    );
  };

  const filteredProjects = projects.filter((p) => {
    if (p.archived) return false; // always hide archived from main board
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const archivedProjects = projects.filter((p) => p.archived);

  const chartData = useMemo(() => {
    return projects
      .filter((p) => (p.total_time_seconds || 0) > 0)
      .map((p) => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
        fullName: p.name,
        hours: parseFloat(((p.total_time_seconds || 0) / 3600).toFixed(2)),
        color: p.color || "#6366f1",
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [projects]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status !== "completed").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const overdue = projects.filter(
      (p) =>
        p.due_date &&
        new Date(p.due_date) < new Date() &&
        p.status !== "completed",
    ).length;
    return { total, active, completed, overdue };
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div
      className={`min-h-full font-outfit ${darkMode ? "text-slate-200" : "text-slate-800"}`}
    >
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <FolderKanban size={20} className="text-white" />
            </div>
            <h1
              className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Project{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Tracker
              </span>
            </h1>
          </div>
          <p
            className={`text-sm ml-[52px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Manage workflows with a Kanban board · drag cards between columns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 size-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/40 outline-none w-44 border ${
                darkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-600"
                  : "bg-white border-slate-200 shadow-sm text-slate-800"
              }`}
            />
          </div>

          {/* Status filter pills */}
          <div
            className={`flex items-center rounded-xl p-1 gap-1 border text-xs font-bold ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}
          >
            {["all", ...COLUMNS.map((c) => c.id)].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white shadow"
                    : darkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s === "all" ? "All" : COLUMNS.find((c) => c.id === s)?.title}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
              darkMode
                ? "bg-white/5 border-white/10 text-slate-300"
                : "bg-white border-slate-200 shadow-sm text-slate-600"
            }`}
          >
            <option value="all">All Priority</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all border ${
              showArchived
                ? darkMode
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-amber-50 border-amber-200 text-amber-600"
                : darkMode
                  ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm"
            }`}
          >
            <Archive size={13} />
            {showArchived
              ? "Hide Archived"
              : `Archived (${projects.filter((p) => p.archived).length})`}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all font-bold text-sm active:scale-95"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: LayoutGrid,
            from: "from-indigo-500",
            to: "to-violet-600",
            glow: "shadow-indigo-500/20",
            sub: "all projects",
            border: "border-indigo-200",
            darkBorder: "border-indigo-500/15",
          },
          {
            label: "Active",
            value: stats.active,
            icon: TrendingUp,
            from: "from-amber-400",
            to: "to-orange-500",
            glow: "shadow-amber-500/20",
            sub: "in progress",
            border: "border-amber-200",
            darkBorder: "border-amber-500/15",
          },
          {
            label: "Done",
            value: stats.completed,
            icon: CheckCircle2,
            from: "from-emerald-400",
            to: "to-teal-500",
            glow: "shadow-emerald-500/20",
            sub: "completed",
            border: "border-emerald-200",
            darkBorder: "border-emerald-500/15",
          },
          {
            label: "Overdue",
            value: stats.overdue,
            icon: AlertCircle,
            from: "from-rose-500",
            to: "to-pink-600",
            glow: "shadow-rose-500/20",
            sub: "past due date",
            border: "border-rose-200",
            darkBorder: "border-rose-500/15",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg ${
              darkMode
                ? `bg-white/[0.025] ${s.darkBorder} hover:border-opacity-40`
                : `bg-white ${s.border} shadow-sm hover:${s.glow}`
            }`}
          >
            {/* Radial glow */}
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${s.from} ${s.to} opacity-10 blur-2xl pointer-events-none`}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${s.from} ${s.to} shadow-md ${s.glow}`}
              >
                <s.icon size={17} className="text-white" />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${darkMode ? "bg-white/5 text-slate-500" : "bg-slate-50 text-slate-400"}`}
              >
                {s.sub}
              </span>
            </div>
            <div
              className={`text-4xl font-black mb-0.5 leading-none ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {s.value}
            </div>
            <div
              className={`text-xs font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Time Analytics Chart ─── */}
      {chartData.length > 0 && (
        <div
          className={`rounded-2xl border p-5 mb-8 transition-all ${
            darkMode
              ? "bg-white/[0.025] border-white/6"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-sm font-black ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Focus Time per Project
              </h3>
              <p
                className={`text-[10px] font-bold ${darkMode ? "text-slate-600" : "text-slate-400"}`}
              >
                Hours logged per project
              </p>
            </div>
            <button
              onClick={() => setShowChart((v) => !v)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${darkMode ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              {showChart ? "Hide" : "Show"}
            </button>
          </div>
          {showChart && (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={chartData}
                barSize={28}
                margin={{ top: 0, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: darkMode ? "#64748b" : "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: darkMode ? "#64748b" : "#94a3b8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-xl border ${darkMode ? "bg-[#1c1c2e] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}
                      >
                        <p>{payload[0].payload.fullName}</p>
                        <p className="text-indigo-400">
                          {payload[0].value}h focused
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ─── Kanban Board ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="size-10 text-indigo-500 animate-spin mb-4" />
          <p
            className={`text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Loading your board…
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {COLUMNS.map((column) => (
              <ProjectColumn
                key={column.id}
                column={column}
                projects={filteredProjects.filter(
                  (p) => p.status === column.id,
                )}
                darkMode={darkMode}
                onDelete={handleDeleteProject}
                calculateProgress={calculateProgress}
                onOpenDetails={openProjectDetails}
                onStartFocus={handleStartFocus}
                onAddProject={() => {
                  setNewProject((p) => ({ ...p, status: column.id }));
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.3" } },
              }),
            }}
          >
            {activeId && activeProject ? (
              <ProjectCard
                project={activeProject}
                darkMode={darkMode}
                onDelete={() => {}}
                calculateProgress={calculateProgress}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ─── Archived Projects ─── */}
      {showArchived && archivedProjects.length > 0 && (
        <div className="mt-8">
          <div
            className={`flex items-center gap-3 mb-4 pb-2 border-b ${darkMode ? "border-white/5" : "border-slate-200"}`}
          >
            <Archive
              size={15}
              className={darkMode ? "text-amber-400" : "text-amber-500"}
            />
            <h3
              className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Archived Projects
            </h3>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}`}
            >
              {archivedProjects.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {archivedProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openProjectDetails(project.id)}
                className={`relative rounded-2xl border p-4 cursor-pointer opacity-60 hover:opacity-80 transition-all grayscale hover:grayscale-0 ${
                  darkMode
                    ? "bg-white/[0.02] border-white/5"
                    : "bg-white border-slate-100 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-600 border border-amber-200"}`}
                  >
                    Archived
                  </span>
                </div>
                <h4
                  className={`font-bold text-sm leading-snug line-clamp-1 mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  {project.name}
                </h4>
                {project.category && (
                  <p
                    className={`text-[10px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {project.category}
                  </p>
                )}
                <div
                  className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                >
                  <Archive size={10} />
                  Click to unarchive
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── New Project Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
          <div
            className={`w-full max-w-md rounded-3xl shadow-2xl border ${
              darkMode
                ? "bg-[#13131f] border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`px-8 pt-8 pb-6 border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <FolderKanban size={18} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      New Project
                    </h2>
                    <p
                      className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Fill in the details below
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-2 rounded-xl transition-all ${darkMode ? "hover:bg-white/5 text-slate-500 hover:text-white" : "hover:bg-slate-100 text-slate-400"}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProject} className="p-8 space-y-4">
              <FormField label="Project Name" darkMode={darkMode}>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="e.g., Marketing Revamp"
                  className={inputClass(darkMode)}
                />
              </FormField>

              <FormField label="Category / Tag" darkMode={darkMode}>
                <div className="relative">
                  <Tag
                    className={`absolute left-3 top-1/2 -translate-y-1/2 size-3.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                  />
                  <input
                    type="text"
                    value={newProject.category}
                    onChange={(e) =>
                      setNewProject({ ...newProject, category: e.target.value })
                    }
                    placeholder="e.g., Work, Design…"
                    className={`${inputClass(darkMode)} pl-9`}
                  />
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Priority" darkMode={darkMode}>
                  <select
                    value={newProject.priority}
                    onChange={(e) =>
                      setNewProject({ ...newProject, priority: e.target.value })
                    }
                    className={inputClass(darkMode)}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </FormField>
                <FormField label="Initial Status" darkMode={darkMode}>
                  <select
                    value={newProject.status}
                    onChange={(e) =>
                      setNewProject({ ...newProject, status: e.target.value })
                    }
                    className={inputClass(darkMode)}
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Due Date" darkMode={darkMode}>
                <div className="relative">
                  <Calendar
                    className={`absolute left-3 top-1/2 -translate-y-1/2 size-3.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                  />
                  <input
                    type="date"
                    value={newProject.due_date}
                    onChange={(e) =>
                      setNewProject({ ...newProject, due_date: e.target.value })
                    }
                    className={`${inputClass(darkMode)} pl-9`}
                  />
                </div>
              </FormField>

              <FormField label="Description" darkMode={darkMode}>
                <textarea
                  rows="3"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="What is this project about?"
                  className={`${inputClass(darkMode)} resize-none`}
                />
              </FormField>

              {/* Color Label */}
              <div>
                <label
                  className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Color Label
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_LABELS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() =>
                        setNewProject({
                          ...newProject,
                          color: newProject.color === c.hex ? null : c.hex,
                        })
                      }
                      title={c.name}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110 focus:outline-none"
                      style={{
                        background: c.hex,
                        boxShadow:
                          newProject.color === c.hex
                            ? `0 0 0 3px ${c.hex}55, 0 0 0 5px ${c.hex}22`
                            : "none",
                        transform:
                          newProject.color === c.hex ? "scale(1.2)" : undefined,
                      }}
                    />
                  ))}
                  {newProject.color && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewProject({ ...newProject, color: null })
                      }
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${darkMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    darkMode
                      ? "bg-white/5 text-slate-400 hover:text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Project Details / Edit Modal ─── */}
      {isDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
          <div
            className={`w-full max-w-3xl rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] ${
              darkMode
                ? "bg-[#13131f] border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            {isEditingProject ? (
              /* ── Edit Form ── */
              <form
                onSubmit={handleSaveProject}
                className="flex flex-col h-full"
              >
                <div
                  className={`flex items-center justify-between px-8 py-6 border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                      <Edit2 size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <h2
                        className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}
                      >
                        Edit Project
                      </h2>
                      <p
                        className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Update project details
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className={`p-2 rounded-xl ${darkMode ? "hover:bg-white/5 text-slate-500" : "hover:bg-slate-100 text-slate-400"}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                  <FormField label="Project Name" darkMode={darkMode}>
                    <input
                      required
                      type="text"
                      value={editedProject.name}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          name: e.target.value,
                        })
                      }
                      className={inputClass(darkMode)}
                    />
                  </FormField>
                  <FormField label="Category / Tag" darkMode={darkMode}>
                    <input
                      type="text"
                      value={editedProject.category}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          category: e.target.value,
                        })
                      }
                      className={inputClass(darkMode)}
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Priority" darkMode={darkMode}>
                      <select
                        value={editedProject.priority}
                        onChange={(e) =>
                          setEditedProject({
                            ...editedProject,
                            priority: e.target.value,
                          })
                        }
                        className={inputClass(darkMode)}
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                      </select>
                    </FormField>
                    <FormField label="Status" darkMode={darkMode}>
                      <select
                        value={editedProject.status}
                        onChange={(e) =>
                          setEditedProject({
                            ...editedProject,
                            status: e.target.value,
                          })
                        }
                        className={inputClass(darkMode)}
                      >
                        {COLUMNS.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.title}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Due Date" darkMode={darkMode}>
                    <input
                      type="date"
                      value={editedProject.due_date}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          due_date: e.target.value,
                        })
                      }
                      className={inputClass(darkMode)}
                    />
                  </FormField>
                  <FormField label="Description" darkMode={darkMode}>
                    <textarea
                      rows="4"
                      value={editedProject.description}
                      onChange={(e) =>
                        setEditedProject({
                          ...editedProject,
                          description: e.target.value,
                        })
                      }
                      className={`${inputClass(darkMode)} resize-none`}
                    />
                  </FormField>

                  {/* Color Label picker (edit form) */}
                  <div>
                    <label
                      className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Color Label
                    </label>
                    <div className="flex items-center gap-2">
                      {COLOR_LABELS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            setEditedProject({
                              ...editedProject,
                              color:
                                editedProject.color === c.hex ? null : c.hex,
                            })
                          }
                          title={c.name}
                          className="w-7 h-7 rounded-full transition-all hover:scale-110 focus:outline-none"
                          style={{
                            background: c.hex,
                            boxShadow:
                              editedProject?.color === c.hex
                                ? `0 0 0 3px ${c.hex}55, 0 0 0 5px ${c.hex}22`
                                : "none",
                            transform:
                              editedProject?.color === c.hex
                                ? "scale(1.2)"
                                : undefined,
                          }}
                        />
                      ))}
                      {editedProject?.color && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditedProject({ ...editedProject, color: null })
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${darkMode ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex gap-3 px-8 py-5 border-t ${darkMode ? "border-white/5" : "border-slate-100"}`}
                >
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${darkMode ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* ── Detail View ── */
              <>
                {/* Header */}
                <div
                  className={`px-8 py-6 border-b relative overflow-hidden ${darkMode ? "border-white/5" : "border-slate-100"}`}
                  style={{
                    background: darkMode
                      ? "linear-gradient(135deg, #13131f 0%, #1a1030 100%)"
                      : "linear-gradient(135deg, #f8f7ff 0%, #ede9fe 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 60%)",
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${PRIORITY_CONFIG[selectedProject.priority]?.classes}`}
                          >
                            {selectedProject.priority}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}
                          >
                            {COLUMNS.find(
                              (c) => c.id === selectedProject.status,
                            )?.title || selectedProject.status}
                          </span>
                          {selectedProject.category && (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${darkMode ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"}`}
                            >
                              <Tag size={8} className="inline mr-1" />
                              {selectedProject.category}
                            </span>
                          )}
                          {selectedProject.archived && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-amber-500/10 border-amber-500/20 text-amber-500">
                              Archived
                            </span>
                          )}
                        </div>
                        <h2
                          className={`text-2xl font-black leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {selectedProject.name}
                        </h2>
                        {selectedProject.due_date && (
                          <p
                            className={`flex items-center gap-1.5 text-xs font-bold mt-2 ${
                              new Date(selectedProject.due_date) < new Date() &&
                              selectedProject.status !== "completed"
                                ? "text-rose-500"
                                : darkMode
                                  ? "text-slate-500"
                                  : "text-slate-400"
                            }`}
                          >
                            <CalendarDays size={12} />
                            Due{" "}
                            {new Date(
                              selectedProject.due_date,
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStartFocus(selectedProject.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                          title="Start Focus Session"
                        >
                          <Zap size={13} /> Focus
                        </button>
                        <button
                          onClick={startEditing}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${darkMode ? "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          title="Edit Project"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleArchive(
                              selectedProject.id,
                              selectedProject.archived,
                            )
                          }
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${selectedProject.archived ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : darkMode ? "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          title={
                            selectedProject.archived ? "Unarchive" : "Archive"
                          }
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          onClick={() => setIsDetailsModalOpen(false)}
                          className={`p-2 rounded-xl transition-all ${darkMode ? "hover:bg-white/5 text-slate-500 hover:text-white" : "hover:bg-slate-100 text-slate-400"}`}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-5 mt-4">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                      >
                        <Clock size={13} />
                        {Math.floor(
                          (selectedProject.total_time_seconds || 0) / 3600,
                        ) > 0
                          ? `${Math.floor((selectedProject.total_time_seconds || 0) / 3600)}h ${Math.floor(((selectedProject.total_time_seconds || 0) % 3600) / 60)}m`
                          : `${Math.floor((selectedProject.total_time_seconds || 0) / 60)}m`}{" "}
                        focused
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        <CheckSquare size={13} />
                        {selectedProject.tasks?.filter((t) => t.is_completed)
                          .length || 0}{" "}
                        / {selectedProject.tasks?.length || 0} tasks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body — two columns */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid md:grid-cols-[1fr_1.3fr] h-full">
                    {/* Left: Description + Progress */}
                    <div
                      className={`p-6 space-y-6 border-r ${darkMode ? "border-white/5" : "border-slate-100"}`}
                    >
                      <div>
                        <p
                          className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                        >
                          Description
                        </p>
                        <p
                          className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {selectedProject.description ||
                            "No description provided for this project."}
                        </p>
                      </div>

                      {selectedProject.tasks &&
                        selectedProject.tasks.length > 0 && (
                          <div>
                            <p
                              className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                            >
                              Overall Progress
                            </p>
                            <div className="flex items-end gap-3 mb-2">
                              <span
                                className={`text-4xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}
                              >
                                {calculateProgress(selectedProject.tasks)}%
                              </span>
                              <span
                                className={`text-xs mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                              >
                                {
                                  selectedProject.tasks.filter(
                                    (t) => t.is_completed,
                                  ).length
                                }{" "}
                                of {selectedProject.tasks.length} done
                              </span>
                            </div>
                            <div
                              className={`h-2 w-full rounded-full overflow-hidden ${darkMode ? "bg-white/5" : "bg-slate-100"}`}
                            >
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  calculateProgress(selectedProject.tasks) ===
                                  100
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                }`}
                                style={{
                                  width: `${calculateProgress(selectedProject.tasks)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Right: Tabbed — Tasks / Notes */}
                    <div className="p-6 flex flex-col">
                      {/* Tab Headers */}
                      <div
                        className={`flex items-center gap-1 p-1 rounded-xl mb-5 w-fit border ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-100 border-slate-200"}`}
                      >
                        {[
                          { id: "tasks", label: "Tasks", icon: CheckSquare },
                          { id: "notes", label: "Notes", icon: StickyNote },
                          { id: "activity", label: "Activity", icon: Activity },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setDetailsTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              detailsTab === tab.id
                                ? "bg-indigo-600 text-white shadow"
                                : darkMode
                                  ? "text-slate-400 hover:text-white"
                                  : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <tab.icon size={12} />
                            {tab.label}
                            {tab.id === "tasks" && (
                              <span
                                className={`ml-0.5 text-[9px] px-1 rounded-full ${detailsTab === "tasks" ? "bg-white/20 text-white" : darkMode ? "bg-white/10 text-slate-400" : "bg-slate-200 text-slate-500"}`}
                              >
                                {selectedProject.tasks?.length || 0}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Tasks Tab */}
                      {detailsTab === "tasks" && (
                        <>
                          <form
                            onSubmit={(e) =>
                              handleAddTask(selectedProject.id, e)
                            }
                            className="flex gap-2 mb-4"
                          >
                            <input
                              type="text"
                              value={newTaskName}
                              onChange={(e) => setNewTaskName(e.target.value)}
                              placeholder="Add a task…"
                              className={`flex-1 px-3 py-2 text-sm rounded-xl outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 ${
                                darkMode
                                  ? "bg-white/5 border-white/10 text-white placeholder-slate-600"
                                  : "bg-slate-50 border-slate-200 text-slate-900"
                              }`}
                            />
                            <button
                              type="submit"
                              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-md"
                            >
                              <Plus size={18} />
                            </button>
                          </form>

                          <div className="space-y-1.5 overflow-y-auto max-h-[280px] pr-1">
                            {selectedProject.tasks &&
                            selectedProject.tasks.length > 0 ? (
                              selectedProject.tasks.map((task) => {
                                const taskMin = Math.floor(
                                  (task.time_seconds || 0) / 60,
                                );
                                const taskTime =
                                  taskMin >= 60
                                    ? `${Math.floor(taskMin / 60)}h ${taskMin % 60}m`
                                    : `${taskMin}m`;
                                return (
                                  <div
                                    key={task.id}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all group ${
                                      darkMode
                                        ? "border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                    } ${task.is_completed ? "opacity-50" : ""}`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <button
                                        onClick={() =>
                                          handleToggleTask(
                                            selectedProject.id,
                                            task.id,
                                            task.is_completed,
                                          )
                                        }
                                        className={`shrink-0 transition-all ${task.is_completed ? "text-emerald-500" : darkMode ? "text-slate-600 hover:text-indigo-400" : "text-slate-300 hover:text-indigo-500"}`}
                                      >
                                        {task.is_completed ? (
                                          <CheckCircle2 size={17} />
                                        ) : (
                                          <Circle size={17} />
                                        )}
                                      </button>
                                      <div className="min-w-0 flex-1">
                                        <span
                                          className={`text-sm block truncate ${task.is_completed ? "line-through" : ""} ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                                        >
                                          {task.title}
                                        </span>
                                        {taskMin > 0 && (
                                          <span
                                            className={`text-[9px] flex items-center gap-1 ${darkMode ? "text-indigo-400/70" : "text-indigo-400"}`}
                                          >
                                            <Clock size={9} />
                                            {taskTime} focused
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                      {!task.is_completed && (
                                        <button
                                          onClick={() =>
                                            handleStartTaskFocus(
                                              selectedProject.id,
                                              task.id,
                                            )
                                          }
                                          title="Focus on this task"
                                          className={`p-1.5 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-all ${darkMode ? "text-slate-600" : "text-slate-300"}`}
                                        >
                                          <Zap size={13} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          handleDeleteTask(
                                            selectedProject.id,
                                            task.id,
                                          )
                                        }
                                        className={`p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all ${darkMode ? "text-slate-600" : "text-slate-300"}`}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div
                                className={`py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 ${darkMode ? "border-white/5 text-slate-700" : "border-slate-100 text-slate-300"}`}
                              >
                                <CheckSquare size={28} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  No tasks yet
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Notes Tab */}
                      {detailsTab === "notes" && (
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p
                              className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                            >
                              Project Notes
                            </p>
                            <span
                              className={`flex items-center gap-1 text-[9px] font-bold transition-all ${notesSaving ? (darkMode ? "text-indigo-400" : "text-indigo-500") : darkMode ? "text-slate-700" : "text-slate-300"}`}
                            >
                              <Save size={9} />
                              {notesSaving ? "Saving…" : "Auto-saved"}
                            </span>
                          </div>
                          <textarea
                            value={notesDraft}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            placeholder="Jot down ideas, links, meeting notes, or anything related to this project…"
                            className={`flex-1 w-full p-3 text-sm rounded-2xl outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 resize-none min-h-[260px] leading-relaxed ${
                              darkMode
                                ? "bg-white/[0.03] border-white/8 text-slate-300 placeholder-slate-700"
                                : "bg-slate-50/80 border-slate-200 text-slate-700 placeholder-slate-300"
                            }`}
                          />
                        </div>
                      )}

                      {/* Activity Tab */}
                      {detailsTab === "activity" && (
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <p
                              className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                            >
                              Timeline
                            </p>
                            <button
                              onClick={() =>
                                fetchActivities(selectedProject.id)
                              }
                              className={`text-[9px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${darkMode ? "text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10" : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"}`}
                            >
                              <Activity size={9} /> Refresh
                            </button>
                          </div>
                          <div className="overflow-y-auto max-h-[300px] space-y-0 relative">
                            {activitiesLoading ? (
                              <div className="flex items-center justify-center py-10">
                                <Loader2 className="size-6 text-indigo-500 animate-spin" />
                              </div>
                            ) : projectActivities.length === 0 ? (
                              <div
                                className={`py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 ${darkMode ? "border-white/5 text-slate-700" : "border-slate-100 text-slate-300"}`}
                              >
                                <Activity size={24} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  No activity yet
                                </span>
                                <span
                                  className={`text-[10px] ${darkMode ? "text-slate-700" : "text-slate-300"}`}
                                >
                                  Events will appear as you work
                                </span>
                              </div>
                            ) : (
                              <div className="relative">
                                {/* Timeline vertical line */}
                                <div
                                  className={`absolute left-[11px] top-2 bottom-2 w-px ${darkMode ? "bg-white/5" : "bg-slate-200"}`}
                                />
                                <div className="space-y-3">
                                  {projectActivities.map((act) => {
                                    const typeConfig = {
                                      focus_session: {
                                        dot: "bg-indigo-500",
                                        text: darkMode
                                          ? "text-indigo-400"
                                          : "text-indigo-600",
                                        icon: "⚡",
                                      },
                                      task_added: {
                                        dot: "bg-emerald-500",
                                        text: darkMode
                                          ? "text-emerald-400"
                                          : "text-emerald-600",
                                        icon: "＋",
                                      },
                                      task_completed: {
                                        dot: "bg-emerald-500",
                                        text: darkMode
                                          ? "text-emerald-400"
                                          : "text-emerald-600",
                                        icon: "✓",
                                      },
                                      task_deleted: {
                                        dot: "bg-rose-500",
                                        text: darkMode
                                          ? "text-rose-400"
                                          : "text-rose-600",
                                        icon: "✕",
                                      },
                                      status_change: {
                                        dot: "bg-amber-500",
                                        text: darkMode
                                          ? "text-amber-400"
                                          : "text-amber-600",
                                        icon: "→",
                                      },
                                      archived: {
                                        dot: "bg-slate-400",
                                        text: darkMode
                                          ? "text-slate-400"
                                          : "text-slate-500",
                                        icon: "□",
                                      },
                                      project_created: {
                                        dot: "bg-purple-500",
                                        text: darkMode
                                          ? "text-purple-400"
                                          : "text-purple-600",
                                        icon: "★",
                                      },
                                    }[act.type] || {
                                      dot: "bg-slate-400",
                                      text: darkMode
                                        ? "text-slate-400"
                                        : "text-slate-500",
                                      icon: "·",
                                    };

                                    const ts = new Date(act.created_at);
                                    const now = new Date();
                                    const diffMs = now - ts;
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMins / 60);
                                    const diffDays = Math.floor(diffHours / 24);
                                    const relTime =
                                      diffMins < 1
                                        ? "just now"
                                        : diffMins < 60
                                          ? `${diffMins}m ago`
                                          : diffHours < 24
                                            ? `${diffHours}h ago`
                                            : diffDays < 7
                                              ? `${diffDays}d ago`
                                              : ts.toLocaleDateString("en-GB", {
                                                  day: "numeric",
                                                  month: "short",
                                                });

                                    return (
                                      <div
                                        key={act.id}
                                        className="flex items-start gap-3 pl-1"
                                      >
                                        <div
                                          className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5 ${typeConfig.dot} border-opacity-30 text-white`}
                                        >
                                          {typeConfig.icon}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-3">
                                          <p
                                            className={`text-xs leading-snug ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                                          >
                                            {act.message}
                                          </p>
                                          <p
                                            className={`text-[9px] mt-0.5 font-bold ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                                          >
                                            {relTime}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`px-8 py-4 border-t flex justify-end ${darkMode ? "border-white/5" : "border-slate-100"}`}
                >
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${darkMode ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <CustomConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will permanently remove the project and all associated tasks."
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        darkMode={darkMode}
      />
    </div>
  );
}

/* ─────────────────────────────────── Column ─────────────────────────────────── */
function ProjectColumn({
  column,
  projects,
  darkMode,
  onDelete,
  calculateProgress,
  onOpenDetails,
  onStartFocus,
  onAddProject,
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

  const colBgMap = {
    indigo: { light: "rgba(99,102,241,0.04)", dark: "rgba(99,102,241,0.07)" },
    amber: { light: "rgba(245,158,11,0.04)", dark: "rgba(245,158,11,0.07)" },
    purple: { light: "rgba(168,85,247,0.04)", dark: "rgba(168,85,247,0.07)" },
    emerald: { light: "rgba(16,185,129,0.04)", dark: "rgba(16,185,129,0.07)" },
  };
  const colBg = colBgMap[column.color] || colBgMap.indigo;

  return (
    <div ref={setNodeRef} className="flex flex-col gap-3">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
          darkMode
            ? "border-white/6 bg-white/[0.025]"
            : "border-slate-100 bg-white shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: column.hex,
              boxShadow: `0 0 0 4px ${column.hex}22`,
            }}
          />
          <span
            className="font-black text-xs uppercase tracking-widest"
            style={{ color: column.hex }}
          >
            {column.title}
          </span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full min-w-[22px] text-center text-white"
            style={{ backgroundColor: column.hex + "cc" }}
          >
            {projects.length}
          </span>
        </div>
        <button
          onClick={onAddProject}
          title={`Add to ${column.title}`}
          className={`p-1.5 rounded-lg transition-all opacity-50 hover:opacity-100 ${
            darkMode
              ? "hover:bg-white/10 text-slate-400"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Card list */}
      <div
        className={`min-h-[140px] rounded-2xl p-2 border transition-colors`}
        style={{
          background: darkMode ? colBg.dark : colBg.light,
          borderColor: darkMode ? `${column.hex}18` : `${column.hex}20`,
          borderStyle: "dashed",
        }}
      >
        <SortableContext
          id={column.id}
          items={projectIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2.5">
            {projects.map((project) => (
              <SortableProjectCard
                key={project.id}
                project={project}
                darkMode={darkMode}
                onDelete={onDelete}
                calculateProgress={calculateProgress}
                onOpenDetails={onOpenDetails}
                onStartFocus={onStartFocus}
              />
            ))}
            {projects.length === 0 && (
              <div
                className={`py-10 flex flex-col items-center justify-center gap-2 ${darkMode ? "text-slate-700" : "text-slate-300"}`}
              >
                <div className="text-2xl opacity-40">⬇</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Drop here
                </span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── Sortable ─────────────────────────────────── */
function SortableProjectCard({ project, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: { type: "Project", project },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ProjectCard project={project} {...props} dragListeners={listeners} />
    </div>
  );
}

/* ─────────────────────────────────── Card ─────────────────────────────────── */
function ProjectCard({
  project,
  darkMode,
  onDelete,
  calculateProgress,
  onOpenDetails,
  onStartFocus,
  isOverlay = false,
  dragListeners = {},
}) {
  const progress = calculateProgress(project.tasks);
  const pConfig = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.medium;
  const isOverdue =
    project.due_date &&
    new Date(project.due_date) < new Date() &&
    project.status !== "completed";
  const dueBadge = getDueDateBadge(project.due_date, project.status);
  const totalMin = Math.floor((project.total_time_seconds || 0) / 60);
  const timeDisplay =
    totalMin >= 60
      ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
      : `${totalMin}m`;
  const completedTasks =
    project.tasks?.filter((t) => t.is_completed).length || 0;
  const totalTasks = project.tasks?.length || 0;
  // Color label takes priority over priority bar
  const borderColor = project.color || null;

  return (
    <div
      onClick={() => onOpenDetails?.(project.id)}
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
        isOverlay
          ? "shadow-2xl scale-[1.04] cursor-grabbing rotate-1"
          : "hover:shadow-xl hover:-translate-y-0.5"
      } ${project.archived ? "opacity-50 grayscale" : ""} ${
        darkMode
          ? "bg-[#18182a] border-white/8 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
          : "bg-white border-slate-150 hover:border-indigo-200 shadow-sm hover:shadow-indigo-500/10"
      }`}
    >
      {/* Color/Priority left border accent */}
      {borderColor ? (
        <div
          className="absolute left-0 top-0 bottom-0 rounded-l-2xl"
          style={{ width: 4, background: borderColor }}
        />
      ) : (
        <div
          className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl ${pConfig.bar}`}
          style={{ width: 4 }}
        />
      )}

      <div className="pl-5 pr-4 pt-4 pb-4">
        {/* Top row: chips + actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${pConfig.classes}`}
            >
              {project.priority}
            </span>
            {project.category && (
              <span
                className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                  darkMode
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}
              >
                {project.category}
              </span>
            )}
            {isOverdue && (
              <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider bg-rose-500/10 border-rose-500/20 text-rose-500">
                Overdue
              </span>
            )}
          </div>

          {/* Actions: only visible in non-overlay mode */}
          {!isOverlay && (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <span
                {...dragListeners}
                onClick={(e) => e.stopPropagation()}
                className={`p-1.5 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all touch-none ${
                  darkMode
                    ? "text-slate-600 hover:text-slate-400 hover:bg-white/5"
                    : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                }`}
              >
                <GripVertical size={14} />
              </span>
              <button
                onClick={() => onStartFocus?.(project.id)}
                title="Start Focus Session"
                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                  darkMode
                    ? "text-indigo-400 hover:bg-indigo-400/10"
                    : "text-indigo-500 hover:bg-indigo-50"
                }`}
              >
                <Zap size={13} />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                  darkMode
                    ? "text-slate-600 hover:text-rose-400 hover:bg-rose-400/10"
                    : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                }`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Project name */}
        <h4
          className={`font-bold text-sm leading-snug mb-1.5 group-hover:text-indigo-500 transition-colors line-clamp-2 ${darkMode ? "text-white" : "text-slate-900"}`}
        >
          {project.name}
          {project.archived && (
            <span className="text-[9px] font-normal opacity-50 ml-1">
              (archived)
            </span>
          )}
        </h4>

        {/* Description */}
        {project.description && (
          <p
            className={`text-[11px] leading-relaxed line-clamp-2 mb-3 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            {project.description}
          </p>
        )}

        {/* Meta row: time + due date */}
        <div
          className={`flex items-center justify-between text-[10px] font-bold mb-3 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          <div className="flex items-center gap-1">
            <Clock size={11} />
            {timeDisplay}
          </div>
          {project.due_date && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue ? "text-rose-500 font-black" : ""
              }`}
            >
              <CalendarDays size={11} />
              {new Date(project.due_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
        </div>

        {/* Due-Date Countdown Badge (Feature 5) */}
        {dueBadge && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${dueBadge.style}`}
            >
              <CalendarDays size={9} />
              {dueBadge.label}
            </span>
          </div>
        )}

        {/* Task progress */}
        {totalTasks > 0 && (
          <div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
              <span className={darkMode ? "text-slate-700" : "text-slate-400"}>
                {completedTasks}/{totalTasks} tasks
              </span>
              <span
                className={`px-1.5 py-0 rounded-full text-[8px] ${
                  progress === 100
                    ? "bg-emerald-500/15 text-emerald-500"
                    : darkMode
                      ? "bg-white/5 text-slate-400"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {progress}%
              </span>
            </div>
            <div
              className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? "bg-white/5" : "bg-slate-100"}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
