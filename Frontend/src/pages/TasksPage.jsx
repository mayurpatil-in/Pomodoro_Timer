import TaskList from "../components/TaskList";
import { CheckSquare } from "lucide-react";

export default function TasksPage({ darkMode }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
            darkMode
              ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
              : "bg-indigo-100 text-indigo-600"
          }`}
        >
          <CheckSquare size={22} />
        </div>
        <div>
          <h2
            className={`text-2xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            My Tasks
          </h2>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Track what you need to get done today
          </p>
        </div>
      </div>

      {/* Main Task Card */}
      <div
        className={`rounded-2xl border p-8 transition-all shadow-sm ${
          darkMode
            ? "bg-slate-900/40 border-white/5 shadow-black/20"
            : "bg-white border-slate-100 shadow-slate-200/50"
        }`}
      >
        <TaskList darkMode={darkMode} isPomo={true} />
      </div>
    </div>
  );
}
