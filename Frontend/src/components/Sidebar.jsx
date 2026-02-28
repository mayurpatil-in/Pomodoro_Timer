import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BarChart2,
  Timer,
  CheckSquare,
  Trophy,
  CalendarDays,
  Wallet,
  ClipboardList,
  Dumbbell,
  FolderKanban,
  Briefcase,
  Settings,
  Users,
  LogOut,
  X,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ── Navigation Groups ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    defaultOpen: true,
    items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, end: true },
      { name: "Calendar", path: "/calendar", icon: CalendarDays },
      { name: "Analytics", path: "/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Focus",
    defaultOpen: true,
    items: [
      { name: "Timer", path: "/timer", icon: Timer },
      { name: "Tasks", path: "/tasks", icon: CheckSquare },
      { name: "Goals", path: "/goals", icon: Trophy },
      { name: "Routine", path: "/routine", icon: CalendarDays },
    ],
  },
  {
    label: "Tracker",
    defaultOpen: true,
    items: [
      { name: "Projects", path: "/projects", icon: FolderKanban },
      { name: "Interviews", path: "/interviews", icon: Briefcase },
      { name: "Gym", path: "/gym", icon: Dumbbell },
    ],
  },
  {
    label: "Finance",
    defaultOpen: true,
    items: [
      { name: "Finances", path: "/finances", icon: Wallet },
      { name: "Reports", path: "/reports", icon: ClipboardList },
    ],
  },
  {
    label: "Account",
    defaultOpen: true,
    items: [{ name: "Settings", path: "/settings", icon: Settings }],
  },
];

// Mobile bottom nav items (5 most-used)
const BOTTOM_ITEMS = [
  { name: "Home", path: "/", icon: LayoutDashboard, end: true },
  { name: "Timer", path: "/timer", icon: Timer },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Finance", path: "/finances", icon: Wallet },
  { name: "Gym", path: "/gym", icon: Dumbbell },
];

// ── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({ item, darkMode, onClick }) {
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm font-outfit ${
          isActive
            ? "text-white"
            : darkMode
              ? "text-slate-400 hover:text-white hover:bg-white/5"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active gradient pill */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/30" />
          )}

          {/* Hover indicator bar */}
          {!isActive && (
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full transition-all duration-200 group-hover:h-4 ${
                darkMode ? "bg-indigo-400" : "bg-indigo-500"
              }`}
            />
          )}

          {/* Icon */}
          <item.icon
            size={16}
            className={`relative flex-shrink-0 transition-all duration-200 ${
              isActive ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" : ""
            }`}
          />

          {/* Label */}
          <span className="relative truncate flex-1">{item.name}</span>

          {/* Active chevron */}
          {isActive && (
            <ChevronRight size={13} className="relative ml-auto opacity-60" />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Collapsible Group ────────────────────────────────────────────────────────
function NavGroup({ group, darkMode, onItemClick }) {
  const [open, setOpen] = useState(group.defaultOpen !== false);

  return (
    <div>
      {/* Group header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 mb-1 py-1 rounded-lg transition-colors ${
          darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
        }`}
      >
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${
            darkMode ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {group.label}
        </span>
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          } ${darkMode ? "text-slate-700" : "text-slate-300"}`}
        />
      </button>

      {/* Items */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "space-y-0.5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {open &&
          group.items.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              darkMode={darkMode}
              onClick={onItemClick}
            />
          ))}
      </div>
    </div>
  );
}

// ── User Footer Card ─────────────────────────────────────────────────────────
function UserFooter({ darkMode, onLogout }) {
  const { user } = useAuth();
  return (
    <div
      className={`p-3 border-t ${darkMode ? "border-white/[0.06]" : "border-slate-200/80"}`}
    >
      <div
        className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-default group ${
          darkMode
            ? "bg-white/5 hover:bg-white/8"
            : "bg-slate-50 hover:bg-slate-100"
        }`}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-500/20 flex-shrink-0 ring-2 ring-white/10">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold font-inter truncate leading-tight ${darkMode ? "text-slate-200" : "text-slate-700"}`}
          >
            {user?.email?.split("@")[0] || "User"}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Zap size={9} className="text-amber-400" />
            <span
              className={`text-[10px] font-outfit font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Pro Plan
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
            darkMode
              ? "text-slate-500 hover:text-rose-400 hover:bg-rose-400/10"
              : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
          }`}
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Brand ────────────────────────────────────────────────────────────────────
function Brand({ darkMode, compact }) {
  return (
    <div
      className={`relative flex items-center gap-3 ${compact ? "py-0" : "h-20 px-6"}`}
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 ring-1 ring-white/10">
        <span className="text-white font-extrabold text-base font-outfit">
          P
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`font-outfit font-extrabold text-lg tracking-tight leading-none ${darkMode ? "text-white" : "text-slate-900"}`}
        >
          Pomo
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Focus
          </span>
        </span>
        <span
          className={`text-[9px] font-outfit font-semibold uppercase tracking-widest mt-0.5 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          Productivity Suite
        </span>
      </div>
    </div>
  );
}

// ── Desktop Sidebar ──────────────────────────────────────────────────────────
export function DesktopSidebar({ darkMode }) {
  const { logout } = useAuth();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-60 border-r hidden lg:flex flex-col z-50 transition-colors duration-300 ${
        darkMode
          ? "bg-[#12121a] border-white/[0.06]"
          : "bg-white border-slate-200/80"
      }`}
    >
      {/* Decorative orb */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand */}
      <Brand darkMode={darkMode} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto stylish-scrollbar space-y-3">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} darkMode={darkMode} />
        ))}

        {/* Admin */}
        {user && ["admin", "superadmin"].includes(user.role) && (
          <NavGroup
            group={{
              label: "Admin",
              defaultOpen: true,
              items: [
                { name: "User Management", path: "/admin/users", icon: Users },
              ],
            }}
            darkMode={darkMode}
          />
        )}
      </nav>

      {/* Footer */}
      <UserFooter darkMode={darkMode} onLogout={handleLogout} />
    </aside>
  );
}

