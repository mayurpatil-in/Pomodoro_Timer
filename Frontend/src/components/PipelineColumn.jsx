import React from "react";
import { useDroppable } from "@dnd-kit/core";
import ApplicationCard from "./ApplicationCard";
import { Plus } from "lucide-react";

export default function PipelineColumn({
  column,
  applications,
  darkMode,
  onAddClick,
  onCardClick,
  onDeleteClick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-w-[300px] w-full max-w-[350px] rounded-2xl border transition-colors duration-200 ${
        darkMode
          ? `bg-[#13131a]/80 backdrop-blur-xl border-white/5 ${isOver ? "border-indigo-500/50 bg-[#1a1a24]/90" : ""}`
          : `bg-slate-50/80 border-slate-200 ${isOver ? "border-indigo-400 bg-indigo-50/50" : ""}`
      }`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-white/5" : "border-slate-200"}`}
      >
        <div className="flex items-center gap-2">
          {/* Status Indicator Dot */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-2.5 h-2.5 rounded-full`}
              style={{ backgroundColor: column.colorHex }}
            ></div>
            <div
              className={`absolute w-2.5 h-2.5 rounded-full animate-ping opacity-50`}
              style={{ backgroundColor: column.colorHex }}
            ></div>
          </div>
          <h2
            className={`font-bold text-sm tracking-wide ${darkMode ? "text-slate-200" : "text-slate-700"}`}
          >
            {column.title}
          </h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 ${
              darkMode
                ? "bg-white/10 text-slate-400"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {applications.length}
          </span>
        </div>

        <button
          onClick={() => onAddClick(column.id)}
          className={`p-1 rounded-md transition-colors ${
            darkMode
              ? "hover:bg-white/10 text-slate-400 hover:text-white"
              : "hover:bg-slate-200 text-slate-500"
          }`}
          title="Add application here"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Column Body - Drop Zone */}
      <div className="flex-1 p-3 overflow-y-auto min-h-[150px] space-y-3 scrollbar-hide">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            darkMode={darkMode}
            onClick={onCardClick}
            onDelete={onDeleteClick}
          />
        ))}
        {applications.length === 0 && (
          <div
            className={`text-center py-8 text-xs font-medium border-2 border-dashed rounded-xl ${
              darkMode
                ? "border-white/5 text-slate-600"
                : "border-slate-200 text-slate-400"
            }`}
          >
            No applications here
          </div>
        )}
      </div>
    </div>
  );
}
