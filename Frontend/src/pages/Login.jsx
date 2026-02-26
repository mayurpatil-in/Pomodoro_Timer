import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        err.response?.data?.error ||
          "Failed to login. Please check your credentials.",
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
          <h2 className="text-3xl font-bold font-inter mb-2">Welcome Back</h2>
          <p
            className={`text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Sign in to sync your focus sessions
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
                  ? "bg-slate-800/50 border-white/10 focus:border-blue-500/50 text-white placeholder-slate-500"
                  : "bg-white border-black/10 focus:border-blue-500 text-slate-900 placeholder-slate-400"
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
                  ? "bg-slate-800/50 border-white/10 focus:border-blue-500/50 text-white placeholder-slate-500"
                  : "bg-white border-black/10 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white transition-all shadow-lg ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-400 hover:shadow-blue-500/25 active:scale-[0.98]"
            }`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p
          className={`mt-8 text-center text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className={`font-semibold transition-colors ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
