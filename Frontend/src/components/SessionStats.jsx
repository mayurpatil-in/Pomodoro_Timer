export default function SessionStats({ sessionCount, darkMode }) {
  return (
    <div
      className={`mt-8 px-6 py-4 rounded-2xl backdrop-blur-md flex flex-col items-center gap-2 ${
        darkMode
          ? "bg-navy-card/50 border border-white/5 shadow-lg"
          : "bg-white shadow-md border border-gray-100"
      }`}
    >
      <span
        className={`text-sm tracking-wider uppercase font-medium ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Sessions Completed
      </span>

      <div className="flex items-center gap-3">
        {/* Render simple visual dots. Every 4th dot triggers a long break usually */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              sessionCount % 4 > i ||
              (sessionCount > 0 && sessionCount % 4 === 0)
                ? "bg-electric-blue neon-shadow-blue scale-110"
                : darkMode
                  ? "bg-gray-700"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <div
        className={`text-2xl font-bold font-inter mt-1 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {sessionCount}{" "}
        <span
          className={`text-sm font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          Total
        </span>
      </div>
    </div>
  );
}
