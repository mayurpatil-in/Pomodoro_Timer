import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  ClipboardList,
} from "lucide-react";

export default function GymReport({ darkMode }) {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    if (api) {
      setLoading(true);
      api
        .get(`/gym/history?month=${selectedMonth}&year=${selectedYear}`)
        .then((res) => {
          // Sort data by date descending (newest first)
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          );
          setData(sorted);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [api, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-wrap items-center gap-4 ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
      >
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-orange-500" />
          <h2
            className={`text-lg font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            History Log
          </h2>
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className={`px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={`px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"}`}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          className={`p-12 text-center rounded-3xl border animate-pulse ${darkMode ? "bg-slate-900 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}
        >
          <p className="font-medium text-sm">Loading historical records...</p>
        </div>
      ) : data.length === 0 ? (
        <div
          className={`p-12 text-center rounded-3xl border ${darkMode ? "bg-slate-900 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}
        >
          <ClipboardList size={40} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium text-sm">
            No records found for{" "}
            {months.find((m) => m.value === selectedMonth)?.label}{" "}
            {selectedYear}.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-3xl border shadow-sm overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b ${darkMode ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50/50"}`}
                >
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Weight
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Calories
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Protein
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Pushups
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Pullups
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Squats
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Sessions
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Water
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-white/5" : "divide-slate-100"}`}
              >
                {data.map((item) => (
                  <tr
                    key={item.date}
                    className={`group transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                        >
                          <Calendar size={14} />
                        </div>
                        <span
                          className={`text-sm font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                        >
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium font-outfit text-right">
                      <span
                        className={
                          darkMode ? "text-indigo-400" : "text-indigo-600"
                        }
                      >
                        {item.weight || "-"}{" "}
                        <span className="text-[10px] opacity-60">kg</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium font-outfit text-right">
                      <span
                        className={
                          darkMode ? "text-emerald-400" : "text-emerald-600"
                        }
                      >
                        {item.calories_consumed || "0"}{" "}
                        <span className="text-[10px] opacity-60">kcal</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium font-outfit text-right">
                      <span
                        className={
                          darkMode ? "text-orange-400" : "text-orange-600"
                        }
                      >
                        {item.protein_consumed || "0"}
                        <span className="text-[10px] opacity-60">g</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-inter text-center">
                      <span
                        className={darkMode ? "text-rose-400" : "text-rose-600"}
                      >
                        {item.pushups || "0"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-inter text-center">
                      <span
                        className={
                          darkMode ? "text-amber-400" : "text-amber-600"
                        }
                      >
                        {item.pullups || "0"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-inter text-center">
                      <span
                        className={
                          darkMode ? "text-emerald-400" : "text-emerald-600"
                        }
                      >
                        {item.squads || "0"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-inter text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${item.workout_count > 0 ? (darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600") : darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}
                      >
                        {item.workout_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-inter text-center text-sky-500">
                      {item.water_glasses}{" "}
                      <span className="text-[10px] opacity-60 font-medium whitespace-nowrap text-slate-500">
                        Gls
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
