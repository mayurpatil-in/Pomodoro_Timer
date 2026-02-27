import React from "react";
import { Briefcase, CalendarCheck, Award, XCircle } from "lucide-react";

export default function KPISection({ kpis, darkMode }) {
  const kpiData = [
    {
      title: "Total Applications",
      value: kpis.total || 0,
      icon: Briefcase,
      from: "from-blue-500",
      to: "to-indigo-600",
      glow: "shadow-blue-500/20",
      bg: "bg-blue-500/10 text-blue-500",
      borderLine: "border-blue-500/30",
    },
    {
      title: "Interviews Scheduled",
      value: kpis.scheduled || 0,
      icon: CalendarCheck,
      from: "from-amber-400",
      to: "to-orange-500",
      glow: "shadow-amber-500/20",
      bg: "bg-amber-500/10 text-amber-500",
      borderLine: "border-amber-500/30",
    },
    {
      title: "Offers Received",
      value: kpis.offers || 0,
      icon: Award,
      from: "from-emerald-400",
      to: "to-teal-500",
      glow: "shadow-emerald-500/20",
      bg: "bg-emerald-500/10 text-emerald-500",
      borderLine: "border-emerald-500/30",
    },
    {
      title: "Rejected / Passed",
      value: kpis.rejected || 0,
      icon: XCircle,
      from: "from-rose-500",
      to: "to-pink-600",
      glow: "shadow-rose-500/20",
      bg: "bg-rose-500/10 text-rose-500",
      borderLine: "border-rose-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
            darkMode
              ? `bg-white/[0.02] border-white/5 hover:${kpi.borderLine} hover:shadow-lg hover:${kpi.glow}`
              : `bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:${kpi.glow}`
          }`}
        >
          {/* Subtle background glow effect on hover via CSS gradient mapping */}
          <div
            className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.from} ${kpi.to} opacity-10 blur-2xl pointer-events-none`}
          ></div>

          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.from} ${kpi.to} shadow-md`}
            >
              <kpi.icon size={18} className="text-white" />
            </div>
            {/* Small growth indicator - placeholder for now since there's no historical data, normally we'd compare this month vs last month */}
            <div
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Tracking
            </div>
          </div>

          <div
            className={`text-4xl font-black mb-1 leading-tight tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {kpi.value}
          </div>
          <div
            className={`text-xs font-bold ${darkMode ? "text-slate-500" : "text-slate-400"} uppercase tracking-wider`}
          >
            {kpi.title}
          </div>
        </div>
      ))}
    </div>
  );
}
