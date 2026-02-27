import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  Droplet,
  Dumbbell,
  Flame,
  Plus,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Utensils,
  Target,
  X,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import GymAnalytics from "../components/GymAnalytics";
import GymReport from "../components/GymReport";

export default function GymTrackerPage({ darkMode }) {
  const { api, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data state
  const [dayData, setDayData] = useState({
    weight: "",
    water_glasses: 0,
    pushups: 0,
    pullups: 0,
    squads: 0,
    notes: "",
  });
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);

  // Modal states
  const [isAddExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [isAddMealModalOpen, setAddMealModalOpen] = useState(false);

  const [newExercise, setNewExercise] = useState({
    name: "",
    muscle_group: "Chest",
    sets: "",
    reps: "",
    weight: "",
  });
  const [newMeal, setNewMeal] = useState({
    name: "",
    meal_type: "Breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const [goals, setGoals] = useState({
    target_water: 8,
    target_protein: 150,
    target_calories: 2500,
    target_pushups: 0,
    target_pullups: 0,
    target_squads: 0,
    target_workouts_per_week: 3,
  });
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  const formattedDate = currentDate.toISOString().split("T")[0];
  const displayDate = currentDate.toLocaleString("default", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const fetchData = () => {
    if (user && api) {
      api
        .get(`/gym/${formattedDate}`)
        .then((res) => {
          setDayData({
            id: res.data.id,
            weight: res.data.weight || "",
            water_glasses: res.data.water_glasses || 0,
            pushups: res.data.pushups || 0,
            pullups: res.data.pullups || 0,
            squads: res.data.squads || 0,
            notes: res.data.notes || "",
          });
          setExercises(res.data.exercises || []);
          setMeals(res.data.meals || []);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate, user, api]);

  useEffect(() => {
    if (user && api) {
      api
        .get("/gym/goal")
        .then((res) => setGoals(res.data))
        .catch(console.error);
    }
  }, [user, api]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    setCurrentDate(next);
  };

  const saveDayData = (updatedData) => {
    api
      .post("/gym/day", { date: formattedDate, ...updatedData })
      .then((res) => fetchData())
      .catch(console.error);
  };

  const handleWaterUpdate = (val) => {
    const newWater = Math.max(0, dayData.water_glasses + val);
    setDayData((prev) => ({ ...prev, water_glasses: newWater }));
    saveDayData({ water_glasses: newWater });
  };

  const handlePushupUpdate = (val) => {
    const newPushups = Math.max(0, dayData.pushups + val);
    setDayData((prev) => ({ ...prev, pushups: newPushups }));
    saveDayData({ pushups: newPushups });
  };

  const handlePullupUpdate = (val) => {
    const newPullups = Math.max(0, dayData.pullups + val);
    setDayData((prev) => ({ ...prev, pullups: newPullups }));
    saveDayData({ pullups: newPullups });
  };

  const handleSquadUpdate = (val) => {
    const newSquads = Math.max(0, dayData.squads + val);
    setDayData((prev) => ({ ...prev, squads: newSquads }));
    saveDayData({ squads: newSquads });
  };

  const handleWeightBlur = () => {
    if (dayData.weight !== "") {
      saveDayData({ weight: parseFloat(dayData.weight) });
    }
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    api
      .post("/gym/goal", goals)
      .then(() => setGoalModalOpen(false))
      .catch(console.error);
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExercise.name) return;
    api
      .post("/gym/exercise", {
        date: formattedDate,
        name: newExercise.name,
        muscle_group: newExercise.muscle_group,
        sets: parseInt(newExercise.sets) || 1,
        reps: parseInt(newExercise.reps) || 1,
        weight: parseFloat(newExercise.weight) || 0,
      })
      .then((res) => {
        setExercises((prev) => [...prev, res.data.exercise]);
        setAddExerciseModalOpen(false);
        setNewExercise({
          name: "",
          muscle_group: "Chest",
          sets: "",
          reps: "",
          weight: "",
        });
      })
      .catch(console.error);
  };

  const handleDeleteExercise = (id) => {
    api
      .delete(`/gym/exercise/${id}`)
      .then(() => setExercises((prev) => prev.filter((ex) => ex.id !== id)))
      .catch(console.error);
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.name) return;
    api
      .post("/gym/meal", {
        date: formattedDate,
        name: newMeal.name,
        meal_type: newMeal.meal_type,
        calories: parseInt(newMeal.calories) || 0,
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fat: parseFloat(newMeal.fat) || 0,
      })
      .then((res) => {
        setMeals((prev) => [...prev, res.data.meal]);
        setAddMealModalOpen(false);
        setNewMeal({
          name: "",
          meal_type: "Breakfast",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        });
      })
      .catch(console.error);
  };

  const handleDeleteMeal = (id) => {
    api
      .delete(`/gym/meal/${id}`)
      .then(() => setMeals((prev) => prev.filter((m) => m.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="flex flex-col gap-6 w-full min-h-full pb-8 relative">
      {/* Header */}
      <div
        className={`p-5 md:px-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm relative overflow-hidden ${darkMode ? "bg-gradient-to-r from-slate-900 via-[#13131e] to-slate-900 border-white/5" : "bg-gradient-to-r from-white via-slate-50 to-white border-slate-200"}`}
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full point-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full point-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white flex-shrink-0">
            <Activity size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className={`text-2xl md:text-3xl font-extrabold font-inter tracking-tight leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Gym & Fitness
            </h1>
            <p
              className={`text-sm font-outfit mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Track your workouts, meals, and body metrics.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          {activeTab === "daily" && (
            <div
              className={`flex items-center p-1 rounded-xl border ${darkMode ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200"}`}
            >
              <button
                onClick={handlePrevDay}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2 px-3 w-40 justify-center">
                <Calendar
                  size={14}
                  className={darkMode ? "text-orange-400" : "text-orange-600"}
                />
                <span
                  className={`text-xs font-bold font-inter tracking-wide ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                >
                  {displayDate}
                </span>
              </div>
              <button
                onClick={handleNextDay}
                className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setGoalModalOpen(true)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center gap-2 ${darkMode ? "bg-slate-900/60 border-white/10 hover:bg-slate-800 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"}`}
          >
            <Target size={18} />
            <span className="text-sm font-bold font-inter tracking-wide hidden sm:block">
              Goals
            </span>
          </button>

          <div
            className={`p-1 flex items-center rounded-xl border ${darkMode ? "bg-slate-900/60 border-white/10" : "bg-slate-100 border-slate-200"}`}
          >
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "daily" ? (darkMode ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-800 shadow-sm") : darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              Daily Log
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === "analytics" ? (darkMode ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-800 shadow-sm") : darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === "report" ? (darkMode ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-800 shadow-sm") : darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <ClipboardList size={16} />
              Report
            </button>
          </div>
        </div>
      </div>

      {activeTab === "analytics" && <GymAnalytics darkMode={darkMode} />}
      {activeTab === "report" && <GymReport darkMode={darkMode} />}

      {activeTab === "daily" && (
        <>
          {/* Main Container - 3 Rows Content */}
          <div className="w-full flex flex-col gap-6">
            {/* ROW 1: Rapid Trackers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pushups Card */}
              <div
                className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  <h3
                    className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Pushups
                  </h3>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <button
                    onClick={() => handlePushupUpdate(-5)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-slate-50 border-slate-200 hover:bg-slate-200 text-slate-900"}`}
                  >
                    -5
                  </button>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {dayData.pushups}
                    </span>
                    <span
                      className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {goals.target_pushups > 0
                        ? `/ ${goals.target_pushups} Reps`
                        : "Reps"}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePushupUpdate(5)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Pullups Card */}
              <div
                className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <h3
                    className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Pullups
                  </h3>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <button
                    onClick={() => handlePullupUpdate(-1)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-slate-50 border-slate-200 hover:bg-slate-200 text-slate-900"}`}
                  >
                    -1
                  </button>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {dayData.pullups}
                    </span>
                    <span
                      className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {goals.target_pullups > 0
                        ? `/ ${goals.target_pullups} Reps`
                        : "Reps"}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePullupUpdate(1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Squads Card */}
              <div
                className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Dumbbell size={20} />
                  </div>
                  <h3
                    className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Squads
                  </h3>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <button
                    onClick={() => handleSquadUpdate(-5)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-slate-50 border-slate-200 hover:bg-slate-200 text-slate-900"}`}
                  >
                    -5
                  </button>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {dayData.squads}
                    </span>
                    <span
                      className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {goals.target_squads > 0
                        ? `/ ${goals.target_squads} Reps`
                        : "Reps"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSquadUpdate(5)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: Body Weight and Water */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Water Card */}
              <div
                className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-500">
                  <Droplet size={100} />
                </div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Droplet size={20} />
                  </div>
                  <h3
                    className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Water Intake
                  </h3>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <button
                    onClick={() => handleWaterUpdate(-1)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-slate-50 border-slate-200 hover:bg-slate-200 text-slate-900"}`}
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {dayData.water_glasses}
                    </span>
                    <span
                      className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {goals.target_water > 0
                        ? `/ ${goals.target_water} Glasses`
                        : "Glasses"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleWaterUpdate(1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Weight Card */}
              <div
                className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Scale size={20} />
                  </div>
                  <h3
                    className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Body Weight
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={dayData.weight}
                    onChange={(e) =>
                      setDayData({ ...dayData, weight: e.target.value })
                    }
                    onBlur={handleWeightBlur}
                    placeholder="0.0"
                    className={`w-full text-3xl font-extrabold bg-transparent focus:outline-none placeholder-slate-500/30 ${darkMode ? "text-white" : "text-slate-900"}`}
                  />
                  <span
                    className={`text-lg font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 3: Workout & Meals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Workouts */}
              <div
                className={`p-5 md:p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <h3
                        className={`font-bold font-inter text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        Exercises
                      </h3>
                      <p
                        className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {exercises.length} activities today
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAddExerciseModalOpen(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.length === 0 ? (
                    <div
                      className={`py-10 text-center text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      No exercises logged today.
                    </div>
                  ) : (
                    exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className={`p-4 rounded-2xl flex items-center justify-between group ${darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold font-inter text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {ex.name}
                            </p>
                            {ex.muscle_group && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${darkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"}`}
                              >
                                {ex.muscle_group}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs font-outfit mt-1 space-x-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                          >
                            <span
                              className={
                                darkMode
                                  ? "text-orange-400 font-medium"
                                  : "text-orange-600 font-medium"
                              }
                            >
                              {ex.sets} sets
                            </span>
                            <span>×</span>
                            <span>{ex.reps} reps</span>
                            <span>•</span>
                            <span>{ex.weight} kg</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${darkMode ? "text-slate-500 hover:text-rose-400 hover:bg-rose-400/10" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Meals */}
              <div
                className={`p-5 md:p-6 rounded-3xl border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h3
                        className={`font-bold font-inter text-lg ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        Meals & Macros
                      </h3>
                      <p
                        className={`text-xs font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {meals.length} meals logged
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAddMealModalOpen(true)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {meals.length === 0 ? (
                    <div
                      className={`py-10 text-center text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      No meals logged today.
                    </div>
                  ) : (
                    meals.map((meal) => (
                      <div
                        key={meal.id}
                        className={`p-4 rounded-2xl flex items-center justify-between group ${darkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold font-inter text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                            >
                              {meal.name}
                            </p>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}
                            >
                              {meal.meal_type}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-outfit mt-1 flex gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                          >
                            <span className="flex items-center gap-1">
                              <Flame
                                size={12}
                                className={
                                  darkMode
                                    ? "text-orange-400"
                                    : "text-orange-500"
                                }
                              />{" "}
                              {meal.calories} kcal
                            </span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>F: {meal.fat}g</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all ${darkMode ? "text-slate-500 hover:text-rose-400 hover:bg-rose-400/10" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"} border`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Add Exercise
              </h2>
              <button
                onClick={() => setAddExerciseModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Exercise Name
                </label>
                <input
                  required
                  type="text"
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  placeholder="e.g. Bench Press"
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Muscle Group
                </label>
                <select
                  value={newExercise.muscle_group}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      muscle_group: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Arms">Arms</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Core">Core</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Sets
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newExercise.sets}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, sets: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Reps
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newExercise.reps}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, reps: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newExercise.weight}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, weight: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="60"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
              >
                Save Exercise
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Meal Modal */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"} border`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Add Meal
              </h2>
              <button
                onClick={() => setAddMealModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Meal Name
                </label>
                <input
                  required
                  type="text"
                  value={newMeal.name}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  placeholder="e.g. Chicken & Rice"
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Meal Type
                </label>
                <select
                  value={newMeal.meal_type}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, meal_type: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Calories
                  </label>
                  <input
                    required
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, calories: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="500"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, protein: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="40"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, carbs: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, fat: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    placeholder="15"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
              >
                Save Meal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Goal Settings Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"} border`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-bold font-inter flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                <Target size={22} className="text-indigo-500" />
                Daily Goals
              </h2>
              <button
                onClick={() => setGoalModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Target Water Gls
                  </label>
                  <input
                    type="number"
                    value={goals.target_water}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_water: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Target Calories
                  </label>
                  <input
                    type="number"
                    value={goals.target_calories}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_calories: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Target Protein
                  </label>
                  <input
                    type="number"
                    value={goals.target_protein}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_protein: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Workouts/Week
                  </label>
                  <input
                    type="number"
                    value={goals.target_workouts_per_week}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_workouts_per_week: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Pushups
                  </label>
                  <input
                    type="number"
                    value={goals.target_pushups}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_pushups: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Pullups
                  </label>
                  <input
                    type="number"
                    value={goals.target_pullups}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_pullups: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Squads
                  </label>
                  <input
                    type="number"
                    value={goals.target_squads}
                    onChange={(e) =>
                      setGoals({
                        ...goals,
                        target_squads: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
              >
                Save Goals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
