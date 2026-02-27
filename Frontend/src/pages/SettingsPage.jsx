import { useState } from "react";
import { useSettings, DEFAULT_SETTINGS } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import {
  Settings2,
  RotateCcw,
  Save,
  KeyRound,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function DurationSlider({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = "min",
  onChange,
  darkMode,
  accent,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        darkMode
          ? "bg-slate-900/40 border-white/5"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p
            className={`font-semibold font-inter text-sm ${darkMode ? "text-white" : "text-slate-800"}`}
          >
            {label}
          </p>
          <p
            className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {description}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold tabular-nums text-sm ${accent} ${
            darkMode
              ? "bg-slate-800/80 border-white/10"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          {value}
          <span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500 cursor-pointer h-2 rounded-full"
      />
      <div className="flex justify-between mt-1.5">
        <span
          className={`text-[10px] font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          {min}
          {unit}
        </span>
        <span
          className={`text-[10px] font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange, darkMode }) {
  return (
    <div
      className={`flex items-center justify-between p-5 rounded-2xl border ${
        darkMode
          ? "bg-slate-900/40 border-white/5"
          : "bg-white border-slate-100 shadow-sm"
      }`}
    >
      <div>
        <p
          className={`font-semibold font-inter text-sm ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          {label}
        </p>
        <p
          className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
        >
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
          value ? "bg-indigo-500" : darkMode ? "bg-slate-700" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage({ darkMode }) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { updatePassword } = useAuth();

  // Local draft state — only saves when user clicks Save
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState({
    type: "",
    message: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_SETTINGS });
    resetSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
              darkMode
                ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
                : "bg-indigo-100 text-indigo-600"
            }`}
          >
            <Settings2 size={22} />
          </div>
          <div>
            <h2
              className={`text-2xl font-bold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Settings
            </h2>
            <p
              className={`text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Customize your focus sessions
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-outfit transition-all border ${
              darkMode
                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium font-outfit text-white transition-all shadow-md ${
              saved
                ? "bg-emerald-500 shadow-emerald-500/20"
                : isDirty
                  ? "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20"
                  : "bg-indigo-500/50 cursor-not-allowed"
            }`}
            disabled={!isDirty && !saved}
          >
            <Save size={14} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Timer Durations */}
        <div className="flex flex-col gap-6">
          <div>
            <p
              className={`px-1 mb-3 text-xs font-semibold tracking-wider uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Timer Durations
            </p>
            <div className="flex flex-col gap-3">
              <DurationSlider
                label="Focus Session"
                description="Duration of each Pomodoro work block"
                value={draft.focusDuration}
                min={5}
                max={90}
                step={5}
                unit=" min"
                onChange={(v) => setDraft((d) => ({ ...d, focusDuration: v }))}
                darkMode={darkMode}
                accent="text-indigo-500"
              />
              <DurationSlider
                label="Short Break"
                description="Duration of breaks between Pomodoros"
                value={draft.shortBreak}
                min={1}
                max={30}
                step={1}
                unit=" min"
                onChange={(v) => setDraft((d) => ({ ...d, shortBreak: v }))}
                darkMode={darkMode}
                accent="text-emerald-500"
              />
              <DurationSlider
                label="Long Break"
                description="Duration after every 4th Pomodoro"
                value={draft.longBreak}
                min={5}
                max={60}
                step={5}
                unit=" min"
                onChange={(v) => setDraft((d) => ({ ...d, longBreak: v }))}
                darkMode={darkMode}
                accent="text-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Automation & Security */}
        <div className="flex flex-col gap-6">
          {/* Auto-start section */}
          <div>
            <p
              className={`px-1 mb-3 text-xs font-semibold tracking-wider uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Automation
            </p>
            <div className="flex flex-col gap-3">
              <ToggleSetting
                label="Auto-start Breaks"
                description="Automatically begin break timer when a Pomodoro ends"
                value={draft.autoStartBreaks}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, autoStartBreaks: v }))
                }
                darkMode={darkMode}
              />
              <ToggleSetting
                label="Auto-start Pomodoros"
                description="Automatically begin next Pomodoro when a break ends"
                value={draft.autoStartPomodoros}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, autoStartPomodoros: v }))
                }
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* Security Section (Password Update) */}
          <div>
            <p
              className={`px-1 mb-3 text-xs font-semibold tracking-wider uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Security
            </p>
            <div
              className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
                >
                  <KeyRound size={18} />
                </div>
                <div>
                  <p
                    className={`font-semibold font-inter text-sm ${darkMode ? "text-white" : "text-slate-800"}`}
                  >
                    Change Password
                  </p>
                  <p
                    className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Update your account password securely
                  </p>
                </div>
              </div>

              {passwordStatus.message && (
                <div
                  className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                    passwordStatus.type === "success"
                      ? darkMode
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : darkMode
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {passwordStatus.type === "success" ? (
                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  )}
                  {passwordStatus.message}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    setPasswordStatus({
                      type: "error",
                      message: "New passwords do not match.",
                    });
                    return;
                  }
                  if (newPassword.length < 6) {
                    setPasswordStatus({
                      type: "error",
                      message: "New password must be at least 6 characters.",
                    });
                    return;
                  }

                  setIsUpdatingPassword(true);
                  try {
                    await updatePassword(currentPassword, newPassword);
                    setPasswordStatus({
                      type: "success",
                      message: "Password updated successfully!",
                    });
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err) {
                    setPasswordStatus({
                      type: "error",
                      message:
                        err.response?.data?.error ||
                        "Failed to update password. Please check your current password.",
                    });
                  } finally {
                    setIsUpdatingPassword(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500 placeholder:text-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 placeholder:text-slate-400"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500 placeholder:text-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 placeholder:text-slate-400"
                    }`}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500 placeholder:text-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 placeholder:text-slate-400"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    isUpdatingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors mt-2 ${
                    isUpdatingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                      ? darkMode
                        ? "bg-white/5 text-slate-500"
                        : "bg-slate-100 text-slate-400"
                      : darkMode
                        ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  {isUpdatingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div
        className={`rounded-2xl border p-5 text-sm font-outfit ${
          darkMode
            ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-300/70"
            : "bg-indigo-50 border-indigo-100 text-indigo-700/70"
        }`}
      >
        💡 <strong>Tip:</strong> Changes take effect immediately. The timer will
        reset to the new duration when you save.
      </div>
    </div>
  );
}
