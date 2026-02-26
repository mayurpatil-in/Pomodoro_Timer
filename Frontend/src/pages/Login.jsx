import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Timer,
  Target,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Smart Pomodoro Timer",
    desc: "AI-powered focus sessions tailored to you",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set daily goals and crush every milestone",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Visualise your productivity trends over time",
  },
];

const trustBadges = [
  { icon: Shield, label: "End-to-End Encrypted" },
  { icon: Lock, label: "JWT Secured Auth" },
  { icon: CheckCircle, label: "HTTPS Only" },
];

export default function Login({ darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex w-full ${
        darkMode
          ? "bg-[#080c14] text-white"
          : "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 text-slate-900"
      }`}
    >
      {/* ── Left panel: branding ── */}
      <div
        className={`hidden lg:flex lg:w-[52%] relative flex-col items-start justify-between overflow-hidden p-12 ${
          darkMode
            ? "bg-gradient-to-br from-indigo-950/80 via-[#0d1528] to-purple-950/60"
            : "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700"
        }`}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 w-[380px] h-[380px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 right-8 w-[200px] h-[200px] rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        {/* Grid overlay texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
            <Timer size={20} className="text-white" />
          </div>
          <span className="font-inter font-bold text-xl text-white tracking-tight">
            FocusFlow
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-10">
          <div>
            <h1 className="font-inter font-extrabold text-4xl xl:text-5xl text-white leading-tight mb-4">
              Unlock your peak
              <br />
              <span className="text-indigo-200">productivity.</span>
            </h1>
            <p className="text-indigo-200/80 text-base font-outfit leading-relaxed max-w-md">
              Manage your time, crush your goals, and build lasting focus habits
              — all in one beautifully designed workspace.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-white/20">
                  <Icon size={18} className="text-indigo-200" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm text-white">
                    {title}
                  </p>
                  <p className="font-outfit text-xs text-indigo-200/70">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-100 text-xs font-outfit"
            >
              <Icon size={11} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 relative ${
          darkMode ? "bg-[#080c14]" : "bg-white/70 backdrop-blur-sm"
        }`}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-indigo-100 text-indigo-600"
            }`}
          >
            <Timer size={18} />
          </div>
          <span
            className={`font-inter font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            FocusFlow
          </span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-outfit font-medium mb-5 border ${
                darkMode
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              <Shield size={11} />
              Secure Sign-In Portal
            </div>
            <h2
              className={`font-inter font-extrabold text-3xl sm:text-4xl mb-2 leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Welcome back
            </h2>
            <p
              className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Sign in to continue to your focus workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="bg-red-500 w-1.5 h-1.5 rounded-full block" />
              </div>
              <p className="text-red-500 text-sm font-outfit font-medium">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email field */}
            <div>
              <label
                className={`block text-xs font-semibold tracking-widest uppercase mb-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-indigo-400"
                      : "text-slate-400 group-focus-within:text-indigo-600"
                  }`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all text-sm font-outfit ${
                    darkMode
                      ? "bg-white/[0.04] border-white/8 text-white placeholder-slate-600 focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`text-xs font-semibold tracking-widest uppercase ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  className={`text-xs font-outfit transition-colors ${
                    darkMode
                      ? "text-indigo-400 hover:text-indigo-300"
                      : "text-indigo-600 hover:text-indigo-500"
                  }`}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  size={16}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-indigo-400"
                      : "text-slate-400 group-focus-within:text-indigo-600"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl border outline-none transition-all text-sm font-outfit ${
                    darkMode
                      ? "bg-white/[0.04] border-white/8 text-white placeholder-slate-600 focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative mt-2 w-full py-3.5 rounded-xl font-inter font-bold text-sm text-white transition-all duration-200 overflow-hidden group ${
                isLoading
                  ? "bg-indigo-500/60 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.99]"
              }`}
            >
              <span
                className={`absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] ${
                  !isLoading
                    ? "group-hover:translate-x-[100%] transition-transform duration-700"
                    : ""
                }`}
              />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className={`flex-1 h-px ${darkMode ? "bg-white/8" : "bg-slate-200"}`}
            />
            <span
              className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
            >
              OR
            </span>
            <div
              className={`flex-1 h-px ${darkMode ? "bg-white/8" : "bg-slate-200"}`}
            />
          </div>

          {/* Register link */}
          <p
            className={`text-center text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`font-semibold transition-colors inline-flex items-center gap-1 ${
                darkMode
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-500"
              }`}
            >
              Create one free →
            </Link>
          </p>

          {/* Bottom trust note */}
          <div
            className={`mt-8 flex items-center justify-center gap-1.5 text-[11px] font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            <Lock size={10} />
            256-bit SSL encrypted · Your data is safe
          </div>
        </div>
      </div>

      {/* Subtle line separator between panels */}
      <div
        className={`hidden lg:block absolute left-[52%] top-0 bottom-0 w-px ${darkMode ? "bg-white/5" : "bg-slate-200/60"}`}
      />
    </div>
  );
}
