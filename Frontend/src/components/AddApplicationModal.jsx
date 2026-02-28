import React, { useState } from "react";
import {
  X,
  Building,
  Briefcase,
  IndianRupee,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Link,
  User,
  Lock,
  Globe,
  FileText,
  AlertCircle,
  Plus,
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
    { id: "Applied", label: "Applied", color: "indigo" },
    { id: "HR Round", label: "HR Round", color: "blue" },
    { id: "Technical Round", label: "Technical", color: "purple" },
    { id: "Final Round", label: "Final", color: "amber" },
    { id: "Offer", label: "Offer", color: "emerald" },
    { id: "Rejected", label: "Rejected", color: "rose" },
  ];

  const PRIORITIES = [
    {
      id: "High",
      label: "High",
      dot: "bg-rose-500",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10 text-rose-500",
    },
    {
      id: "Medium",
      label: "Medium",
      dot: "bg-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10 text-amber-500",
    },
    {
      id: "Low",
      label: "Low",
      dot: "bg-emerald-500",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const [formData, setFormData] = useState({
    company_name: "",
    role: "",
    company_phone: "",
    company_email: "",
    expected_ctc: "",
    current_ctc: "",
    priority: "Medium",
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
    interviewers: [],
  });

  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [newInterviewer, setNewInterviewer] = useState({
    name: "",
    role: "",
    linkedin: "",
  });

  React.useEffect(() => {
    setIsAddingInterviewer(false);
    setNewInterviewer({ name: "", role: "", linkedin: "" });

    if (initialData) {
      setFormData({
        company_name: initialData.company_name || "",
        role: initialData.role || "",
        company_phone: initialData.company_phone || "",
        company_email: initialData.company_email || "",
        expected_ctc: initialData.expected_ctc || "",
        current_ctc: initialData.current_ctc || "",
        priority: initialData.priority || "Medium",
        stage: initialData.stage || initialStage || "Applied",
        location_type: initialData.location_type || "Remote",
        referral: initialData.referral || "No",
        application_source: initialData.application_source || "Company Website",
        job_portal_url: initialData.job_portal_url || "",
        job_portal_username: initialData.job_portal_username || "",
        job_portal_password: initialData.job_portal_password || "",
        resume_version: initialData.resume_version || "",
        job_description: initialData.job_description || "",
        notes: initialData.notes || "",
        interviewers: initialData.interviewers || [],
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
        priority: "Medium",
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
        interviewers: [],
      });
    }
  }, [initialData, initialStage, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePillSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm transition-all border outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
    darkMode
      ? "bg-[#18181b]/50 border-white/10 text-white placeholder-slate-600 hover:bg-[#18181b]"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:bg-white"
  }`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${
    darkMode ? "text-slate-400" : "text-slate-500"
  }`;

  const sectionClass = `p-6 rounded-2xl border ${
    darkMode
      ? "bg-white/[0.02] border-white/5"
      : "bg-white border-slate-100 shadow-sm"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
          darkMode
            ? "bg-[#13131a] border-white/10"
            : "bg-slate-50 border-slate-200"
        } border`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${
            darkMode
              ? "border-white/10 bg-[#18181b]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              {initialData ? "Edit Application" : "New Application"}
            </h2>
            <p
              className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {initialData
                ? "Update the details of this job hunt."
                : "Track a new job opportunity."}
            </p>
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
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <form
            id="add-application-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* 1. Core Details */}
            <div className={sectionClass}>
              <h3
                className={`text-sm font-black mb-5 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Building size={14} />
                </div>
                Core Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <div className="relative">
                    <Building
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
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
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <input
                      required
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Senior Frontend Engineer"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Company Email</label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
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
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stage Pills */}
                <div>
                  <label className={labelClass}>Pipeline Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => {
                      const isActive = formData.stage === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handlePillSelect("stage", s.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isActive
                              ? `bg-${s.color}-500 text-white border-${s.color}-500 shadow-md shadow-${s.color}-500/20`
                              : darkMode
                                ? "bg-[#18181b] border-white/10 text-slate-400 hover:border-white/30"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Pills */}
                <div>
                  <label className={labelClass}>Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => {
                      const isActive = formData.priority === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePillSelect("priority", p.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isActive
                              ? `${p.bg} ${p.border} shadow-sm`
                              : darkMode
                                ? "bg-[#18181b] border-white/10 text-slate-400 hover:border-white/30"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${p.dot}`}
                          />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Key Information grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compensation & Dates */}
              <div className={sectionClass}>
                <h3
                  className={`text-sm font-black mb-5 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <IndianRupee size={14} />
                  </div>
                  Logistics & Comp
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Expected CTC</label>
                    <input
                      name="expected_ctc"
                      value={formData.expected_ctc}
                      onChange={handleChange}
                      placeholder="e.g. 25 LPA"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Current CTC</label>
                    <input
                      name="current_ctc"
                      value={formData.current_ctc}
                      onChange={handleChange}
                      placeholder="e.g. 15 LPA"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Applied Date</label>
                    <input
                      type="date"
                      name="applied_date"
                      value={formData.applied_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Interview Date</label>
                    <input
                      type="date"
                      name="interview_date"
                      value={formData.interview_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Work Mode</label>
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
                    <label className={labelClass}>Referral?</label>
                    <div className="flex gap-2 mt-1">
                      {["No", "Yes"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handlePillSelect("referral", opt)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            formData.referral === opt
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                              : darkMode
                                ? "bg-white/5 border-white/5 text-slate-400"
                                : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts & Portals */}
              <div className={sectionClass}>
                <h3
                  className={`text-sm font-black mb-5 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Globe size={14} />
                  </div>
                  Sourcing & Contact
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Source</label>
                      <select
                        name="application_source"
                        value={formData.application_source}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="Company Website">Company Website</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Wellfound">Wellfound</option>
                        <option value="Referral">Referral</option>
                        <option value="Recruiter">Recruiter</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Resume Ver.</label>
                      <input
                        name="resume_version"
                        value={formData.resume_version}
                        onChange={handleChange}
                        placeholder="Frontend v2"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest text-indigo-500`}
                    >
                      Portal Credentials
                    </p>
                    <input
                      name="job_portal_url"
                      value={formData.job_portal_url}
                      onChange={handleChange}
                      placeholder="Portal URL"
                      className={`${inputClass} !py-2`}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="job_portal_username"
                        value={formData.job_portal_username}
                        onChange={handleChange}
                        placeholder="Username"
                        className={`${inputClass} !py-2`}
                      />
                      <input
                        type="text"
                        name="job_portal_password"
                        value={formData.job_portal_password}
                        onChange={handleChange}
                        placeholder="Password"
                        className={`${inputClass} !py-2`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Deep Details (JD, Interviewers, Questions) */}
            <div className={sectionClass}>
              <h3
                className={`text-sm font-black mb-5 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                  <FileText size={14} />
                </div>
                Extensive Details
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Job Description</label>
                    <textarea
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Paste the JD here..."
                      className={`${inputClass} resize-y bg-transparent`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Private Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Red flags, personal thoughts..."
                      className={`${inputClass} resize-y bg-transparent`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Interviewers List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`${labelClass} !mb-0`}>
                        Interviewers ({formData.interviewers.length})
                      </label>
                      {!isAddingInterviewer && (
                        <button
                          type="button"
                          onClick={() => setIsAddingInterviewer(true)}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/10"
                        >
                          <Plus size={12} /> Add
                        </button>
                      )}
                    </div>

                    {isAddingInterviewer && (
                      <div
                        className={`p-3 rounded-xl border mb-3 space-y-2 ${darkMode ? "bg-[#18181b] border-indigo-500/30 ring-1 ring-indigo-500/20" : "bg-indigo-50/50 border-indigo-200"}`}
                      >
                        <input
                          autoFocus
                          placeholder="Name *"
                          value={newInterviewer.name}
                          onChange={(e) =>
                            setNewInterviewer((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          className={`${inputClass} !py-2`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Role"
                            value={newInterviewer.role}
                            onChange={(e) =>
                              setNewInterviewer((p) => ({
                                ...p,
                                role: e.target.value,
                              }))
                            }
                            className={`${inputClass} !py-2`}
                          />
                          <input
                            placeholder="LinkedIn URL"
                            value={newInterviewer.linkedin}
                            onChange={(e) =>
                              setNewInterviewer((p) => ({
                                ...p,
                                linkedin: e.target.value,
                              }))
                            }
                            className={`${inputClass} !py-2`}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddInterviewer())
                            }
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingInterviewer(false)}
                            className="px-3 py-1.5 text-[11px] font-bold text-slate-500 line-through decoration-transparent hover:decoration-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddInterviewer}
                            className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-[11px] font-bold shadow-md"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.interviewers.length === 0 &&
                    !isAddingInterviewer ? (
                      <div
                        className={`p-4 rounded-xl border border-dashed text-center ${darkMode ? "border-white/10 text-slate-500" : "border-slate-300 text-slate-500"}`}
                      >
                        <p className="text-xs">No interviewers added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.interviewers.map((intv, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
                          >
                            <div>
                              <p
                                className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-800"}`}
                              >
                                {intv.name}
                              </p>
                              <span
                                className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                              >
                                {intv.role || "No role"}{" "}
                                {intv.linkedin && (
                                  <a
                                    href={intv.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:underline ml-1"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInterviewer(i)}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className={`shrink-0 px-6 py-4 border-t flex justify-end gap-3 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] ${
            darkMode
              ? "border-white/10 bg-[#18181b]"
              : "border-slate-200 bg-white"
          }`}
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
            {initialData ? "Save Changes" : "Track Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
