import React, { useState, useEffect } from "react";
import { X, MessageSquare, Plus, Check } from "lucide-react";

export default function InterviewQuestionsModal({
  isOpen,
  onClose,
  application,
  onSaveQuestions,
  darkMode,
}) {
  const STAGES = [
    { id: "Applied", label: "Applied", color: "indigo" },
    { id: "HR Round", label: "HR Round", color: "blue" },
    { id: "Technical Round", label: "Technical", color: "purple" },
    { id: "Final Round", label: "Final", color: "amber" },
    { id: "Offer", label: "Offer", color: "emerald" },
  ];

  const [questions, setQuestions] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionRound, setNewQuestionRound] = useState("Technical Round");

  useEffect(() => {
    if (isOpen && application) {
      setQuestions(application.questions || []);
      setIsAdding(false);
      setNewQuestionText("");
      setNewQuestionRound(application.stage || "Technical Round");
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      const newQuestion = {
        round: newQuestionRound,
        text: newQuestionText.trim(),
      };

      const newQuestionsList = [...questions, newQuestion];
      setQuestions(newQuestionsList);
      onSaveQuestions(application.id, newQuestionsList);

      setNewQuestionText("");
      setIsAdding(false);
    }
  };

  const handleDeleteQuestion = (index) => {
    const newQuestionsList = [...questions];
    newQuestionsList.splice(index, 1);
    setQuestions(newQuestionsList);
    onSaveQuestions(application.id, newQuestionsList);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
    darkMode
      ? "bg-[#18181b]/50 border-white/10 text-white placeholder-slate-600 hover:bg-[#18181b]"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white"
  }`;

  // Group questions by Round using STAGES order
  const groupedQuestions = STAGES.map((s) => ({
    stage: s,
    items: questions
      .map((q, i) => ({ ...q, originalIndex: i }))
      .filter((q) => q.round === s.id),
  })).filter((group) => group.items.length > 0);

  // Collect any remaining orphans (edge cases where round is changed/deleted)
  const orphans = questions
    .map((q, i) => ({ ...q, originalIndex: i }))
    .filter((q) => !STAGES.some((s) => s.id === q.round));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
          darkMode
            ? "bg-[#13131a] border-white/10"
            : "bg-slate-50 border-slate-200"
        } border`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 z-10 ${
            darkMode
              ? "border-white/10 bg-[#18181b]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/20">
              <MessageSquare className="size-6 text-indigo-400 fill-indigo-500/20" />
            </div>
            <div>
              <h2
                className={`text-lg font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Interview Questions
              </h2>
              <p
                className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {application.role} @{" "}
                <strong
                  className={darkMode ? "text-slate-300" : "text-slate-700"}
                >
                  {application.company_name}
                </strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-white/10 text-slate-400"
                : "hover:bg-slate-100 text-slate-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <h3
              className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Question Bank ({questions.length})
            </h3>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-indigo-500/20"
              >
                <Plus size={14} /> Add New
              </button>
            )}
          </div>

          {/* Add Question Form - Elevated Card */}
          {isAdding && (
            <div
              className={`p-5 rounded-2xl border shadow-lg animate-in fade-in slide-in-from-top-2 ${
                darkMode
                  ? "bg-[#1f1f26] border-indigo-500/30 shadow-indigo-500/10"
                  : "bg-white border-indigo-200 shadow-indigo-500/5 ring-1 ring-indigo-500/10"
              }`}
            >
              <div className="mb-4">
                <label
                  className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Round Focus
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewQuestionRound(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        newQuestionRound === s.id
                          ? `bg-${s.color}-500 text-white border-${s.color}-500 shadow-md shadow-${s.color}-500/20`
                          : darkMode
                            ? "bg-[#18181b] border-white/10 text-slate-400 hover:border-white/30"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Question Text
                </label>
                <textarea
                  autoFocus
                  rows="3"
                  placeholder="e.g. Explain how the virtual DOM works in React."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className={`${inputClass} resize-y !bg-transparent`}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleAddQuestion())
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setIsAdding(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${darkMode ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestionText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 disabled:bg-indigo-500/50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-500/20"
                >
                  <Check size={14} /> Save Question
                </button>
              </div>
            </div>
          )}

          {/* List of Questions */}
          {questions.length === 0 && !isAdding ? (
            <div
              className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-slate-300 bg-slate-50/50"}`}
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                <div className="relative p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <MessageSquare className="size-10 text-indigo-500" />
                </div>
              </div>
              <h4
                className={`text-base font-black mb-2 tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                No Questions Logged
              </h4>
              <p
                className={`text-sm max-w-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Build your personal interview question bank. Log the actual
                questions you are asked to study up for your next round.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 active:scale-95 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 text-sm font-bold rounded-xl transition-all"
              >
                Add Your First Question
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Grouped Rendering */}
              {groupedQuestions.map((group) => (
                <div key={group.stage.id} className="relative">
                  {/* Round Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border bg-${group.stage.color}-500/10 border-${group.stage.color}-500/20`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full bg-${group.stage.color}-500`}
                      />
                    </div>
                    <h4
                      className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      {group.stage.label}
                    </h4>
                    <div
                      className={`flex-1 h-px ${darkMode ? "bg-white/5" : "bg-slate-200"}`}
                    />
                  </div>

                  {/* Round Questions list */}
                  <div className="ml-4 space-y-3 border-l-2 border-indigo-500/10 pl-6 py-1">
                    {group.items.map((q) => (
                      <div
                        key={q.originalIndex}
                        className={`group relative p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"} transition-all`}
                      >
                        <p
                          className={`text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                        >
                          {q.text}
                        </p>
                        <button
                          onClick={() => handleDeleteQuestion(q.originalIndex)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${darkMode ? "text-slate-500 hover:bg-rose-500/20 hover:text-rose-400" : "text-slate-400 hover:bg-rose-50 hover:text-rose-500"}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Orphans (Just in case) */}
              {orphans.length > 0 && (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border bg-slate-500/10 border-slate-500/20`}
                    >
                      <div className={`w-2 h-2 rounded-full bg-slate-500`} />
                    </div>
                    <h4
                      className={`font-bold text-sm ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      Other Questions
                    </h4>
                    <div
                      className={`flex-1 h-px ${darkMode ? "bg-white/5" : "bg-slate-200"}`}
                    />
                  </div>
                  <div className="ml-4 space-y-3 border-l-2 border-slate-500/10 pl-6 py-1">
                    {orphans.map((q) => (
                      <div
                        key={q.originalIndex}
                        className={`group relative p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"} transition-all`}
                      >
                        <p
                          className={`text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                        >
                          {q.text}
                        </p>
                        <button
                          onClick={() => handleDeleteQuestion(q.originalIndex)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${darkMode ? "text-slate-500 hover:bg-rose-500/20 hover:text-rose-400" : "text-slate-400 hover:bg-rose-50 hover:text-rose-500"}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