// ── Mobile Slide-over Sidebar ────────────────────────────────────────────────
export function MobileSidebar({ darkMode, open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 z-[70] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-[#12121a]" : "bg-white"} shadow-2xl`}
      >
        {/* Orb */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div
          className={`relative flex items-center justify-between h-16 px-4 border-b ${darkMode ? "border-white/[0.06]" : "border-slate-200"}`}
        >
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
          {NAV_GROUPS.map((group) => (
            <NavGroup
              key={group.label}
              group={group}
              darkMode={darkMode}
              onItemClick={onClose}
            />
          ))}
          {user && ["admin", "superadmin"].includes(user.role) && (
            <NavGroup
              group={{
                label: "Admin",
                defaultOpen: true,
                items: [
                  {
                    name: "User Management",
                    path: "/admin/users",
                    icon: Users,
                  },
                ],
              }}
              darkMode={darkMode}
              onItemClick={onClose}
            />
          )}
        </nav>

        {/* Footer */}
        <UserFooter darkMode={darkMode} onLogout={handleLogout} />
      </aside>
    </>
  );
}

// ── Mobile Bottom Nav ────────────────────────────────────────────────────────
export function MobileBottomNav({ darkMode }) {
  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 flex lg:hidden border-t safe-area-pb ${
        darkMode
          ? "bg-[#12121a]/95 border-white/[0.06] backdrop-blur-xl"
          : "bg-white/95 border-slate-200 backdrop-blur-xl"
      }`}
    >
      {BOTTOM_ITEMS.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center py-2.5 gap-0.5 text-[9px] font-outfit font-bold uppercase tracking-wide transition-all ${
              isActive
                ? "text-indigo-500"
                : darkMode
                  ? "text-slate-600"
                  : "text-slate-400"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? darkMode
                      ? "bg-indigo-500/20 shadow-lg shadow-indigo-500/10"
                      : "bg-indigo-50 shadow-sm"
                    : ""
                }`}
              >
                <item.icon size={19} />
              </span>
              {item.name}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default DesktopSidebar;
