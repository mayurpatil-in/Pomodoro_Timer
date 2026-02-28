import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  Search,
  Sparkles,
  CreditCard,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

// Formatter for INR
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

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
    "/money": "Money Tracker",
  };
  return map[pathname] ?? "PomoFocus";
}

export default function Header({ darkMode, setDarkMode, onMenuClick }) {
  const { user, logout, api, notificationRefreshTrigger } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popupRef = useRef(null);

  // Get time of day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Fetch notifications data
  useEffect(() => {
    if (user && api) {
      // Use local ISO date for the dashboard summary
      const localDate = new Date().toISOString().split("T")[0];
      api
        .get(`/dashboard/summary?local_iso_date=${localDate}`)
        .then((res) => {
          const upcomingBills = res.data.upcoming_bills || [];
          const now = new Date();

          const newNotifs = upcomingBills.map((bill) => {
            // Calculate a display date
            const dueDate = new Date();
            dueDate.setDate(now.getDate() + bill.daysLeft);
            const monthStr = dueDate.toLocaleString("default", {
              month: "short",
            });

            return {
              id: `cc-${bill.id}`,
              type: "credit_card_bill",
              title: "Credit Card Bill",
              message: `Your ${bill.name} bill is due in ${bill.daysLeft} day(s).`,
              amount: bill.used,
              date: `${bill.due_date} ${monthStr}`,
            };
          });

          setNotifications(newNotifs);
        })
        .catch(console.error);
    }
  }, [user, api, notificationRefreshTrigger]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

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
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2.5 rounded-xl transition-all duration-300 border ${
              darkMode
                ? "bg-slate-800/80 border-white/8 text-slate-400 hover:text-white hover:bg-slate-700"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm"
            }`}
            title="Notifications"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 shadow shadow-rose-500/50 animate-pulse border-white dark:border-[#12121a]" />
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationsOpen && (
            <div
              className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl shadow-2xl border overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200 ${darkMode ? "bg-[#181824]/95 backdrop-blur-xl border-white/10 shadow-black/50" : "bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50"}`}
            >
              {/* Header */}
              <div
                className={`px-5 py-4 border-b flex items-center justify-between ${darkMode ? "border-white/10" : "border-slate-100"}`}
              >
                <h3
                  className={`font-black font-inter text-lg ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Notifications
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                >
                  {notifications.length} New
                </span>
              </div>

              {/* Body */}
              <div className="max-h-[60vh] overflow-y-auto w-full p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center py-12 px-4 text-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
                    >
                      <Bell size={24} className="opacity-50" />
                    </div>
                    <p className="font-semibold font-inter">All caught up!</p>
                    <p className="text-sm font-outfit mt-1 opacity-80">
                      You have no new notifications.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`group flex gap-3 p-3 rounded-2xl transition-all cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/finances");
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner ${notif.type === "credit_card_bill" ? (darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600") : ""}`}
                      >
                        {notif.type === "credit_card_bill" ? (
                          <CreditCard size={18} strokeWidth={2.5} />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-0.5">
                          <p
                            className={`text-sm font-bold font-inter truncate pr-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                          >
                            {notif.title}
                          </p>
                          {notif.date && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap pt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {notif.date}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-outfit leading-snug line-clamp-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {notif.message}
                          {notif.amount && (
                            <span
                              className={`font-black ml-1 ${notif.type === "credit_card_bill" ? "text-rose-500" : ""}`}
                            >
                              {formatINR(notif.amount)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div
                  className={`p-2 border-t mt-1 ${darkMode ? "border-white/10" : "border-slate-100"}`}
                >
                  <button
                    onClick={() => setNotifications([])}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${darkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
