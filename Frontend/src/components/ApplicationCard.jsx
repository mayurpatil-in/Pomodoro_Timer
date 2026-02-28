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
  Clock,
  Flame,
  Linkedin,
} from "lucide-react";

const STAGE_COLORS = {
  Applied: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  "HR Round": "border-blue-500/30 text-blue-400 bg-blue-500/10",
  "Technical Round": "border-purple-500/30 text-purple-400 bg-purple-500/10",
  "Final Round": "border-amber-500/30 text-amber-400 bg-amber-500/10",
  Offer: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  Rejected: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

const PRIORITY_CONFIG = {
  High: { dot: "bg-rose-500", label: "High", text: "text-rose-500" },
  Medium: { dot: "bg-amber-400", label: "Med", text: "text-amber-400" },
  Low: { dot: "bg-emerald-500", label: "Low", text: "text-emerald-500" },
};

const SOURCE_ICONS = {
  LinkedIn: "🔷",
  "Company Website": "🌐",
  Wellfound: "🚀",
  Referral: "🤝",
  Recruiter: "📞",
  Other: "📋",
};

function getInterviewCountdown(interview_date) {
  if (!interview_date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(interview_date);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return {
      label: "Today!",
      style: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      pulse: true,
    };
  if (diffDays > 0 && diffDays <= 7)
    return {
      label: `In ${diffDays}d`,
      style: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      pulse: false,
    };
  if (diffDays < 0)
    return {
      label: "Overdue",
      style: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      pulse: false,
    };
  return null;
}

export default function ApplicationCard({
  application,
  darkMode,
  onClick,
  onDelete,
  onQuestionsClick,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: { application },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  const stageColor = STAGE_COLORS[application.stage] || STAGE_COLORS["Applied"];
  const countdown = getInterviewCountdown(application.interview_date);
  const priority = application.priority
    ? PRIORITY_CONFIG[application.priority]
    : null;
  const sourceIcon =
    SOURCE_ICONS[application.application_source] || SOURCE_ICONS["Other"];

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
      {/* Countdown badge — top-right ribbon */}
      {countdown && (
        <div
          className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${countdown.style}`}
        >
          {countdown.pulse && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
          )}
          <Clock size={9} />
          {countdown.label}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            {/* Priority dot */}
            {priority && (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${priority.dot}`}
                title={`Priority: ${priority.label}`}
              />
            )}
            <h3
              className={`font-bold text-sm truncate ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {application.role}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Building size={12} />
            <span className="truncate">{application.company_name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(application.id);
            }}
            className={`p-1 rounded transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
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
            className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
              darkMode
                ? "hover:bg-white/10 text-slate-500"
                : "hover:bg-slate-100 text-slate-400"
            }`}
            onClick={(e) => e.stopPropagation()}
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

        {/* Quick Indicators */}
        <div className="flex items-center gap-1.5">
          {/* Application source chip */}
          {application.application_source && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                darkMode
                  ? "bg-white/5 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
              title={application.application_source}
            >
              {sourceIcon}
            </span>
          )}
          {application.notes && (
            <FileText
              size={12}
              className={darkMode ? "text-slate-500" : "text-slate-400"}
            />
          )}
          {application.referral === "Yes" && (
            <LinkIcon size={12} className="text-amber-500" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuestionsClick) onQuestionsClick(application);
            }}
            className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] transition-all ${
              application.questions && application.questions.length > 0
                ? "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                : darkMode
                  ? "bg-white/5 text-slate-400 hover:bg-white/10"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <HelpCircle size={10} />
            {application.questions ? application.questions.length : 0} Qs
          </button>
        </div>
      </div>
    </div>
  );
}
