import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Building,
  MapPin,
  Calendar,
  GripVertical,
  FileText,
  Phone,
  Mail,
  Link as LinkIcon,
  HelpCircle,
  Trash2,
} from "lucide-react";

const STAGE_COLORS = {
  Applied: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  "HR Round": "border-blue-500/30 text-blue-400 bg-blue-500/10",
  "Technical Round": "border-purple-500/30 text-purple-400 bg-purple-500/10",
  "Final Round": "border-amber-500/30 text-amber-400 bg-amber-500/10",
  Offer: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  Rejected: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

export default function ApplicationCard({
  application,
  darkMode,
  onClick,
  onDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: { application },
    });

  const style = {
    transform: CSS.Translate.toString(transform), // Translate allows movement
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  const stageColor = STAGE_COLORS[application.stage] || STAGE_COLORS["Applied"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
        darkMode
          ? "bg-[#18181b]/80 backdrop-blur-md border-white/10 hover:border-white/20 hover:bg-[#202023]"
          : "bg-white/80 backdrop-blur-md border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      } ${isDragging ? "shadow-2xl scale-105" : "hover:-translate-y-1"}`}
      onClick={() => onClick(application)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3
            className={`font-bold text-sm truncate ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {application.role}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Building size={12} />
            <span className="truncate">{application.company_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(application.id);
            }}
            className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
              darkMode
                ? "hover:bg-rose-500/20 text-rose-400"
                : "hover:bg-rose-50 text-rose-500"
            }`}
            title="Delete Application"
          >
            <Trash2 size={14} />
          </button>

          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
              darkMode
                ? "hover:bg-white/10 text-slate-500"
                : "hover:bg-slate-100 text-slate-400"
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent card click when dragging
          >
            <GripVertical size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {/* Expected CTC */}
        {application.expected_ctc && (
          <div className="flex items-center gap-2 text-xs font-medium">
            <div
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
            >
              <span>💰 CTC: {application.expected_ctc}</span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {application.interview_date && (
            <div
              className={`flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              <Calendar size={12} />
              <span className="truncate">
                {new Date(application.interview_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {application.location_type && (
            <div
              className={`flex items-center gap-1.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              <MapPin size={12} />
              <span className="truncate">{application.location_type}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5">
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${stageColor}`}
        >
          {application.stage}
        </span>

        {/* Quick Indicators Pipeline */}
        <div className="flex items-center gap-1.5">
          {application.notes && (
            <FileText
              size={12}
              className={darkMode ? "text-slate-500" : "text-slate-400"}
            />
          )}
          {application.referral === "Yes" && (
            <LinkIcon size={12} className="text-amber-500" />
          )}
          {application.questions && application.questions.length > 0 && (
            <HelpCircle size={12} className="text-indigo-400" />
          )}
        </div>
      </div>
    </div>
  );
}
