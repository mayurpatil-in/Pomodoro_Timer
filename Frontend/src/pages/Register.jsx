import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register({ darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[80vh] w-full px-4 ${darkMode ? "text-slate-100" : "text-slate-900"}`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl transition-colors duration-500 ${
          darkMode
            ? "bg-slate-900/60 border-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-white/80 border-black/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        }`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-inter mb-2">Create Account</h2>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Start tracking your productivity
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              className={`block text-xs font-semibold tracking-wide uppercase mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                darkMode
                  ? "bg-slate-800/50 border-white/10 focus:border-purple-500/50 text-white placeholder-slate-500"
                  : "bg-white border-black/10 focus:border-purple-500 text-slate-900 placeholder-slate-400"
              }`}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold tracking-wide uppercase mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                darkMode
                  ? "bg-slate-800/50 border-white/10 focus:border-purple-500/50 text-white placeholder-slate-500"
                  : "bg-white border-black/10 focus:border-purple-500 text-slate-900 placeholder-slate-400"
              }`}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-lg ${
              isLoading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-400 hover:shadow-purple-500/25 active:scale-[0.98]"
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p
          className={`mt-8 text-center text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-semibold transition-colors ${darkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-500"}`}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
