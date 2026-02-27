import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TimerPage from "./pages/TimerPage";
import TasksPage from "./pages/TasksPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import GoalsPage from "./pages/GoalsPage";
import DailyRoutinePage from "./pages/DailyRoutinePage";
import MoneyTrackerPage from "./pages/MoneyTrackerPage";
import TrackReportPage from "./pages/TrackReportPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./context/AuthContext";

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") !== "light",
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.body.classList.toggle("light", !darkMode);
  }, [darkMode]);

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-dark-bg text-white" : "bg-blue-50 text-slate-900"} flex items-center justify-center`}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <Login darkMode={darkMode} />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/" replace /> : <Register darkMode={darkMode} />
        }
      />

      {/* Protected Dashboard Layout and Sub-Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} />
          }
        >
          <Route path="/" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/timer" element={<TimerPage darkMode={darkMode} />} />
          <Route
            path="/settings"
            element={<SettingsPage darkMode={darkMode} />}
          />
          <Route path="/goals" element={<GoalsPage darkMode={darkMode} />} />
          <Route
            path="/routine"
            element={<DailyRoutinePage darkMode={darkMode} />}
          />
          <Route path="/tasks" element={<TasksPage darkMode={darkMode} />} />
          <Route
            path="/finances"
            element={<MoneyTrackerPage darkMode={darkMode} />}
          />
          <Route
            path="/analytics"
            element={<AnalyticsPage darkMode={darkMode} />}
          />
          <Route
            path="/reports"
            element={<TrackReportPage darkMode={darkMode} />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
