import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Briefcase,
  Wallet,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function CalendarPage({ darkMode }) {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    if (!api) return;
    setLoading(true);
    try {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);

      const startStr = startOfMonth.toISOString().split("T")[0];
      const endStr = endOfMonth.toISOString().split("T")[0];

      const res = await api.get(
        `/calendar/events?start_date=${startStr}&end_date=${endStr}`,
      );
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const selectedDateEvents = events.filter((e) => {
    const d = new Date(selectedDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return e.date === dateStr;
  });

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 min-h-screen font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <CalendarIcon size={28} />
            </span>
            Calendar
          </h1>
          <p
            className={`${darkMode ? "text-slate-500" : "text-slate-400"} text-sm font-medium font-outfit`}
          >
            Track your goals, interviews, and deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              darkMode
                ? "bg-white/5 hover:bg-white/10 text-slate-300"
                : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
            }`}
          >
            Today
          </button>
          <div
            className={`flex items-center rounded-xl overflow-hidden border ${darkMode ? "border-white/5" : "border-slate-200"}`}
          >
            <button
              onClick={prevMonth}
              className={`p-2 transition-colors ${darkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-50 text-slate-500"}`}
            >
              <ChevronLeft size={20} />
            </button>
            <div
              className={`px-4 py-2 text-sm font-bold border-x ${darkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-200"}`}
            >
              {MNAMES[month]} {year}
            </div>
            <button
              onClick={nextMonth}
              className={`p-2 transition-colors ${darkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-50 text-slate-500"}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className={`rounded-3xl border overflow-hidden transition-colors ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
            }`}
          >
            {/* Day Headers */}
            <div
              className={`grid grid-cols-7 border-b ${darkMode ? "border-white/5" : "border-slate-100"}`}
            >
              {DNAMES.map((d) => (
                <div
                  key={d}
                  className={`py-4 text-center text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Empty cells for leading days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className={`aspect-square sm:aspect-video border-b border-r last:border-r-0 ${darkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-50 bg-slate-50/30"}`}
                />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateEvents = getEventsForDate(day);
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`relative aspect-square sm:aspect-video border-b border-r last:border-r-0 cursor-pointer group transition-all p-1.5 sm:p-3
                      ${selected ? (darkMode ? "bg-indigo-500/10 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.3)]" : "bg-indigo-50/50 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.2)]") : ""}
                      ${darkMode ? "border-white/5 hover:bg-white/[0.03]" : "border-slate-50 hover:bg-slate-50/50"}
                    `}
                  >
                    <span
                      className={`text-sm sm:text-base font-bold tabular-nums transition-colors
                      ${selected ? "text-indigo-500" : today ? "text-indigo-500" : darkMode ? "text-slate-400" : "text-slate-600"}
                    `}
                    >
                      {day}
                    </span>

                    {today && (
                      <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                    )}

                    <div className="mt-1 flex flex-wrap gap-1">
                      {dateEvents.slice(0, 3).map((e, idx) => (
                        <div
                          key={e.id}
                          className={`w-1.5 h-1.5 sm:w-auto sm:px-1.5 sm:py-0.5 rounded-full sm:rounded-md text-[10px] font-bold truncate leading-none
                            ${
                              e.type === "goal"
                                ? "bg-emerald-500 text-white"
                                : e.type === "interview"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-rose-500 text-white"
                            }
                          `}
                        >
                          <span className="hidden sm:inline">{e.title}</span>
                        </div>
                      ))}
                      {dateEvents.length > 3 && (
                        <div
                          className={`hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold ${darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}
                        >
                          +{dateEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Trailing empty cells to complete the grid */}
              {Array.from({
                length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
              }).map((_, i) => (
                <div
                  key={`empty-end-${i}`}
                  className={`aspect-square sm:aspect-video border-b border-r last:border-r-0 ${darkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-50 bg-slate-50/30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side Detail Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div
            className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">
                {selectedDate.getDate()} {MNAMES[selectedDate.getMonth()]}
              </h2>
              <span
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? "bg-white/5 text-slate-500" : "bg-slate-50 text-slate-400"}`}
              >
                {DNAMES[selectedDate.getDay()]}
              </span>
            </div>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                  <div
                    className={`p-4 rounded-full mb-4 ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
                  >
                    <CalendarIcon
                      size={32}
                      className={darkMode ? "text-slate-700" : "text-slate-300"}
                    />
                  </div>
                  <p className="text-sm font-medium">No events scheduled</p>
                  <p className="text-xs mt-1">
                    Free day! Relax or focus on routines.
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`group relative p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${
                      darkMode
                        ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                        : "bg-white border-slate-100 hover:shadow-lg hover:shadow-slate-200/50"
                    }`}
                    onClick={() => {
                      if (event.type === "goal") navigate("/goals");
                      if (event.type === "interview") navigate("/interviews");
                      if (event.type === "bill") navigate("/finances");
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2.5 rounded-xl flex-shrink-0 ${
                          event.type === "goal"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : event.type === "interview"
                              ? "bg-indigo-500/10 text-indigo-500"
                              : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {event.type === "goal" ? (
                          <Trophy size={18} />
                        ) : event.type === "interview" ? (
                          <Briefcase size={18} />
                        ) : (
                          <Wallet size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              event.type === "goal"
                                ? "text-emerald-500"
                                : event.type === "interview"
                                  ? "text-indigo-500"
                                  : "text-rose-500"
                            }`}
                          >
                            {event.type}
                          </span>
                          <ExternalLink
                            size={12}
                            className="opacity-0 group-hover:opacity-40 transition-opacity"
                          />
                        </div>
                        <h4 className="text-sm font-bold truncate mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1 text-[11px] font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            <Clock size={12} />
                            {event.type === "bill"
                              ? "Due Today"
                              : event.type === "interview"
                                ? "Interview Time"
                                : "Deadline"}
                          </div>
                          {event.amount && (
                            <div className="text-[11px] font-bold text-rose-500">
                              ₹{event.amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate("/goals")}
              className={`w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                darkMode
                  ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>

          {/* Legend / Quick Stats */}
          <div
            className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"}`}
          >
            <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              Event Legend
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span
                  className={`text-[11px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Goals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span
                  className={`text-[11px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Interviews
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span
                  className={`text-[11px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Bills
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
