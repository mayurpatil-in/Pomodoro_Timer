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
  User,
  Sparkles,
} from "lucide-react";

const perks = [
  {
    icon: Timer,
    title: "Pomodoro Timer",
    desc: "Engineered focus sessions with adaptive breaks",
  },
  {
    icon: Target,
    title: "Daily Routine Builder",
    desc: "Design and stick to your perfect day",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Every session tracked, visualised, and improved",
  },
];

const trustBadges = [
  { icon: Shield, label: "Secure Signup" },
  { icon: Lock, label: "Encrypted Storage" },
  { icon: CheckCircle, label: "No spam, ever" },
];

const passwordRequirements = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
  { label: "Contains a letter", test: (p) => /[a-zA-Z]/.test(p) },
];

export default function Register({ darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to register. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = passwordRequirements.filter(({ test }) =>
    test(password),
  ).length;
  const strengthColor =
    passwordStrength === 3
      ? "bg-emerald-500"
      : passwordStrength === 2
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={`min-h-screen flex w-full ${
        darkMode
          ? "bg-[#080c14] text-white"
          : "bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 text-slate-900"
      }`}
    >
      {/* ── Left panel: branding ── */}
      <div
        className={`hidden lg:flex lg:w-[52%] relative flex-col items-start justify-between overflow-hidden p-12 ${
          darkMode
            ? "bg-gradient-to-br from-purple-950/80 via-[#0d1528] to-indigo-950/60"
            : "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700"
        }`}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-16 w-[180px] h-[180px] rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />

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
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-purple-200" />
              <span className="text-purple-200 text-sm font-outfit font-medium">
                Join thousands of focused minds
              </span>
            </div>
            <h1 className="font-inter font-extrabold text-4xl xl:text-5xl text-white leading-tight mb-4">
              Start your best
              <br />
              <span className="text-purple-200">chapter today.</span>
            </h1>
            <p className="text-purple-200/80 text-base font-outfit leading-relaxed max-w-md">
              Every elite performer has a system. FocusFlow is yours — built for
              serious achievers who refuse to settle for average.
            </p>
          </div>

          {/* Perks */}
          <div className="flex flex-col gap-4">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-white/20">
                  <Icon size={18} className="text-purple-200" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm text-white">
                    {title}
                  </p>
                  <p className="font-outfit text-xs text-purple-200/70">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-purple-100 text-xs font-outfit"
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
                ? "bg-purple-500/20 text-purple-400"
                : "bg-purple-100 text-purple-600"
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
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  : "bg-purple-50 border-purple-200 text-purple-700"
              }`}
            >
              <Sparkles size={11} />
              Free forever · No credit card
            </div>
            <h2
              className={`font-inter font-extrabold text-3xl sm:text-4xl mb-2 leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Create account
            </h2>
            <p
              className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Set up in under 30 seconds, no card required
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
            {/* Email */}
            <div>
              <label
                className={`block text-xs font-semibold tracking-widest uppercase mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-purple-400"
                      : "text-slate-400 group-focus-within:text-purple-600"
                  }`}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all text-sm font-outfit ${
                    darkMode
                      ? "bg-white/[0.04] border-white/8 text-white placeholder-slate-600 focus:border-purple-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-500/10"
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className={`block text-xs font-semibold tracking-widest uppercase mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    darkMode
                      ? "text-slate-500 group-focus-within:text-purple-400"
                      : "text-slate-400 group-focus-within:text-purple-600"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl border outline-none transition-all text-sm font-outfit ${
                    darkMode
                      ? "bg-white/[0.04] border-white/8 text-white placeholder-slate-600 focus:border-purple-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-500/10"
                  }`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={6}
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

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength
                            ? strengthColor
                            : darkMode
                              ? "bg-white/10"
                              : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {passwordRequirements.map(({ label, test }) => (
                      <span
                        key={label}
                        className={`flex items-center gap-1 text-[10px] font-outfit transition-colors ${
                          test(password)
                            ? darkMode
                              ? "text-emerald-400"
                              : "text-emerald-600"
                            : darkMode
                              ? "text-slate-600"
                              : "text-slate-400"
                        }`}
                      >
                        <CheckCircle
                          size={9}
                          className={
                            test(password) ? "opacity-100" : "opacity-30"
                          }
                        />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create account button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative mt-2 w-full py-3.5 rounded-xl font-inter font-bold text-sm text-white transition-all duration-200 overflow-hidden group ${
                isLoading
                  ? "bg-purple-500/60 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.99]"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight size={15} />
                  </>
                )}
              </span>
            </button>

            {/* Terms */}
            <p
              className={`text-center text-[10px] font-outfit leading-relaxed ${darkMode ? "text-slate-600" : "text-slate-400"}`}
            >
              By creating an account, you agree to our{" "}
              <span
                className={
                  darkMode
                    ? "text-slate-400 cursor-pointer hover:text-white"
                    : "text-slate-600 cursor-pointer hover:underline"
                }
              >
                Terms of Service
              </span>{" "}
              and{" "}
              <span
                className={
                  darkMode
                    ? "text-slate-400 cursor-pointer hover:text-white"
                    : "text-slate-600 cursor-pointer hover:underline"
                }
              >
                Privacy Policy
              </span>
            </p>
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

          {/* Login link */}
          <p
            className={`text-center text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-semibold transition-colors ${
                darkMode
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-500"
              }`}
            >
              Sign in →
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
    </div>
  );
}
