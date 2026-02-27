import { useState } from "react";
import useTimer from "../hooks/useTimer";
import Controls from "../components/Controls";
import FlipClock from "../components/FlipClock";
import ProgressRing from "../components/ProgressRing";
import { Maximize, Minimize, Target, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive, not busy.",
  "Do the hard jobs first. The easy jobs will take care of themselves.",
  "Either you run the day or the day runs you.",
  "One step at a time, one task at a time.",
];

export default function TimerPage({ darkMode }) {
  const {
    timeLeft,
    mode,
    isActive,
    sessionCount,
    progress,
    toggleTimer,
    resetTimer,
    changeMode,
    selectedProjectId,
    setSelectedProjectId,
    selectedTaskId,
    setSelectedTaskId,
  } = useTimer();

  const { api, activeTask, setActiveTask } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data.filter((p) => !p.archived));
      } catch (error) {
        console.error("Error fetching projects for timer:", error);
      }
    };
    if (api) fetchProjects();
  }, [api]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const tasksForProject = selectedProject?.tasks || [];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const quoteIndex = sessionCount % QUOTES.length;

  const isPomo = mode === "pomodoro";
  const glowClass = isPomo ? "glow-blue" : "glow-purple";
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const focusMin = (sessionCount || 0) * 25;
  const focusDisplay =
    focusMin >= 60 ? `${(focusMin / 60).toFixed(1)}h` : `${focusMin}m`;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /* ── Fullscreen Mode ── */
  if (isFullscreen) {
    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 ${darkMode ? "bg-[#080d18]" : "bg-[#f0f4ff]"}`}
      >
        <div
          className={`absolute w-[500px] h-[500px] rounded-full blur-[200px] opacity-15 pointer-events-none ${isPomo ? "bg-blue-500" : "bg-purple-500"}`}
        />
        <p
          className={`text-xs font-outfit tracking-[0.3em] uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {isPomo
            ? "Focus Session"
            : mode === "shortBreak"
              ? "Short Break"
              : "Long Break"}
        </p>
        <div className="flex items-center gap-8">
          <FlipClock
            timeValue={minutes}
            mode={mode}
            darkMode={darkMode}
            isFullscreen
          />
          <span
            className={`text-[10rem] font-bold font-inter pb-4 leading-none ${glowClass}`}
          >
            :
          </span>
          <FlipClock
            timeValue={seconds}
            mode={mode}
            darkMode={darkMode}
            isFullscreen
          />
        </div>
        <Controls
          isActive={isActive}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          mode={mode}
          darkMode={darkMode}
        />
        <button
          onClick={toggleFullscreen}
          className="absolute top-5 right-5 p-3 rounded-xl bg-white/10 text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <Minimize size={22} />
        </button>
      </div>
    );
  }

  /* ── Normal Layout ── */
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-5rem)] -mt-8 pb-4 relative overflow-hidden">
      {/* Ambient Glow */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none transition-colors duration-700 ${isPomo ? "bg-indigo-500" : "bg-purple-500"}`}
      />

      {/* Mode Tabs */}
      <div
        className={`relative z-10 flex gap-1 p-1 rounded-2xl border mb-12 text-xs font-medium font-outfit ${
          darkMode
            ? "bg-slate-900/60 border-white/5 backdrop-blur-xl"
            : "bg-white/70 border-black/5 backdrop-blur-xl shadow-sm"
        }`}
      >
        {[
          { key: "pomodoro", label: "🍅 Focus", color: "bg-indigo-500" },
          {
            key: "shortBreak",
            label: "☕ Short Break",
            color: "bg-emerald-500",
          },
          { key: "longBreak", label: "🌿 Long Break", color: "bg-purple-500" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => changeMode(key)}
            className={`px-5 py-2 rounded-xl transition-all duration-300 ${
              mode === key
                ? `${color} text-white shadow-md`
                : darkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-black/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Project & Task Selector */}
      {isPomo && (
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-6">
          <select
            value={selectedProjectId || ""}
            onChange={(e) => {
              setSelectedProjectId(e.target.value || null);
              setSelectedTaskId(null);
            }}
            className={`flex-1 px-4 py-3 rounded-2xl text-sm font-medium outline-none border transition-all ${
              darkMode
                ? "bg-slate-900/60 border-white/5 text-slate-300 focus:border-indigo-500/50"
                : "bg-white border-black/5 text-slate-700 shadow-sm focus:border-indigo-500"
            }`}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            disabled={!selectedProjectId}
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value || null)}
            className={`flex-1 px-4 py-3 rounded-2xl text-sm font-medium outline-none border transition-all ${
              darkMode
                ? "bg-slate-900/60 border-white/5 text-slate-300 disabled:opacity-30"
                : "bg-white border-black/5 text-slate-700 shadow-sm disabled:opacity-50"
            }`}
          >
            <option value="">Specific Task (Optional)</option>
            {tasksForProject.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Project/Task Focusing Banner */}
      {isPomo && selectedProjectId && (
        <div
          className={`relative z-10 flex items-center gap-3 px-5 py-3 rounded-2xl border mb-6 max-w-sm w-full ${
            darkMode
              ? "bg-indigo-500/10 border-indigo-500/20"
              : "bg-indigo-50 border-indigo-200"
          }`}
        >
          <Target size={16} className="flex-shrink-0 text-indigo-500" />
          <div className="flex-1 min-w-0">
            <p
              className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-indigo-400/70" : "text-indigo-500/70"}`}
            >
              Project Mission
            </p>
            <p
              className={`text-sm font-semibold font-inter truncate ${darkMode ? "text-indigo-300" : "text-indigo-800"}`}
            >
              {selectedProject?.name}
              {selectedTaskId && (
                <span className="opacity-60 ml-1.5 font-normal">
                  —{" "}
                  {tasksForProject.find((t) => t.id === selectedTaskId)?.title}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedProjectId(null);
              setSelectedTaskId(null);
            }}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${darkMode ? "text-indigo-400/60 hover:text-indigo-200" : "text-indigo-400 hover:text-indigo-700"}`}
          >
            Clear
          </button>
        </div>
      )}

      {/* Standalone Task Banner */}
      {activeTask && !selectedProjectId && (
        <div
          className={`relative z-10 flex items-center gap-3 px-5 py-3 rounded-2xl border mb-6 max-w-sm w-full ${
            darkMode
              ? "bg-indigo-500/10 border-indigo-500/20"
              : "bg-indigo-50 border-indigo-200"
          }`}
        >
          <CheckCircle2 size={16} className="flex-shrink-0 text-indigo-500" />
          <div className="flex-1 min-w-0">
            <p
              className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${darkMode ? "text-indigo-400/70" : "text-indigo-500/70"}`}
            >
              Now Focusing
            </p>
            <p
              className={`text-sm font-semibold font-inter truncate ${darkMode ? "text-indigo-300" : "text-indigo-800"}`}
            >
              {activeTask.title}
            </p>
          </div>
          <button
            onClick={() => setActiveTask(null)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${darkMode ? "text-indigo-400/60 hover:text-indigo-200" : "text-indigo-400 hover:text-indigo-700"}`}
          >
            Clear
          </button>
        </div>
      )}

      {/* Timer + Ring */}
      <div className="relative z-10 flex items-center justify-center mb-10">
        {/* Progress ring behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-[1.3]">
          <ProgressRing progress={progress} isPomo={isPomo} />
        </div>

        {/* Glass card */}
        <div
          className={`glass relative px-14 py-12 flex flex-col items-center gap-4 group`}
        >
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className={`absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
              darkMode
                ? "text-slate-500 hover:text-white hover:bg-white/10"
                : "text-slate-400 hover:text-slate-800 hover:bg-black/8"
            }`}
          >
            <Maximize size={18} />
          </button>

          {/* Session label */}
          <span
            className={`text-[10px] font-outfit font-semibold tracking-[0.3em] uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {isPomo
              ? "Focus Session"
              : mode === "shortBreak"
                ? "Short Break"
                : "Long Break"}
          </span>

          {/* Clock digits */}
          <div className="flex items-center gap-4 sm:gap-6">
            <FlipClock timeValue={minutes} mode={mode} darkMode={darkMode} />
            <span
              className={`text-6xl sm:text-8xl font-bold font-inter pb-2 leading-none ${glowClass}`}
            >
              :
            </span>
            <FlipClock timeValue={seconds} mode={mode} darkMode={darkMode} />
          </div>

          {/* Stats row */}
          <div
            className={`flex items-center gap-6 mt-2 px-5 py-2.5 rounded-2xl border ${
              darkMode
                ? "bg-slate-800/50 border-white/5"
                : "bg-slate-50/80 border-black/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target
                size={14}
                className={isPomo ? "text-emerald-400" : "text-purple-400"}
              />
              <div className="flex flex-col">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Sessions
                </span>
                <span
                  className={`text-sm font-bold font-inter ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  #{sessionCount || 0}
                </span>
              </div>
            </div>
            <div
              className={`w-px h-7 ${darkMode ? "bg-white/10" : "bg-black/10"}`}
            />
            <div className="flex items-center gap-2">
              <Clock
                size={14}
                className={isPomo ? "text-indigo-400" : "text-purple-400"}
              />
              <div className="flex flex-col">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Focus Time
                </span>
                <span
                  className={`text-sm font-bold font-inter ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                >
                  {focusDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10">
        <Controls
          isActive={isActive}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          mode={mode}
          darkMode={darkMode}
        />
      </div>

      {/* Motivational Quote */}
      <p
        className={`relative z-10 mt-12 text-center text-sm italic max-w-sm font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
      >
        "{QUOTES[quoteIndex]}"
      </p>

      {/* Keyboard hints */}
      <div className="relative z-10 mt-4 flex gap-4">
        {[
          ["Space", "Start/Pause"],
          ["R", "Reset"],
        ].map(([key, action]) => (
          <div
            key={key}
            className={`flex items-center gap-1.5 text-[10px] font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            <kbd
              className={`px-1.5 py-0.5 rounded border text-[9px] font-mono ${darkMode ? "bg-slate-800 border-white/10" : "bg-white border-black/10"}`}
            >
              {key}
            </kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
