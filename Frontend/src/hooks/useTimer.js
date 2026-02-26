import { useState, useEffect, useCallback } from "react";

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

export default function useTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [mode, setMode] = useState("pomodoro");
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem("pomodoroSessions");
    return saved ? parseInt(saved, 10) : 0;
  });

  const getInitialTime = useCallback((m) => {
    switch (m) {
      case "pomodoro":
        return POMODORO_TIME;
      case "shortBreak":
        return SHORT_BREAK_TIME;
      case "longBreak":
        return LONG_BREAK_TIME;
      default:
        return POMODORO_TIME;
    }
  }, []);

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
    // A simple beep using Web Audio API as a fallback,
    // or you could use an actual audio file if one was provided in public/assets
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 523.25; // C5
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
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound();

      if (mode === "pomodoro") {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);
        localStorage.setItem("pomodoroSessions", newCount.toString());

        // Auto-switch logic: every 4th session is a long break
        if (newCount % 4 === 0) {
          changeMode("longBreak");
        } else {
          changeMode("shortBreak");
        }
      } else {
        // Break is over, back to work
        changeMode("pomodoro");
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionCount, changeMode]);

  // Calculate progress %
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
  };
}
