import { useState, useEffect } from "react";
import Timer from "./components/Timer";
import SessionStats from "./components/SessionStats";
import Controls from "./components/Controls";
import Quote from "./components/Quote";
import useTimer from "./hooks/useTimer";

function App() {
  const {
    timeLeft,
    mode,
    isActive,
    sessionCount,
    progress,
    toggleTimer,
    resetTimer,
    changeMode,
  } = useTimer();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // default true
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === "KeyR") {
        resetTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTimer, resetTimer]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode ? "bg-dark-bg text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Background Particles (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-neon-blue rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-neon-purple rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8 sm:mb-12">
          <h1
            className={`text-2xl font-outfit font-bold tracking-wider ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            POMO<span className="text-electric-blue">FOCUS</span>
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 ${darkMode ? "bg-white/10 hover:bg-white/20" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Main Content */}
        <main className="w-full flex flex-col items-center gap-8">
          {/* Mode Selector */}
          <div
            className={`flex gap-2 p-1.5 rounded-full ${darkMode ? "bg-navy-card/80 border border-white/10" : "bg-white shadow-sm border border-gray-200"} backdrop-blur-md`}
          >
            {["pomodoro", "shortBreak", "longBreak"].map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                  mode === m
                    ? m === "pomodoro"
                      ? "bg-electric-blue text-white shadow-lg neon-shadow-blue"
                      : "bg-neon-purple text-white shadow-lg neon-shadow-purple"
                    : darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {m === "pomodoro"
                  ? "Pomodoro"
                  : m === "shortBreak"
                    ? "Short Break"
                    : "Long Break"}
              </button>
            ))}
          </div>

          <Timer
            timeLeft={timeLeft}
            progress={progress}
            mode={mode}
            darkMode={darkMode}
          />

          <Controls
            isActive={isActive}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            mode={mode}
            darkMode={darkMode}
          />

          <SessionStats sessionCount={sessionCount} darkMode={darkMode} />
        </main>

        <footer className="mt-auto pt-16 pb-4 w-full text-center">
          <Quote darkMode={darkMode} />
        </footer>
      </div>
    </div>
  );
}

export default App;
