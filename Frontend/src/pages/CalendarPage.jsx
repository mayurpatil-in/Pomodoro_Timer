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
      className={`flex flex-col gap-6 min-h-screen font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6 lg:mb-12">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3 sm:gap-4">
            <span
              className={`p-3 rounded-2xl shadow-sm ${
                darkMode
                  ? "bg-indigo-500/10 text-indigo-400 shadow-indigo-500/10"
                  : "bg-indigo-50 text-indigo-600 shadow-indigo-500/20"
              }`}
            >
              <CalendarIcon size={32} strokeWidth={2.5} />
            </span>
            <span
              className={`bg-clip-text text-transparent ${darkMode ? "bg-gradient-to-r from-white to-slate-400" : "bg-gradient-to-r from-slate-900 to-slate-500"}`}
            >
              Calendar
            </span>
          </h1>
          <p
            className={`${darkMode ? "text-slate-400" : "text-slate-500"} text-sm sm:text-base font-medium font-outfit`}
          >
            Track your goals, interviews, and deadlines beautifully.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
              darkMode
                ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                : "bg-white border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 text-slate-700 hover:shadow-md"
            }`}
          >
            Today
          </button>
          <div
            className={`flex items-center rounded-xl p-1 shadow-sm transition-all ${
              darkMode
                ? "bg-slate-800/50 border border-white/5"
                : "bg-white border border-slate-200"
            }`}
          >
            <button
              onClick={prevMonth}
              className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                darkMode
                  ? "hover:bg-white/10 text-slate-400 hover:text-white"
                  : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
              }`}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div
              className={`min-w-[140px] text-center px-4 py-1.5 text-sm font-bold ${
                darkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {MNAMES[month]} {year}
            </div>
            <button
              onClick={nextMonth}
              className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                darkMode
                  ? "hover:bg-white/10 text-slate-400 hover:text-white"
                  : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
              }`}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col">
          <div
            className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
              darkMode
                ? "bg-[#0B1120] border-white/5 shadow-xl shadow-black/50"
                : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
            }`}
          >
            {/* Day Headers */}
            <div
              className={`grid grid-cols-7 border-b ${
                darkMode
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              {DNAMES.map((d) => (
                <div
                  key={d}
                  className={`py-4 sm:py-5 text-center text-xs font-bold uppercase tracking-[0.2em] ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 bg-transparent">
              {/* Empty cells for leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className={`aspect-square sm:aspect-auto sm:min-h-[120px] border-b border-r last:border-r-0 ${
                    darkMode
                      ? "border-white/5 bg-slate-900/20"
                      : "border-slate-50 bg-slate-50/30"
                  }`}
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
                    className={`relative min-h-[85px] sm:aspect-auto sm:min-h-[120px] border-b border-r last:border-r-0 cursor-pointer group transition-all duration-200 p-1 sm:p-3
                      ${
                        selected
                          ? darkMode
                            ? "bg-indigo-500/10 shadow-[inset_0px_0px_0px_2px_rgba(99,102,241,0.5)] z-10"
                            : "bg-indigo-50/80 shadow-[inset_0px_0px_0px_2px_rgba(99,102,241,0.6)] z-10"
                          : ""
                      }
                      ${
                        !selected && darkMode
                          ? "border-white/5 hover:bg-white/[0.04] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                          : ""
                      }
                      ${
                        !selected && !darkMode
                          ? "border-slate-50 hover:bg-slate-50 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base font-bold tabular-nums transition-all
                          ${
                            selected
                              ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-110"
                              : today
                                ? darkMode
                                  ? "bg-white/10 text-white"
                                  : "bg-slate-900 text-white"
                                : darkMode
                                  ? "text-slate-400 group-hover:text-slate-200"
                                  : "text-slate-600 group-hover:text-slate-900"
                          }
                        `}
                      >
                        {day}
                      </span>
                    </div>

                    {today && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50 z-20" />
                    )}

                    <div className="mt-2 flex flex-col gap-1.5 sm:gap-1 h-[calc(100%-2.5rem)] overflow-y-auto no-scrollbar pb-1">
                      {dateEvents.slice(0, 3).map((e, idx) => (
                        <div
                          key={e.id}
                          className={`
                            px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold truncate leading-none flex items-center gap-1.5
                            ${
                              e.type === "goal"
                                ? darkMode
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : e.type === "interview"
                                  ? darkMode
                                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                  : darkMode
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                            }
                          `}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              e.type === "goal"
                                ? "bg-emerald-400"
                                : e.type === "interview"
                                  ? "bg-indigo-400"
                                  : "bg-rose-400"
                            }`}
                          />
                          <span className="hidden sm:inline truncate">
                            {e.title}
                          </span>
                        </div>
                      ))}
                      {dateEvents.length > 3 && (
                        <div
                          className={`mt-0.5 px-2 py-1 rounded-lg text-[10px] font-bold text-center border ${
                            darkMode
                              ? "bg-white/5 border-white/5 text-slate-400"
                              : "bg-slate-50 border-slate-100 text-slate-500"
                          }`}
                        >
                          +{dateEvents.length - 3} more
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
                  className={`aspect-square sm:aspect-auto sm:min-h-[120px] border-b border-r last:border-r-0 ${
                    darkMode
                      ? "border-white/5 bg-slate-900/20"
                      : "border-slate-50 bg-slate-50/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side Detail Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
          <div
            className={`p-4 sm:p-8 rounded-3xl border transition-all duration-300 ${
              darkMode
                ? "bg-[#0B1120] border-white/5 shadow-xl shadow-black/50"
                : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50"
            }`}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {selectedDate.getDate()} {MNAMES[selectedDate.getMonth()]}
                </h2>
                <p
                  className={`text-xs sm:text-sm mt-1 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {year}
                </p>
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-600 shadow-sm"
                }`}
              >
                {DNAMES[selectedDate.getDay()]}
              </span>
            </div>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-slate-300 bg-slate-50/50"}`}
                >
                  <div
                    className={`p-5 rounded-full mb-5 ${
                      darkMode
                        ? "bg-white/5 text-slate-500"
                        : "bg-white shadow-sm text-slate-400"
                    }`}
                  >
                    <CalendarIcon size={36} strokeWidth={1.5} />
                  </div>
                  <p className="text-base font-bold mb-1">
                    No events scheduled
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}
                  >
                    A completely free day!
                    <br />
                    Relax or focus on your routines.
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      darkMode
                        ? "bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/50"
                        : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
                    }`}
                    onClick={() => {
                      if (event.type === "goal") navigate("/goals");
                      if (event.type === "interview") navigate("/interviews");
                      if (event.type === "bill") navigate("/finances");
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl flex-shrink-0 shadow-sm ${
                          event.type === "goal"
                            ? darkMode
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : event.type === "interview"
                              ? darkMode
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                              : darkMode
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}
                      >
                        {event.type === "goal" ? (
                          <Trophy size={20} strokeWidth={2.5} />
                        ) : event.type === "interview" ? (
                          <Briefcase size={20} strokeWidth={2.5} />
                        ) : (
                          <Wallet size={20} strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${
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
                            size={14}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                          />
                        </div>
                        <h4 className="text-base font-bold truncate mb-2">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            <Clock size={14} />
                            {event.type === "bill"
                              ? "Due Today"
                              : event.type === "interview"
                                ? "Interview Time"
                                : "Deadline"}
                          </div>
                          {event.amount && (
                            <div className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
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
              className={`w-full mt-8 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                darkMode
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30"
              }`}
            >
              <Plus size={18} strokeWidth={2.5} />
              Add New Event
            </button>
          </div>

          {/* Legend / Quick Stats */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
              darkMode
                ? "bg-[#0B1120] border-white/5 shadow-xl shadow-black/50"
                : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
            }`}
          >
            <h3 className="text-base font-extrabold tracking-tight mb-5 flex items-center gap-3">
              <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
              Event Legend
            </h3>
            <div className="flex flex-col gap-4">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span
                  className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  Goals
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}
              >
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                <span
                  className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  Interviews
                </span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}
              >
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <span
                  className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}
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
