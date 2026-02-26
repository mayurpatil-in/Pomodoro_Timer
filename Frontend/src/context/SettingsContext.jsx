import { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  focusDuration: 25, // minutes
  shortBreak: 5, // minutes
  longBreak: 15, // minutes
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem("pomofocusSettings");
    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem("pomofocusSettings", JSON.stringify(merged));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("pomofocusSettings", JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
export { DEFAULT_SETTINGS };
