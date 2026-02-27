import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Search, Loader2, Briefcase } from "lucide-react";
import PipelineColumn from "../components/PipelineColumn";
import ApplicationCard from "../components/ApplicationCard";
import KPISection from "../components/KPISection";
import AddApplicationModal from "../components/AddApplicationModal";
import CustomConfirmModal from "../components/CustomConfirmModal";
import confetti from "canvas-confetti";

const COLUMNS = [
  { id: "Applied", title: "Applied", colorHex: "#6366f1" },
  { id: "HR Round", title: "HR Round", colorHex: "#3b82f6" },
  { id: "Technical Round", title: "Technical Round", colorHex: "#a855f7" },
  { id: "Final Round", title: "Final Round", colorHex: "#f59e0b" },
  { id: "Offer", title: "Offer", colorHex: "#10b981" },
  { id: "Rejected", title: "Rejected", colorHex: "#f43f5e" },
];

export default function InterviewTrackerPage({ darkMode }) {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [initialStage, setInitialStage] = useState("Applied");
  const [editingApp, setEditingApp] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchApplications();
    fetchKPIs();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/interviews/");
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async () => {
    try {
      const response = await api.get("/interviews/kpis");
      setKpis(response.data);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    }
  };

  const handleAddSubmit = async (formData) => {
    setIsModalOpen(false);
    try {
      if (editingApp) {
        await api.put(`/interviews/${editingApp.id}`, formData);
      } else {
        await api.post("/interviews/", formData);
      }
      setEditingApp(null);
      fetchApplications();
      fetchKPIs();
      if (
        formData.stage === "Offer" &&
        (!editingApp || editingApp.stage !== "Offer")
      ) {
        fireConfetti();
      }
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    // Find the actively dragged application
    const activeApp = applications.find((app) => app.id === active.id);
    if (!activeApp) return;

    // Check if dragging over a column
    const overColumn = COLUMNS.find((col) => col.id === over.id);
    // Or dragging over a card
    const overApp = applications.find((app) => app.id === over.id);

    const newStage = overColumn
      ? overColumn.id
      : overApp
        ? overApp.stage
        : null;

    if (newStage && activeApp.stage !== newStage) {
      // Optimistically update the UI
      setApplications((prev) =>
        prev.map((app) =>
          app.id === active.id ? { ...app, stage: newStage } : app,
        ),
      );
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#10b981", "#fbbf24", "#f43f5e"],
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeApp = applications.find((app) => app.id === active.id);

    // Once dropped, trigger a backend update if the stage really changed
    if (activeApp) {
      if (activeApp.stage === "Offer") fireConfetti();

      try {
        await api.put(`/interviews/${activeApp.id}`, {
          stage: activeApp.stage,
        });
        fetchKPIs(); // Refresh KPIs based on stage change
      } catch (error) {
        console.error("Error updating application stage:", error);
        fetchApplications(); // Fallback to fetching actual server state
      }
    }
  };

  const openAddModal = (stage = "Applied") => {
    setEditingApp(null);
    setInitialStage(stage);
    setIsModalOpen(true);
  };

  const handleCardClick = (application) => {
    setEditingApp(application);
    setInitialStage(application.stage);
    setIsModalOpen(true);
  };

  const handleDeleteApplication = (appId) => {
    setAppToDelete(appId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteApplication = async () => {
    if (!appToDelete) return;
    try {
      await api.delete(`/interviews/${appToDelete}`);
      fetchApplications();
      fetchKPIs();
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAppToDelete(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const match = searchQuery.toLowerCase();
    return (
      app.company_name.toLowerCase().includes(match) ||
      app.role.toLowerCase().includes(match)
    );
  });

  const activeApp = applications.find((p) => p.id === activeId);

  return (
    <div
      className={`min-h-full font-outfit ${darkMode ? "text-slate-200" : "text-slate-800"}`}
    >
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Briefcase size={20} className="text-white" />
            </div>
            <h1
              className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Interview{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Tracker
              </span>
            </h1>
          </div>
          <p
            className={`text-sm ml-[52px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Track applications, interviews, and job offers with a seamless
            pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 size-3.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            />
            <input
              type="text"
              placeholder="Search by company or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500/40 outline-none w-56 border ${
                darkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-600"
                  : "bg-white border-slate-200 shadow-sm text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>
          <button
            onClick={() => openAddModal("Applied")}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all font-bold text-sm active:scale-95"
          >
            Add Application
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <KPISection kpis={kpis} darkMode={darkMode} />

      {/* ─── Kanban Board Pipeline ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="size-10 text-indigo-500 animate-spin mb-4" />
          <p
            className={`text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Loading pipeline…
          </p>
        </div>
      ) : (
        <div className="pb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
              style={{ minHeight: "calc(100vh - 350px)" }}
            >
              {COLUMNS.map((column) => (
                <div key={column.id} className="snap-start shrink-0">
                  <PipelineColumn
                    column={column}
                    applications={filteredApplications.filter(
                      (app) => app.stage === column.id,
                    )}
                    darkMode={darkMode}
                    onAddClick={openAddModal}
                    onCardClick={handleCardClick}
                    onDeleteClick={handleDeleteApplication}
                  />
                </div>
              ))}
            </div>

            {/* Drag Overlay for smooth animation while dragging */}
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.3" } },
                }),
              }}
            >
              {activeId && activeApp ? (
                <ApplicationCard
                  application={activeApp}
                  darkMode={darkMode}
                  onClick={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Add/Edit Application Modal */}
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleAddSubmit}
        initialStage={initialStage}
        initialData={editingApp}
        darkMode={darkMode}
      />

      {/* Custom Confirmation Modal */}
      <CustomConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAppToDelete(null);
        }}
        onConfirm={confirmDeleteApplication}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        darkMode={darkMode}
      />
    </div>
  );
}
