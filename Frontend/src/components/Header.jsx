import { Sun, Moon, Bell, Menu, Search, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

// Derive a human-friendly page title from the route
function usePageTitle() {
  const { pathname } = useLocation();
  const map = {
    "/": "Dashboard",
    "/timer": "Focus Timer",
    "/tasks": "Task Manager",
    "/goals": "Goals & Milestones",
    "/routine": "Daily Routine",
    "/analytics": "Analytics",
    "/settings": "Settings",
  };
  return map[pathname] ?? "PomoFocus";
}

export default function Header({ darkMode, setDarkMode, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  // Get time of day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header
      className={`relative h-16 flex items-center justify-between px-4 md:px-6 border-b z-40 transition-colors duration-300 ${
        darkMode
          ? "bg-[#0f0f16]/80 border-white/[0.05] backdrop-blur-xl"
          : "bg-white/80 border-slate-200/80 backdrop-blur-xl"
      }`}
    >
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* ── Left: Mobile Hamburger + Page Title ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-xl transition-all active:scale-95 ${
            darkMode
              ? "text-slate-400 hover:text-white hover:bg-white/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        {/* Mobile Brand (hidden on desktop since sidebar has it) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
            <span className="text-white font-extrabold text-sm font-outfit">
              P
            </span>
          </div>
          <span
            className={`font-outfit font-extrabold text-lg tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Pomo
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Focus
            </span>
          </span>
        </div>

        {/* Desktop page title */}
        <div className="hidden lg:flex flex-col leading-tight">
          <span
            className={`text-[10px] font-outfit font-semibold uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            {greeting}, {user?.email?.split("@")[0] || "User"} 👋
          </span>
          <h1
            className={`text-base font-extrabold font-inter leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* ── Right: Actions + Profile ── */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* AI / Sparkle button */}
        <button
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-outfit transition-all border ${
            darkMode
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
              : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
          }`}
          title="AI Suggestions"
        >
          <Sparkles size={13} />
          AI Tips
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-xl transition-all duration-300 border ${
            darkMode
              ? "bg-slate-800/80 border-white/8 text-amber-400 hover:bg-slate-700"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
          }`}
          title="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <button
          className={`relative p-2.5 rounded-xl transition-all duration-300 border ${
            darkMode
              ? "bg-slate-800/80 border-white/8 text-slate-400 hover:text-white hover:bg-slate-700"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm"
          }`}
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-[1.5px] border-slate-900 animate-pulse" />
        </button>

        {/* Divider */}
        <div
          className={`h-8 w-px mx-0.5 ${darkMode ? "bg-white/10" : "bg-slate-200"}`}
        />

        {/* User Profile Chip */}
        <div
          className={`flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-2xl border transition-all cursor-pointer ${
            darkMode
              ? "border-white/8 bg-slate-800/60 hover:bg-slate-700/80"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 shadow-sm"
          }`}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex-shrink-0 ring-2 ring-white/10">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Name */}
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className={`text-xs font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-700"}`}
            >
              {user?.email?.split("@")[0] || "User"}
            </span>
            <span
              className={`text-[9px] font-outfit font-semibold uppercase tracking-wide mt-0.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
            >
              Pro
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={`p-1 rounded-lg transition-all ml-0.5 ${
              darkMode
                ? "text-slate-600 hover:text-rose-400 hover:bg-rose-400/10"
                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
            }`}
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
