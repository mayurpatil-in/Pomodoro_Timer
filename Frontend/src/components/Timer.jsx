import FlipClock from "./FlipClock";
import ProgressRing from "./ProgressRing";
import { Maximize, Minimize } from "lucide-react";
import { useState, useEffect } from "react";

export default function Timer({ timeLeft, progress, mode, darkMode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const paddedMins = minutes.toString().padStart(2, "0");
  const paddedSecs = seconds.toString().padStart(2, "0");

  // Ring color changes based on mode
  const currentAccent =
    mode === "pomodoro" ? "text-electric-blue" : "text-neon-purple";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for escape key fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Progress Ring Background container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-110 sm:scale-125 z-0">
        <ProgressRing progress={progress} className={currentAccent} />
      </div>

      <div
        className={`relative z-10 rounded-3xl p-6 sm:p-12 border shadow-2xl flex flex-col gap-4 items-center group transition-all duration-500 ${
          isFullscreen
            ? "fixed inset-0 z-[100] flex items-center justify-center rounded-none border-none p-0 !m-0 "
            : ""
        } ${
          darkMode
            ? isFullscreen
              ? "bg-dark-bg"
              : "bg-navy-card/50 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : isFullscreen
              ? "bg-gray-50"
              : "bg-white/80 backdrop-blur-xl border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        }`}
      >
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ring-2 ${
            isFullscreen ? "opacity-0 group-hover:opacity-100" : ""
          } ${
            darkMode
              ? "text-gray-300 ring-white/20 hover:text-white hover:bg-white/10"
              : "text-gray-900 ring-gray-300 hover:text-black hover:bg-black/10"
          }`}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Clock"}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>

        <div className="flex gap-2 sm:gap-4 items-center">
          <FlipClock
            timeValue={paddedMins}
            mode={mode}
            darkMode={darkMode}
            isFullscreen={isFullscreen}
          />
          <span
            className={`font-bold pb-2 font-inter ${
              isFullscreen ? "text-6xl sm:text-9xl" : "text-4xl sm:text-6xl"
            } ${mode === "pomodoro" ? "neon-text-blue" : "neon-text-purple"}`}
          >
            :
          </span>
          <FlipClock
            timeValue={paddedSecs}
            mode={mode}
            darkMode={darkMode}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
