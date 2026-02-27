import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

export default function useTimer() {
  const { api, user, timerProject, setTimerProject, timerTask, setTimerTask } =
    useAuth();
  const { settings } = useSettings();

  // Derive durations in seconds from user settings
  const POMODORO_TIME = settings.focusDuration * 60;
  const SHORT_BREAK_TIME = settings.shortBreak * 60;
  const LONG_BREAK_TIME = settings.longBreak * 60;

  const getInitialTime = useCallback(
    (m) => {
      switch (m) {
        case "pomodoro":
          return settings.focusDuration * 60;
        case "shortBreak":
          return settings.shortBreak * 60;
        case "longBreak":
          return settings.longBreak * 60;
        default:
          return settings.focusDuration * 60;
      }
    },
    [settings],
  );

  const [mode, setMode] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Load initial session count from backend
  useEffect(() => {
    if (user && api) {
      api
        .get("/sessions/stats/today")
        .then((res) => setSessionCount(res.data.today_pomodoros))
        .catch((err) => console.error("Could not load stats", err));
    }
  }, [user, api]);

  // When settings change (user saves from Settings page), reset the current timer
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(getInitialTime(mode));
  }, [settings, mode, getInitialTime]);

  const changeMode = useCallback(
    (newMode) => {
      setMode(newMode);
      setIsActive(false);
      setTimeLeft(getInitialTime(newMode));
    },
    [getInitialTime],
  );

  const toggleTimer = useCallback(() => setIsActive((prev) => !prev), []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(getInitialTime(mode));
  }, [mode, getInitialTime]);

  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 523.25;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      }
    } catch (e) {
      console.warn("AudioContext not supported", e);
    }
  };

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound();

      // Log session to backend
      if (user && api) {
        api
          .post("/sessions", {
            type: mode,
            duration_seconds: getInitialTime(mode),
            project_id: timerProject,
            project_task_id: timerTask,
          })
          .catch((err) => console.error("Failed to log session", err));
      }

      if (mode === "pomodoro") {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);
        if (newCount % 4 === 0) {
          changeMode("longBreak");
        } else {
          changeMode("shortBreak");
        }
      } else {
        changeMode("pomodoro");
      }
    }

    return () => clearInterval(interval);
  }, [
    isActive,
    timeLeft,
    mode,
    sessionCount,
    changeMode,
    user,
    api,
    getInitialTime,
    timerProject,
    timerTask,
  ]);

  const totalTime = getInitialTime(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return {
    timeLeft,
    mode,
    isActive,
    sessionCount,
    progress,
    toggleTimer,
    resetTimer,
    changeMode,
    selectedProjectId: timerProject,
    setSelectedProjectId: setTimerProject,
    selectedTaskId: timerTask,
    setSelectedTaskId: setTimerTask,
  };
}
