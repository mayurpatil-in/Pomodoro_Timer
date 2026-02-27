import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Activity,
  Droplet,
  Dumbbell,
  Flame,
  Scale,
  PieChart as PieChartIcon,
  Target,
} from "lucide-react";

export default function GymAnalytics({ darkMode }) {
  console.log("GymAnalytics version: fixed-height-v5-standard-casing");
  const { api } = useAuth();
  const [range, setRange] = useState("week");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (api) {
      api
        .get(`/gym/analytics/${range}`)
        .then((res) => setData(res.data))
        .catch(console.error);
    }
  }, [api, range]);

  if (data.length === 0) {
    return (
      <div
        className={`p-8 text-center rounded-3xl border ${darkMode ? "bg-slate-900 border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}
      >
        No analytics data available for this range yet. Start logging!
      </div>
    );
  }

  // Calculate macro averages
  const totalDays = data.filter((d) => d.calories_consumed > 0).length || 1;
  const avgMacros = [
    {
      name: "Protein",
      value:
        data.reduce((acc, curr) => acc + curr.protein_consumed, 0) / totalDays,
      color: "#f97316",
    },
    {
      name: "Carbs",
      value:
        data.reduce((acc, curr) => acc + curr.carbs_consumed, 0) / totalDays,
      color: "#3b82f6",
    },
    {
      name: "Fat",
      value: data.reduce((acc, curr) => acc + curr.fat_consumed, 0) / totalDays,
      color: "#eab308",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl shadow-lg border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}
        >
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm font-medium"
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2 self-start mb-2">
        <button
          onClick={() => setRange("week")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${range === "week" ? (darkMode ? "bg-white/10 text-white" : "bg-slate-900 text-white") : darkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          Past 7 Days
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${range === "month" ? (darkMode ? "bg-white/10 text-white" : "bg-slate-900 text-white") : darkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          Past 30 Days
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight & Calories Line Chart */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Body Weight History
            </h3>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={250} debounce={50}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                  }
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => str.split("-").slice(1).join("/")}
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={12}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="weight"
                  domain={["auto", "auto"]}
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reps Bar Chart */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Bodyweight Reps
            </h3>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={250} debounce={50}>
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                  }
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => str.split("-").slice(1).join("/")}
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={12}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  }}
                />
                <Bar
                  dataKey="pushups"
                  name="Pushups"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pullups"
                  name="Pullups"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="squads"
                  name="Squads"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macros Pie Chart */}
        <div
          className={`p-5 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Avg Daily Macros
            </h3>
          </div>
          <div className="flex items-center justify-center w-full">
            {avgMacros.reduce((a, b) => a + b.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250} debounce={50}>
                <PieChart>
                  <Pie
                    data={avgMacros}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {avgMacros.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p
                className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Not enough meal data to calculate macros.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
