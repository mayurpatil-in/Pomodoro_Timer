import { useState, useEffect, useRef } from "react";

/**
 * Flip Clock Card — correctly clips the digit so the top half
 * shows only the top portion and the bottom half shows only the
 * bottom portion (like a real mechanical flip clock).
 *
 * Technique: each half contains a 200%-high inner div that is
 * vertically centered on the card's midline. overflow-hidden on
 * the half then clips cleanly at the midpoint.
 */
export default function FlipClock({ timeValue, mode, darkMode, isFullscreen }) {
  const [prevValue, setPrevValue] = useState(timeValue);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevRef = useRef(timeValue);

  useEffect(() => {
    if (timeValue === prevRef.current) return;

    const old = prevRef.current;
    setPrevValue(old);
    setIsFlipping(true);
    prevRef.current = timeValue;

    const t = setTimeout(() => setIsFlipping(false), 600);
    return () => clearTimeout(t);
  }, [timeValue]);

  const isPomo = mode === "pomodoro";

  /* Card background */
  const cardBg = darkMode
    ? isPomo
      ? "#0d1a2e"
      : "#130d20"
    : isPomo
      ? "#1d4ed8"
      : "#7e22ce";

  /* Size classes */
  const w = isFullscreen ? "w-36 sm:w-56 md:w-72" : "w-20 sm:w-28";
  const h = isFullscreen ? "h-48 sm:h-72 md:h-[22rem]" : "h-28 sm:h-36";
  const fs = isFullscreen
    ? "text-[6rem] sm:text-[9rem] md:text-[12rem]"
    : "text-[3rem] sm:text-[4.5rem]";

  /** Renders a half of the card. `side` = 'top' | 'bottom'.
   *  A 200%-tall inner wrapper is anchored at the matching edge,
   *  so the digit is centered exactly on the midline.
   *  overflow-hidden on the outer div clips the other half away.
   */
  const Half = ({ side, value, extraStyle = {}, extraClass = "" }) => (
    <div
      className={`absolute ${side === "top" ? "top-0" : "bottom-0"} left-0 w-full h-1/2 overflow-hidden ${extraClass}`}
      style={extraStyle}
    >
      <div
        className={`absolute left-0 w-full h-[200%] ${side === "top" ? "top-0" : "bottom-0"} flex items-center justify-center`}
      >
        <span
          className={`${fs} font-bold font-inter leading-none text-white select-none`}
        >
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={`${w} ${h} relative rounded-2xl overflow-hidden`}
      style={{
        background: cardBg,
        boxShadow:
          "0 10px 36px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* ── Static top half — shows current value's top */}
      <Half side="top" value={timeValue} />

      {/* ── Static bottom half — shows current value's bottom */}
      <Half side="bottom" value={timeValue} />

      {/* ── Animated top flap: prev value's top, folds down (0° → -90°) */}
      {isFlipping && (
        <Half
          side="top"
          value={prevValue}
          extraStyle={{
            background: cardBg,
            transformOrigin: "bottom center",
            animation: "flipTop 0.3s ease-in forwards",
            zIndex: 20,
          }}
        />
      )}

      {/* ── Animated bottom flap: new value's bottom, unfolds down (90° → 0°) */}
      {isFlipping && (
        <Half
          side="bottom"
          value={timeValue}
          extraStyle={{
            background: cardBg,
            transformOrigin: "top center",
            animation: "flipBottom 0.3s ease-out 0.3s forwards",
            transform: "rotateX(90deg)",
            zIndex: 20,
          }}
        />
      )}

      {/* ── Centre hinge shadow */}
      <div
        className="absolute inset-x-0 top-1/2 z-30 pointer-events-none"
        style={{
          height: "2px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.6)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.8)",
        }}
      />

      {/* ── Top gloss */}
      <div
        className="absolute top-0 left-0 w-full h-1/2 rounded-t-2xl pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)",
        }}
      />

      <style>{`
        @keyframes flipTop   { from{transform:rotateX(0deg)}   to{transform:rotateX(-90deg)} }
        @keyframes flipBottom{ from{transform:rotateX(90deg)}  to{transform:rotateX(0deg)}   }
      `}</style>
    </div>
  );
}
