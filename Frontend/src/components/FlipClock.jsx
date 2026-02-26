import { useState, useEffect, useRef } from "react";

export default function FlipClock({ timeValue, mode, darkMode, isFullscreen }) {
  const [currentValue, setCurrentValue] = useState(timeValue);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(timeValue);

  // Trigger flip animation when timeValue changes
  useEffect(() => {
    if (timeValue !== prevValueRef.current) {
      setIsFlipping(true);
      setCurrentValue(timeValue);

      const timer = setTimeout(() => {
        setIsFlipping(false);
        prevValueRef.current = timeValue;
      }, 600); // matches CSS animation duration

      return () => clearTimeout(timer);
    }
  }, [timeValue]);

  // Adjust clock card background based on mode and theme
  const bgColor = darkMode
    ? mode === "pomodoro"
      ? "bg-[#111827]"
      : "bg-[#1a112c]"
    : mode === "pomodoro"
      ? "bg-[#2563eb]"
      : "bg-[#9333ea]"; // Use bold blue/purple in light mode

  // Use white text on the clock cards regardless of mode to ensure contrast
  const textClass = "text-white";

  const cardSize = isFullscreen
    ? "w-40 h-56 sm:w-64 sm:h-80 md:w-80 md:h-[26rem] text-[6rem] sm:text-[10rem] md:text-[14rem]"
    : "w-24 h-32 sm:w-36 sm:h-48 text-[4rem] sm:text-[6rem]";

  const cardBase = `relative flex justify-center items-center rounded-xl shadow-xl flip-timer-card select-none font-bold font-inter leading-none ${cardSize} ${textClass} transition-all duration-500`;

  return (
    <div className={cardBase}>
      {/* Base top half (shows new timeValue) */}
      <div
        className={`absolute top-0 left-0 w-full h-1/2 overflow-hidden rounded-t-xl border border-b-0 border-white/20 ${bgColor}`}
      >
        <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-[50%]">
          {timeValue}
        </div>
      </div>

      {/* Base bottom half (shows old timeValue) */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1/2 overflow-hidden rounded-b-xl border border-t-0 border-white/20 ${bgColor}`}
      >
        <div className="absolute top-0 left-0 w-full flex justify-center -translate-y-[50%]">
          {prevValueRef.current}
        </div>
      </div>

      {/* 3D Animated Card Front (Flipping Top Half: swings from 0 to -180) */}
      <div
        className={`absolute top-0 left-0 w-full h-1/2 overflow-hidden rounded-t-xl origin-bottom border border-b-0 border-white/20 z-10 transition-transform duration-600 ease-in-out ${bgColor}`}
        style={{
          transform: isFlipping ? "rotateX(-180deg)" : "rotateX(0deg)",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-[50%]">
          {prevValueRef.current}
        </div>
      </div>

      {/* 3D Animated Card Back (Flipping Bottom Half revealed: swings from 180 to 0) */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1/2 overflow-hidden rounded-b-xl origin-top border border-t-0 border-white/20 z-20 transition-transform duration-600 ease-in-out ${bgColor}`}
        style={{
          transform: isFlipping ? "rotateX(0deg)" : "rotateX(180deg)",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="absolute top-0 left-0 w-full flex justify-center -translate-y-[50%]">
          {timeValue}
        </div>
      </div>

      {/* Center hinge line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/50 z-30 -translate-y-1/2 shadow-sm"></div>
    </div>
  );
}
