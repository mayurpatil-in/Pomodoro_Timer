import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import {
  LayoutDashboard as LayoutIcon,
  Target as TargetIcon,
  BarChart2 as ChartIcon,
  CheckSquare as TaskIcon,
  Settings as SettingsIcon,
  Trophy as GoalIcon,
  CalendarDays as RoutineIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/", icon: LayoutIcon, end: true },
  { name: "Timer", path: "/timer", icon: TargetIcon },
  { name: "Tasks", path: "/tasks", icon: TaskIcon },
  { name: "Goals", path: "/goals", icon: GoalIcon },
  { name: "Routine", path: "/routine", icon: RoutineIcon },
  { name: "Analytics", path: "/analytics", icon: ChartIcon },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

function NavItem({ item, darkMode, onClick }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
        ${
          isActive
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
            : darkMode
              ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        }
      `}
    >
      <item.icon size={18} className="flex-shrink-0" />
      {item.name}
    </NavLink>
  );
}

// ── Desktop Sidebar ──────────────────────────────────────────────
export function DesktopSidebar({ darkMode }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 border-r hidden lg:flex flex-col transition-colors duration-300 z-50 ${
        darkMode ? "bg-[#1e1e2d] border-white/5" : "bg-white border-slate-200"
      }`}
    >
      <Brand darkMode={darkMode} />
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto stylish-scrollbar">
        <p
          className={`px-4 mb-3 text-xs font-semibold tracking-wider uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.name} item={item} darkMode={darkMode} />
        ))}
      </nav>
    </aside>
  );
}

// ── Mobile Slide-over Sidebar ────────────────────────────────────
export function MobileSidebar({ darkMode, open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 z-[70] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-[#1e1e2d]" : "bg-white"}`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <Brand darkMode={darkMode} compact />
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              darkMode={darkMode}
              onClick={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

// ── Mobile Bottom Navigation Bar ──────────────────────────────────
export function MobileBottomNav({ darkMode }) {
  // Show only the 5 most important items on mobile bottom bar
  const BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5);
  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 flex lg:hidden border-t py-1 safe-area-pb ${
        darkMode
          ? "bg-[#1e1e2d]/95 border-white/5 backdrop-blur-lg"
          : "bg-white/95 border-slate-200 backdrop-blur-lg"
      }`}
    >
      {BOTTOM_ITEMS.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center py-2 gap-0.5 text-[10px] font-outfit font-semibold transition-colors ${
              isActive
                ? "text-indigo-500"
                : darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`p-1.5 rounded-xl transition-all ${isActive ? (darkMode ? "bg-indigo-500/15" : "bg-indigo-50") : ""}`}
              >
                <item.icon size={20} />
              </span>
              {item.name}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ── Shared Brand Logo ─────────────────────────────────────────────
function Brand({ darkMode, compact }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "h-20 px-8"}`}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
        <span className="text-white font-bold text-lg font-outfit">P</span>
      </div>
      <span
        className={`font-outfit font-bold text-xl tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
      >
        Pomo<span className="text-indigo-500">Focus</span>
      </span>
    </div>
  );
}

// ── Default export for backward-compat ───────────────────────────
export default DesktopSidebar;
