import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import { LayoutDashboard, FileSpreadsheet, Users, BarChart3, History, Building2, Plus, Vote, Sparkles, CheckCircle2, Tv, KeyRound, UserCheck, X } from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { VoterRegisterTab } from "./VoterRegisterTab";
import { CandidatesTab } from "./CandidatesTab";
import { ResultsTab } from "./ResultsTab";
import { AuditLogTab } from "./AuditLogTab";
import { PollingStationPortal } from "./PollingStationPortal";
import { SuperAdminConsole } from "./SuperAdminConsole";
import { LiveCollationDisplay } from "./LiveCollationDisplay";
import { OfficersTab } from "./OfficersTab";
import { NoElectionSelectedPrompt } from "./NoElectionSelectedPrompt";

export const AdminDashboard = () => {
  const {
    currentUser,
    activeSchool,
    elections,
    activeElection,
    activeElectionId,
    setActiveElectionId,
    addElectionBySchoolAdmin,
    switchToSuperAdmin,
  } = useVoting();

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem("gh_shs_admin_tab") || "overview";
    } catch {
      return "overview";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gh_shs_admin_tab", activeTab);
    } catch {}
  }, [activeTab]);

  // New Election Modal state for School Admin
  const [showNewElectionModal, setShowNewElectionModal] = useState(false);
  const [showCollationDisplay, setShowCollationDisplay] = useState(false);
  const [elecTitle, setElecTitle] = useState("");
  const [elecCode, setElecCode] = useState("");
  const [elecType, setElecType] = useState("General Prefectural");
  const [elecDesc, setElecDesc] = useState("");

  // If Platform Developer (Super Admin) is logged in, show Super Admin Console
  if (currentUser?.role === "super_admin") {
    return <SuperAdminConsole />;
  }

  const schoolElections = (elections || []).filter((e) => e.schoolId === (activeSchool?.id || ""));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowNewElectionModal(false);
        setShowCollationDisplay(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateElectionSubmit = (e) => {
    e.preventDefault();
    if (!elecTitle || !elecCode) return;

    if (activeSchool?.id) {
      addElectionBySchoolAdmin(activeSchool.id, {
        title: elecTitle,
        code: elecCode,
        type: elecType,
        description: elecDesc || `${elecType} for ${activeSchool?.name || "School"}`,
      });
    }

    setShowNewElectionModal(false);
    setElecTitle("");
    setElecCode("");
    setElecDesc("");
  };

  const tabs = [
    { id: "overview", label: "Overview & Controls", icon: LayoutDashboard },
    { id: "polling", label: "Polling Station & OTPs", icon: KeyRound },
    { id: "officers", label: "EC Officers & Desks", icon: UserCheck },
    { id: "register", label: "Voter Register (CSV)", icon: FileSpreadsheet },
    { id: "candidates", label: "Candidates & Roles", icon: Users },
    { id: "results", label: "Live Collation", icon: BarChart3 },
    { id: "audit", label: "Audit Trail", icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* School Admin Subheader & Named Election Sessions Switcher */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-live">EC ADMIN CONSOLE</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {activeSchool?.name || "School"} Electoral Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Managing named election sessions for <span className="text-amber-400 font-semibold">{activeSchool?.name || "School"}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.switchedFromSuperAdmin && (
              <button
                onClick={switchToSuperAdmin}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all shadow-md"
                title="Return to Super Admin Developer Console"
              >
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Return to Dev Console</span>
              </button>
            )}

            <button
              onClick={() => setShowCollationDisplay(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-950 hover:brightness-110 transition-all border border-emerald-400/30"
              title="Open full-screen live collation display for election grounds (reading in %)"
            >
              <Tv className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Election Grounds Live Display (% Screen)</span>
            </button>

            <button
              onClick={() => setShowNewElectionModal(true)}
              className="btn-gold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Election Session</span>
            </button>
          </div>
        </div>

        {/* Election Session Switcher Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Active Session:
            </span>
            <select
              value={activeElectionId || ""}
              onChange={(e) => setActiveElectionId(e.target.value)}
              className="form-input text-xs py-1 px-3 bg-slate-900 border-slate-700 font-bold text-amber-400"
            >
              <option value="">-- Select an Election Session --</option>
              {schoolElections.map((elec) => (
                <option key={elec.id} value={elec.id}>
                  {elec.title} (Code: {elec.code}) — {elec.type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {activeElection ? (
              <>
                <span>
                  Type: <strong className="text-white">{activeElection.type}</strong>
                </span>
                <span>•</span>
                <span>
                  Student Code: <strong className="font-mono text-emerald-400">{activeElection.code}</strong>
                </span>
              </>
            ) : (
              <span className="text-amber-400/80 italic font-medium">
                No election session selected. Pick from dropdown above to view controls.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === "overview" && (
          activeElection ? <OverviewTab /> : <NoElectionSelectedPrompt onOpenNewElectionModal={() => setShowNewElectionModal(true)} />
        )}
        {activeTab === "polling" && <PollingStationPortal />}
        {activeTab === "officers" && <OfficersTab />}
        {activeTab === "register" && (
          activeElection ? <VoterRegisterTab /> : <NoElectionSelectedPrompt onOpenNewElectionModal={() => setShowNewElectionModal(true)} />
        )}
        {activeTab === "candidates" && (
          activeElection ? <CandidatesTab /> : <NoElectionSelectedPrompt onOpenNewElectionModal={() => setShowNewElectionModal(true)} />
        )}
        {activeTab === "results" && (
          activeElection ? <ResultsTab /> : <NoElectionSelectedPrompt onOpenNewElectionModal={() => setShowNewElectionModal(true)} />
        )}
        {activeTab === "audit" && <AuditLogTab />}
      </div>

      {/* Create New Election Session Modal */}
      {showNewElectionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowNewElectionModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-lg w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            {/* Pinned Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display">Create Election Session</h3>
                <p className="text-xs text-slate-400">Add a general, class rep, or house election for {activeSchool?.name || "School"}.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewElectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateElectionSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs custom-modal-scroll">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Election Session Name / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHS 2 Science 1 Class Prefect Election"
                    value={elecTitle}
                    onChange={(e) => setElecTitle(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                      Student Login Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACH-SCI2-2026"
                      value={elecCode}
                      onChange={(e) => setElecCode(e.target.value)}
                      className="form-input font-mono uppercase font-bold text-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase mb-1">
                      Election Category / Type
                    </label>
                    <select
                      value={elecType}
                      onChange={(e) => setElecType(e.target.value)}
                      className="form-input"
                    >
                      <option value="General Prefectural">General School Prefectural</option>
                      <option value="Class / Form Election">Class / Form Prefect Election</option>
                      <option value="Dormitory House Election">Dormitory House Election</option>
                      <option value="SRC Executive Election">SRC Executive Election</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Description / Purpose
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Form captain and class assistant representative election for SHS 2 Science 1"
                    value={elecDesc}
                    onChange={(e) => setElecDesc(e.target.value)}
                    className="form-input"
                  ></textarea>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewElectionModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  Create Election Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Collation Display Screen for Election Grounds */}
      {showCollationDisplay && (
        <LiveCollationDisplay onClose={() => setShowCollationDisplay(false)} />
      )}
    </div>
  );
};
