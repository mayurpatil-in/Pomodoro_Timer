import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pomodoroToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null); // Standalone Task currently being focused on
  const [timerProject, setTimerProject] = useState(null); // Selected Project ID
  const [timerTask, setTimerTask] = useState(null); // Selected Project Task ID

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("pomodoroToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to load user:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("pomodoroToken", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (email, password) => {
    const response = await api.post("/auth/register", { email, password });
    localStorage.setItem("pomodoroToken", response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("pomodoroToken");
    setUser(null);
  };

  const updateDailyGoal = async (newGoal) => {
    if (!user) return;
    try {
      const response = await api.put("/auth/me", { daily_goal: newGoal });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to update daily goal", err);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/auth/password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateDailyGoal,
        updatePassword,
        api,
        activeTask,
        setActiveTask,
        timerProject,
        setTimerProject,
        timerTask,
        setTimerTask,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
