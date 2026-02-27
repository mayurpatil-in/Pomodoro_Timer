import React from "react";
import { X, AlertCircle, Info, HelpCircle } from "lucide-react";

const CustomConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "delete", // "delete" | "info" | "confirm"
  darkMode,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "delete":
        return {
          icon: <AlertCircle className="text-rose-500" size={24} />,
          button:
            "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/25 hover:shadow-rose-500/40",
          iconBg: "bg-rose-500/10",
        };
      case "info":
        return {
          icon: <Info className="text-blue-500" size={24} />,
          button:
            "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40",
          iconBg: "bg-blue-500/10",
        };
      default:
        return {
          icon: <HelpCircle className="text-amber-500" size={24} />,
          button:
            "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25 hover:shadow-amber-500/40",
          iconBg: "bg-amber-500/10",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl transition-all transform animate-in zoom-in-95 duration-200 border ${
          darkMode
            ? "bg-[#1c1c2e] border-white/10 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={`text-xl font-black tracking-tight mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                {title}
              </h2>
              <p
                className={`text-sm font-medium leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-white/5 text-slate-500"
                  : "hover:bg-slate-100 text-slate-400"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                darkMode
                  ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.03] active:scale-95 shadow-lg ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirmModal;
