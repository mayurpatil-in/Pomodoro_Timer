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

  // Calculate muscle group distribution
  const muscleDistribution = data.reduce((acc, curr) => {
    curr.muscles?.forEach((m) => {
      acc[m] = (acc[m] || 0) + 1;
    });
    return acc;
  }, {});

  const maxMuscleCount = Math.max(...Object.values(muscleDistribution), 1);
  const getMuscleColor = (muscle) => {
    const count = muscleDistribution[muscle] || 0;
    const intensity = Math.min(count / maxMuscleCount, 1);
    return `rgba(249, 115, 22, ${0.1 + intensity * 0.9})`; // orange-500 with varying alpha
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2 self-start mb-2">
        <button
          onClick={() => setRange("week")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${range === "week" ? (darkMode ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-slate-900 text-white shadow-lg shadow-slate-900/20") : darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          Past 7 Days
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${range === "month" ? (darkMode ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-slate-900 text-white shadow-lg shadow-slate-900/20") : darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
        >
          Past 30 Days
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Muscle Heatmap - Large View */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl border shadow-sm flex flex-col items-center ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-8 w-full">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Dumbbell size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Muscle Heatmap
            </h3>
          </div>

          <div className="relative w-full flex justify-center py-4">
            {/* Simple Human Figure SVG for Heatmap */}
            <svg
              width="200"
              height="300"
              viewBox="0 0 100 150"
              className="drop-shadow-xl"
            >
              {/* Head */}
              <circle
                cx="50"
                cy="15"
                r="10"
                fill={getMuscleColor("Core")}
                stroke={darkMode ? "white" : "black"}
                strokeWidth="0.5"
                opacity="0.8"
              />
              <path
                d="M40 25 L60 25 L65 45 L35 45 Z"
                fill={getMuscleColor("Chest")}
                opacity="0.9"
              />{" "}
              {/* Chest */}
              <path
                d="M40 45 L60 45 L58 70 L42 70 Z"
                fill={getMuscleColor("Core")}
                opacity="0.9"
              />{" "}
              {/* Abs */}
              <path
                d="M35 25 L15 65"
                stroke={getMuscleColor("Arms")}
                strokeWidth="8"
                strokeLinecap="round"
              />{" "}
              {/* Left Arm */}
              <path
                d="M65 25 L85 65"
                stroke={getMuscleColor("Arms")}
                strokeWidth="8"
                strokeLinecap="round"
              />{" "}
              {/* Right Arm */}
              <path
                d="M35 25 L25 35"
                stroke={getMuscleColor("Shoulders")}
                strokeWidth="6"
                strokeLinecap="round"
              />{" "}
              {/* L Shoulder */}
              <path
                d="M65 25 L75 35"
                stroke={getMuscleColor("Shoulders")}
                strokeWidth="6"
                strokeLinecap="round"
              />{" "}
              {/* R Shoulder */}
              <path
                d="M42 70 L35 130"
                stroke={getMuscleColor("Legs")}
                strokeWidth="10"
                strokeLinecap="round"
              />{" "}
              {/* Left Leg */}
              <path
                d="M58 70 L65 130"
                stroke={getMuscleColor("Legs")}
                strokeWidth="10"
                strokeLinecap="round"
              />{" "}
              {/* Right Leg */}
            </svg>

            {/* Legend Tooltip-like indicators */}
            <div className="absolute top-10 right-0 space-y-1">
              {Object.entries(muscleDistribution)
                .slice(0, 4)
                .map(([name, count]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getMuscleColor(name) }}
                    />
                    <span
                      className={`text-[10px] font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {name}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Weight History - Graph */}
        <div
          className={`lg:col-span-8 p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Performance & Weight
            </h3>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={darkMode ? "#f97316" : "#ea580c"}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calories_consumed"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  opacity={0.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macros Pie Chart */}
        <div
          className={`lg:col-span-5 p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Macronutrient Split
            </h3>
          </div>
          <div className="h-[250px] flex items-center justify-center">
            {avgMacros.reduce((a, b) => a + b.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={avgMacros}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
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
                    wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
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

        {/* Bodyweight Progress Bar Chart */}
        <div
          className={`lg:col-span-7 p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3
              className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Volume Progression
            </h3>
          </div>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={darkMode ? "#64748b" : "#94a3b8"}
                  fontSize={10}
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
      </div>
    </div>
  );
}
