export default function ProgressRing({ progress, isPomo }) {
  const r = 130;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const strokeColor = isPomo ? "#3b82f6" : "#a855f7";
  const glowColor = isPomo ? "rgba(59,130,246,0.6)" : "rgba(168,85,247,0.6)";

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="opacity-70">
      <defs>
        <filter id="ringGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx="150"
        cy="150"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="6"
      />

      {/* Progress arc */}
      <circle
        cx="150"
        cy="150"
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)",
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
    </svg>
  );
}
