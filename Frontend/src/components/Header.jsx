import { Sun, Moon, LogOut, Bell, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({
  darkMode,
  setDarkMode,
  onMenuClick,
  title = "Dashboard",
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className={`h-16 lg:h-20 flex items-center justify-between px-4 md:px-8 border-b transition-colors duration-300 z-40 ${
        darkMode
          ? "bg-[#151521]/80 border-white/5 backdrop-blur-md"
          : "bg-slate-50/80 border-slate-200 backdrop-blur-md"
      }`}
    >
      {/* Left: Hamburger (mobile) + Brand/Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            darkMode
              ? "text-slate-400 hover:text-white hover:bg-white/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Brand logo on mobile (hidden on lg since sidebar has it) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm font-outfit">P</span>
          </div>
          <span
            className={`font-outfit font-bold text-lg tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Pomo<span className="text-indigo-500">Focus</span>
          </span>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-full transition-all duration-300 border ${
            darkMode
              ? "bg-slate-800 border-white/5 text-amber-400 hover:bg-slate-700"
              : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-50"
          }`}
          title="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        <button
          className={`p-2.5 rounded-full transition-all duration-300 border ${
            darkMode
              ? "bg-slate-800 border-white/5 text-slate-300 hover:text-white hover:bg-slate-700"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <div className="relative">
            <Bell size={18} />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border-2 border-slate-900 translate-x-1/3 -translate-y-1/3" />
          </div>
        </button>

        {/* User profile */}
        <div
          className={`h-10 border-l pl-3 sm:pl-4 ml-1 flex items-center gap-2 sm:gap-3 ${darkMode ? "border-white/10" : "border-slate-200"}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white/10 flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden sm:flex flex-col">
            <span
              className={`text-sm font-semibold font-inter leading-tight ${darkMode ? "text-slate-200" : "text-slate-700"}`}
            >
              {user?.email?.split("@")[0] || "User"}
            </span>
            <span
              className={`text-[10px] font-medium font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Pro Plan
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={`ml-1 p-2 rounded-lg transition-colors ${
              darkMode
                ? "text-rose-400 hover:bg-rose-500/10"
                : "text-rose-500 hover:bg-rose-50"
            }`}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
