export default function ProgressRing({ progress, className = "" }) {
  const radius = 140; // Desktop sizes
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex justify-center items-center w-64 h-64 sm:w-80 sm:h-80 opacity-60 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 320 320">
        <circle
          className="text-gray-700/30 stroke-current"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="160"
          cy="160"
        />
        <circle
          className={`progress-ring__circle stroke-current ${className}`}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="160"
          cy="160"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
    </div>
  );
}
