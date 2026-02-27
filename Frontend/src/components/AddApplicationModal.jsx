import React, { useState } from "react";
import {
  X,
  Building,
  Briefcase,
  IndianRupee,
  MapPin,
  Calendar,
  HelpCircle,
  Phone,
  Mail,
  Link,
  User,
  Lock,
  Globe,
  FileText,
  Users,
} from "lucide-react";

export default function AddApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  initialStage,
  initialData,
  darkMode,
}) {
  const STAGES = [
    "Applied",
    "HR Round",
    "Technical Round",
    "Final Round",
    "Offer",
    "Rejected",
  ];

  const [formData, setFormData] = useState({
    company_name: "",
    role: "",
    company_phone: "",
    company_email: "",
    expected_ctc: "",
    current_ctc: "",
    stage: initialStage || "Applied",
    applied_date: new Date().toISOString().split("T")[0],
    interview_date: "",
    location_type: "Remote",
    referral: "No",
    job_portal_url: "",
    job_portal_username: "",
    job_portal_password: "",
    application_source: "Company Website",
    resume_version: "",
    job_description: "",
    notes: "",
    questions: [],
    interviewers: [],
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [newInterviewer, setNewInterviewer] = useState({
    name: "",
    role: "",
    linkedin: "",
  });

  // Populate data when editing
  React.useEffect(() => {
    setIsAddingQuestion(false);
    setNewQuestionText("");
    setIsAddingInterviewer(false);
    setNewInterviewer({ name: "", role: "", linkedin: "" });

    if (initialData) {
      setFormData({
        ...initialData,
        applied_date: initialData.applied_date
          ? new Date(initialData.applied_date).toISOString().split("T")[0]
          : "",
        interview_date: initialData.interview_date
          ? new Date(initialData.interview_date).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        company_name: "",
        role: "",
        company_phone: "",
        company_email: "",
        expected_ctc: "",
        current_ctc: "",
        stage: initialStage || "Applied",
        applied_date: new Date().toISOString().split("T")[0],
        interview_date: "",
        location_type: "Remote",
        referral: "No",
        job_portal_url: "",
        job_portal_username: "",
        job_portal_password: "",
        application_source: "Company Website",
        resume_version: "",
        job_description: "",
        notes: "",
        questions: [],
        interviewers: [],
      });
    }
  }, [initialData, initialStage, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Simple handler for adding a question to the current round
  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      setFormData((prev) => ({
        ...prev,
        questions: [
          ...prev.questions,
          { round: prev.stage, text: newQuestionText.trim() },
        ],
      }));
      setNewQuestionText("");
      setIsAddingQuestion(false);
    }
  };

  const removeQuestion = (index) => {
    setFormData((prev) => {
      const qs = [...prev.questions];
      qs.splice(index, 1);
      return { ...prev, questions: qs };
    });
  };

  const handleAddInterviewer = () => {
    if (newInterviewer.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        interviewers: [...prev.interviewers, newInterviewer],
      }));
      setNewInterviewer({ name: "", role: "", linkedin: "" });
      setIsAddingInterviewer(false);
    }
  };

  const removeInterviewer = (index) => {
    setFormData((prev) => {
      const intvs = [...prev.interviewers];
      intvs.splice(index, 1);
      return { ...prev, interviewers: intvs };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset after submit
    setFormData({
      company_name: "",
      role: "",
      company_phone: "",
      company_email: "",
      expected_ctc: "",
      current_ctc: "",
      stage: "Applied",
      applied_date: new Date().toISOString().split("T")[0],
      interview_date: "",
      location_type: "Remote",
      referral: "No",
      job_portal_url: "",
      job_portal_username: "",
      job_portal_password: "",
      application_source: "Company Website",
      resume_version: "",
      job_description: "",
      notes: "",
      questions: [],
      interviewers: [],
    });
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm transition-all border outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
    darkMode
      ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
  }`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
    darkMode ? "text-slate-500" : "text-slate-400"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Expanded width for larger screen presence */}
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl transition-all scale-100 opacity-100 ${
          darkMode
            ? "bg-[#18181b] border border-white/10"
            : "bg-white border border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-white/10" : "border-slate-100"}`}
        >
          <h2
            className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {initialData ? "Edit Application" : "Add Application"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              darkMode
                ? "hover:bg-white/10 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form
            id="add-application-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Left Main Form (1 column) */}
            <div className="md:col-span-1 order-2 md:order-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <div className="relative">
                    <Building
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      required
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="e.g. Google"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Role *</label>
                  <div className="relative">
                    <Briefcase
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      required
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Frontend Engineer"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company Email</label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="email"
                      name="company_email"
                      value={formData.company_email}
                      onChange={handleChange}
                      placeholder="hr@company.com"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company Phone</label>
                  <div className="relative">
                    <Phone
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="tel"
                      name="company_phone"
                      value={formData.company_phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Expected CTC</label>
                  <div className="relative">
                    <IndianRupee
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      name="expected_ctc"
                      value={formData.expected_ctc}
                      onChange={handleChange}
                      placeholder="e.g. 25 LPA"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Current CTC</label>
                  <div className="relative">
                    <IndianRupee
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      name="current_ctc"
                      value={formData.current_ctc}
                      onChange={handleChange}
                      placeholder="e.g. 15 LPA"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Applied Date</label>
                  <div className="relative">
                    <Calendar
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="date"
                      name="applied_date"
                      value={formData.applied_date}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Interview Date</label>
                  <div className="relative">
                    <Calendar
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="date"
                      name="interview_date"
                      value={formData.interview_date}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Location Type</label>
                  <select
                    name="location_type"
                    value={formData.location_type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Referral</label>
                  <select
                    name="referral"
                    value={formData.referral}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Application Source</label>
                  <div className="relative">
                    <Globe
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <select
                      name="application_source"
                      value={formData.application_source}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 appearance-none`}
                    >
                      <option value="Company Website">Company Website</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Wellfound">Wellfound</option>
                      <option value="Referral">Referral</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Resume Version</label>
                  <div className="relative">
                    <FileText
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      name="resume_version"
                      value={formData.resume_version}
                      onChange={handleChange}
                      placeholder="e.g. Frontend v2.pdf"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Job Portal Credentials */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-200 dark:border-white/10 pt-5 mt-2">
                <div>
                  <label className={labelClass}>Job Portal Link</label>
                  <div className="relative">
                    <Link
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      name="job_portal_url"
                      value={formData.job_portal_url}
                      onChange={handleChange}
                      placeholder="https://careers..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Portal Username</label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      name="job_portal_username"
                      value={formData.job_portal_username}
                      onChange={handleChange}
                      placeholder="Username / Email"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Portal Password</label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      type="text"
                      name="job_portal_password"
                      value={formData.job_portal_password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className={labelClass}>Job Description</label>
                <textarea
                  name="job_description"
                  value={formData.job_description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Paste the Job Description (JD) here..."
                  className={`${inputClass} resize-y max-h-96`}
                />
              </div>
            </div>

            {/* Right Section: Interviewers, Questions & Notes (1 column) */}
            <div className="md:col-span-1 order-1 md:order-2 space-y-6 flex flex-col h-full">
              {/* Interviewers Section */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Interviewers ({formData.interviewers.length})
                  </label>
                  {!isAddingInterviewer && (
                    <button
                      type="button"
                      onClick={() => setIsAddingInterviewer(true)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      + Add Interviewer
                    </button>
                  )}
                </div>

                {isAddingInterviewer && (
                  <div
                    className={`p-3 mb-3 rounded-xl border flex flex-col gap-2 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Name (e.g. John Doe)"
                      value={newInterviewer.name}
                      onChange={(e) =>
                        setNewInterviewer((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Role (e.g. Senior Eng)"
                        value={newInterviewer.role}
                        onChange={(e) =>
                          setNewInterviewer((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="LinkedIn URL"
                        value={newInterviewer.linkedin}
                        onChange={(e) =>
                          setNewInterviewer((prev) => ({
                            ...prev,
                            linkedin: e.target.value,
                          }))
                        }
                        className={inputClass}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInterviewer();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingInterviewer(false);
                          setNewInterviewer({
                            name: "",
                            role: "",
                            linkedin: "",
                          });
                        }}
                        className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddInterviewer}
                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-600 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {formData.interviewers.length > 0 && (
                  <div
                    className={`p-3 rounded-xl border space-y-2 mb-2 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
                  >
                    {formData.interviewers.map((intv, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start justify-between p-2 rounded-lg text-sm ${darkMode ? "bg-[#18181b]" : "bg-white shadow-sm"}`}
                      >
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span
                            className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                          >
                            {intv.name}
                          </span>
                          <span
                            className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                          >
                            {intv.role || "No role"}{" "}
                            {intv.linkedin && (
                              <a
                                href={intv.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 ml-1 hover:underline"
                              >
                                LinkedIn
                              </a>
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInterviewer(idx)}
                          className="text-rose-500 hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Questions Section */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Interview Questions ({formData.questions.length})
                  </label>
                  {!isAddingQuestion && (
                    <button
                      type="button"
                      onClick={() => setIsAddingQuestion(true)}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      + Add Question
                    </button>
                  )}
                </div>

                {isAddingQuestion && (
                  <div
                    className={`p-3 mb-3 rounded-xl border flex gap-2 items-center ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Enter the interview question..."
                      className={inputClass}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddQuestion();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingQuestion(false);
                        setNewQuestionText("");
                      }}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {formData.questions.length > 0 && (
                  <div
                    className={`p-3 rounded-xl border space-y-2 mb-2 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
                  >
                    {formData.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start justify-between p-2 rounded-lg text-sm ${darkMode ? "bg-[#18181b]" : "bg-white shadow-sm"}`}
                      >
                        <div className="flex-1 min-w-0 flex items-start">
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded mr-2 mt-0.5">
                            {q.round}
                          </span>
                          <span
                            className={`break-words break-all pt-0.5 ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            {q.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-rose-500 hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any additional information..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-5 border-t flex justify-end gap-3 ${darkMode ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              darkMode
                ? "bg-white/5 hover:bg-white/10 text-white"
                : "bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-application-form"
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-95"
          >
            {initialData ? "Update Application" : "Save Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
