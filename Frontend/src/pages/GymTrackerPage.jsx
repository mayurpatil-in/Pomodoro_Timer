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
  Clock,
  History,
  Camera,
  CheckCircle2,
  Info,
  ChevronDown,
} from "lucide-react";
import GymAnalytics from "../components/GymAnalytics";
import GymReport from "../components/GymReport";
import CustomConfirmModal from "../components/CustomConfirmModal";

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

  // Advanced states
  const [templates, setTemplates] = useState([]);
  const [prs, setPrs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [isPRModalOpen, setPRModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isSaveTemplateNameModalOpen, setSaveTemplateNameModalOpen] =
    useState(false);

  // Rest Timer State
  const [restTime, setRestTime] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [newMeasurement, setNewMeasurement] = useState({
    weight: "",
    height: "",
    body_fat: "",
    neck: "",
    chest: "",
    waist: "",
    hips: "",
  });
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    exercises: [],
  });

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "delete",
  });

  const formattedDate = (() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();
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
      refreshAdvancedData();
    }
  }, [user, api]);

  const refreshAdvancedData = () => {
    api
      .get("/gym/templates")
      .then((res) => setTemplates(res.data))
      .catch(console.error);
    api
      .get("/gym/prs")
      .then((res) => setPrs(res.data))
      .catch(console.error);
    api
      .get("/gym/measurements")
      .then((res) => setMeasurements(res.data))
      .catch(console.error);
    api
      .get("/gym/photos")
      .then((res) => setPhotos(res.data))
      .catch(console.error);
  };

  const handleApplyTemplate = (templateId) => {
    api
      .post(`/gym/templates/${templateId}/apply`, { date: formattedDate })
      .then(() => {
        fetchData();
        setTemplateModalOpen(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startRestTimer = (seconds = restTime) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

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

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTemplate.name) return;
    api
      .post("/gym/templates", newTemplate)
      .then(() => {
        refreshAdvancedData();
        setTemplateModalOpen(false);
        setSaveTemplateNameModalOpen(false);
        setNewTemplate({ name: "", exercises: [] });
      })
      .catch(console.error);
  };

  const prepareSaveTemplate = () => {
    if (exercises.length === 0) {
      alert("No exercises logged today to save as a template!");
      return;
    }
    // Clean exercises for template (e.g. remove IDs if they were somehow there)
    const cleanedExercises = exercises.map((ex) => ({
      name: ex.name,
      muscle_group: ex.muscle_group,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
    }));
    setNewTemplate({ ...newTemplate, exercises: cleanedExercises });
    setSaveTemplateNameModalOpen(true);
  };

  const handleMeasurementSubmit = (e) => {
    e.preventDefault();
    api
      .post("/gym/measurements", { date: formattedDate, ...newMeasurement })
      .then(() => {
        refreshAdvancedData();
        setMeasurementModalOpen(false);
      })
      .catch(console.error);
  };

  const openMeasurementModal = () => {
    const existing = measurements.find((m) => m.date === formattedDate);
    if (existing) {
      setNewMeasurement({
        weight: existing.weight?.toString() || "",
        height: existing.height?.toString() || "",
        body_fat: existing.body_fat?.toString() || "",
        neck: existing.neck?.toString() || "",
        chest: existing.chest?.toString() || "",
        waist: existing.waist?.toString() || "",
        hips: existing.hips?.toString() || "",
      });
    } else {
      setNewMeasurement({
        weight: dayData.weight?.toString() || "",
        height: "",
        body_fat: "",
        neck: "",
        chest: "",
        waist: "",
        hips: "",
      });
    }
    setMeasurementModalOpen(true);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    const file = e.target.photo_file.files[0];
    const notes = e.target.notes.value;

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload to server
      const uploadRes = await api.post("/gym/photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const image_url = uploadRes.data.image_url;

      // 2. Save record
      await api.post("/gym/photos", {
        date: formattedDate,
        image_url,
        notes,
      });

      refreshAdvancedData();
      setPhotoModalOpen(false);
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
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
        refreshAdvancedData();
        if (res.data.is_new_pr) {
          startRestTimer(45); // small celebration timer or just a nudge
        }
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
    setConfirmModal({
      isOpen: true,
      title: "Delete Exercise?",
      message:
        "This will remove this exercise entry and its sets from today's log.",
      type: "delete",
      onConfirm: () => {
        api
          .delete(`/gym/exercise/${id}`)
          .then(() => setExercises((prev) => prev.filter((ex) => ex.id !== id)))
          .catch(console.error);
      },
    });
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
    setConfirmModal({
      isOpen: true,
      title: "Delete Meal?",
      message: "This will remove this meal and its macros from your daily log.",
      type: "delete",
      onConfirm: () => {
        api
          .delete(`/gym/meal/${id}`)
          .then(() => setMeals((prev) => prev.filter((m) => m.id !== id)))
          .catch(console.error);
      },
    });
  };

  const handleDeletePhoto = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Photo?",
      message:
        "Are you sure you want to remove this progress photo permanently?",
      type: "delete",
      onConfirm: () => {
        api
          .delete(`/gym/photos/${id}`)
          .then(() => setPhotos((prev) => prev.filter((p) => p.id !== id)))
          .catch(console.error);
      },
    });
  };

  const handleDeleteTemplate = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Template?",
      message: "This will permanently remove this workout routine.",
      type: "delete",
      onConfirm: () => {
        api
          .delete(`/gym/templates/${id}`)
          .then(() => setTemplates((prev) => prev.filter((t) => t.id !== id)))
          .catch(console.error);
      },
    });
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Scale size={20} />
                    </div>
                    <h3
                      className={`font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                    >
                      Body Weight
                    </h3>
                  </div>
                  <button
                    onClick={openMeasurementModal}
                    className={`p-2 rounded-lg transition-all ${darkMode ? "bg-white/5 hover:bg-white/10 text-indigo-400" : "bg-slate-50 hover:bg-slate-100 text-indigo-600"}`}
                    title="Log full measurements"
                  >
                    <ClipboardList size={18} />
                  </button>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTemplateModalOpen(true)}
                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-orange-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-orange-600"}`}
                    >
                      <History size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                        Apply Template
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        timerActive ? setTimerActive(false) : startRestTimer()
                      }
                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${timerActive ? "bg-orange-500 text-white border-orange-400 animate-pulse" : darkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-blue-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-blue-600"}`}
                    >
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {timerActive ? `${timeLeft}s` : "Rest"}
                      </span>
                    </button>
                    <button
                      onClick={() => setAddExerciseModalOpen(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
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
                            {prs.find(
                              (p) =>
                                p.exercise_name === ex.name &&
                                p.max_weight === ex.weight &&
                                p.achieved_at === formattedDate,
                            ) && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 flex items-center gap-1 animate-bounce`}
                              >
                                <CheckCircle2 size={10} />
                                New PR!
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

            {/* ROW 4: Body Progress Photos */}
            <div
              className={`p-6 md:p-8 mt-6 rounded-[2.5rem] border shadow-sm ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h3
                      className={`font-bold font-inter text-xl ${darkMode ? "text-white" : "text-slate-800"}`}
                    >
                      Progress Gallery
                    </h3>
                    <p
                      className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Visualize your transformation over time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Plus size={18} />
                  Add Photo
                </button>
              </div>

              {photos.length === 0 ? (
                <div
                  className={`py-16 text-center rounded-3xl border-2 border-dashed ${darkMode ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}
                >
                  <p className="text-sm font-medium">
                    No progress photos yet. Capture your journey!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md"
                    >
                      <img
                        src={
                          photo.image_url.startsWith("http")
                            ? photo.image_url
                            : `${api.defaults.baseURL.replace("/api", "")}${photo.image_url}`
                        }
                        alt={`Progress ${photo.date}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white text-[10px] font-bold">
                              {new Date(photo.date).toLocaleDateString()}
                            </p>
                            {photo.notes && (
                              <p className="text-white/70 text-[8px] line-clamp-1 truncate">
                                {photo.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <History size={20} />
                </div>
                <h2
                  className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Workout Templates
                </h2>
              </div>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    No templates saved yet.
                  </p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-2xl border flex flex-col gap-3 ${darkMode ? "bg-slate-800/50 border-white/5" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4
                          className={`font-bold font-inter text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {template.name}
                        </h4>
                        <p
                          className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {template.exercises.length} exercises
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplyTemplate(template.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${darkMode ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className={`p-2 rounded-lg transition-all ${darkMode ? "text-slate-500 hover:text-rose-400 hover:bg-rose-400/10" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.exercises.map((ex, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-1 rounded-md font-medium ${darkMode ? "bg-slate-700 text-slate-300" : "bg-white text-slate-600"} border ${darkMode ? "border-white/5" : "border-slate-200"}`}
                        >
                          {ex.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={prepareSaveTemplate}
              className={`w-full py-4 mt-6 rounded-2xl font-bold border-2 border-dashed transition-all flex items-center justify-center gap-2 ${darkMode ? "border-white/10 text-slate-400 hover:border-orange-500/50 hover:text-orange-400" : "border-slate-200 text-slate-500 hover:border-orange-500/50 hover:text-orange-600"}`}
            >
              <Plus size={18} />
              Save Current as Template
            </button>
          </div>
        </div>
      )}

      {/* Save Template Name Modal */}
      {isSaveTemplateNameModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${darkMode ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
          >
            <h3 className="text-lg font-bold mb-4">Save Template As...</h3>
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Template Name
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Monday Push Day"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSaveTemplateNameModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold ${darkMode ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Measurement Modal */}
      {isMeasurementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2
                  className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Body Measurements
                </h2>
              </div>
              <button
                onClick={() => setMeasurementModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMeasurementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight}
                    onChange={(e) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        weight: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.height}
                    onChange={(e) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        height: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {["neck", "chest", "waist", "hips", "body_fat"].map((field) => (
                  <div key={field}>
                    <label
                      className={`block text-[10px] font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {field.replace("_", " ")}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMeasurement[field]}
                      onChange={(e) =>
                        setNewMeasurement({
                          ...newMeasurement,
                          [field]: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 rounded-2xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
              >
                Save Body Metrics
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <h2
                  className={`text-xl font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Add Progress Photo
                </h2>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Select Photo
                </label>
                <div className="relative group">
                  <input
                    name="photo_file"
                    required
                    type="file"
                    accept="image/*"
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold ${darkMode ? "bg-slate-800/50 border-white/10 text-white file:bg-indigo-500/20 file:text-indigo-400" : "bg-white border-slate-200 text-slate-900 file:bg-indigo-50 file:text-indigo-700"}`}
                  />
                  <div
                    className={`mt-2 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Accepted formats: JPG, PNG. Max size 16MB.
                  </div>
                </div>
              </div>
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="How do you feel today?"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 rounded-2xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25"
              >
                Upload Progress
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        darkMode={darkMode}
      />
    </div>
  );
}
