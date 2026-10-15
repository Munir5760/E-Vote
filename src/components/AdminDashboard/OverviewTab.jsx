import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Play,
  Pause,
  Lock,
  Users,
  Vote,
  Award,
  TrendingUp,
  Building2,
  Calendar,
  Clock,
  Palette,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  Save,
  Tv,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { LiveCollationDisplay } from "./LiveCollationDisplay";

export const OverviewTab = () => {
  const {
    activeSchool,
    activeElection,
    positions,
    candidates,
    voters,
    toggleElectionSessionStatus,
    deleteElection,
    updateElectionTimes,
    updateSchoolBranding,
  } = useVoting();

  const [showCollationDisplay, setShowCollationDisplay] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Schedule local state
  const [startTime, setStartTime] = useState(activeElection?.startTime || "");
  const [endTime, setEndTime] = useState(activeElection?.endTime || "");

  // Branding local state
  const [schoolLogo, setSchoolLogo] = useState(activeSchool?.logo || "");
  const [schoolMotto, setSchoolMotto] = useState(activeSchool?.motto || "");
  const [primaryColor, setPrimaryColor] = useState(activeSchool?.primaryColor || "#10b981");
  const [logoPreview, setLogoPreview] = useState(activeSchool?.logo || "");

  useEffect(() => {
    setStartTime(activeElection?.startTime || "");
    setEndTime(activeElection?.endTime || "");
  }, [activeElection]);

  useEffect(() => {
    setSchoolLogo(activeSchool?.logo || "");
    setSchoolMotto(activeSchool?.motto || "");
    setPrimaryColor(activeSchool?.primaryColor || "#10b981");
    setLogoPreview(activeSchool?.logo || "");
  }, [activeSchool]);

  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result);
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!activeElection) return;
    updateElectionTimes(activeElection.id, startTime, endTime);
  };

  const handleSaveBranding = (e) => {
    e.preventDefault();
    if (!activeSchool?.id) return;
    updateSchoolBranding(activeSchool.id, {
      logo: schoolLogo,
      motto: schoolMotto,
      primaryColor: primaryColor,
    });
  };

  const electionPositions = (positions || []).filter(
    (p) => p.electionId === activeElection?.id || (p.schoolId === (activeSchool?.id || "") && !p.electionId)
  );

  const electionCandidates = (candidates || []).filter(
    (c) => c.electionId === activeElection?.id || (c.schoolId === (activeSchool?.id || "") && !c.electionId)
  );

  const electionVoters = (voters || []).filter(
    (v) => v.electionId === activeElection?.id || (!v.electionId && v.schoolId === (activeSchool?.id || ""))
  );

  const totalVoters = electionVoters.length;
  const votedCount = electionVoters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  // Color preset swatches for quick school theme setting
  const COLOR_PRESETS = [
    { name: "Emerald Green", hex: "#10b981" },
    { name: "Royal Gold", hex: "#f59e0b" },
    { name: "Navy Blue", hex: "#2563eb" },
    { name: "Crimson Red", hex: "#dc2626" },
    { name: "Royal Purple", hex: "#7c3aed" },
    { name: "Cyan Teal", hex: "#0891b2" },
    { name: "Maroon Bronze", hex: "#9f1239" },
  ];

  // Preset school badges
  const SAMPLE_BADGES = [
    { name: "Crest A", url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80" },
    { name: "Crest B", url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80" },
    { name: "Shield C", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80" },
  ];

  if (!activeElection) {
    return (
      <div className="glass-panel p-10 text-center space-y-4 border-slate-800">
        <Vote className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Election Session Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please select an election session from the dropdown above, or click "Create New Election Session" to start a new poll for <strong className="text-amber-400">{activeSchool?.name || "School"}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Status Bar */}
      <div className="glass-panel p-6 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-bold overflow-hidden shadow-lg shrink-0"
            style={{ borderColor: activeSchool?.primaryColor || undefined }}
          >
            {activeSchool?.logo ? (
              <img
                src={activeSchool.logo}
                alt={activeSchool?.name || "School"}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{activeElection?.title}</h2>
              <span className="text-xs font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                {activeElection?.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeSchool?.name || "School"} • Category: <span className="text-emerald-400 font-semibold">{activeElection?.type}</span>
            </p>
            {activeSchool?.motto && (
              <p className="text-[11px] text-slate-500 italic mt-0.5">"{activeSchool.motto}"</p>
            )}
          </div>
        </div>

        {/* Election Controls & Delete Option */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">Status:</span>

            <button
              onClick={() => toggleElectionSessionStatus(activeElection.id, "not_started")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeElection?.status === "not_started" || !activeElection?.status
                  ? "bg-slate-700 text-amber-300 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Inactive
            </button>

            <button
              onClick={() => toggleElectionSessionStatus(activeElection.id, "active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeElection?.status === "active"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Start / Live
            </button>

            <button
              onClick={() => toggleElectionSessionStatus(activeElection.id, "paused")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeElection?.status === "paused"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
              }`}
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>

            <button
              onClick={() => toggleElectionSessionStatus(activeElection.id, "ended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeElection?.status === "ended"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Seal Election
            </button>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            title="Delete this election session permanently"
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Election</span>
          </button>
        </div>
      </div>

      {/* Inactive Election Alert Banner */}
      {(activeElection?.status === "not_started" || !activeElection?.status) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Election Status: INACTIVE (Default)</span>
            <p className="mt-1 text-slate-300">
              This election is currently inactive. Students cannot log in or vote until the Electoral Commissioner starts the election by clicking <strong>"Start / Live"</strong> above.
            </p>
          </div>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Turnout Card */}
        <div className="glass-panel p-5 border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Voter Turnout
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">
            {turnoutPercent}%
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full mt-3 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
              style={{ width: `${turnoutPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {votedCount} of {totalVoters} registered voters cast
          </p>
        </div>

        {/* Registered Voters */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              School Register
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">{totalVoters}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalVoters - votedCount} voters pending
          </p>
        </div>

        {/* Positions Count */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ballot Positions
            </span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">{electionPositions.length}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Contested for {activeElection?.title}
          </p>
        </div>

        {/* Candidates Count */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nominated Candidates
            </span>
            <Vote className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-display">{electionCandidates.length}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Active in this election session
          </p>
        </div>
      </div>

      {/* EC Settings & Controls: Election Schedule + School Custom Branding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Election Schedule & Time Controls */}
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Election Schedule & Time Controls</h3>
          </div>

          <p className="text-xs text-slate-400">
            Set the official voting window for <strong>{activeElection?.title}</strong>. The Electoral Commissioner determines start and end times for all student voters.
          </p>

          <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Election Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime ? startTime.substring(0, 16) : ""}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Election End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endTime ? endTime.substring(0, 16) : ""}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input text-slate-200"
              />
            </div>

            {/* Quick preset schedule buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-slate-400 w-full font-semibold">Quick Duration Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const in4Hours = new Date(now.getTime() + 4 * 3600000);
                  setStartTime(now.toISOString().substring(0, 16));
                  setEndTime(in4Hours.toISOString().substring(0, 16));
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-[11px]"
              >
                Now + 4 Hours
              </button>

              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const in8Hours = new Date(now.getTime() + 8 * 3600000);
                  setStartTime(now.toISOString().substring(0, 16));
                  setEndTime(in8Hours.toISOString().substring(0, 16));
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-[11px]"
              >
                Now + 8 Hours
              </button>

              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const in24Hours = new Date(now.getTime() + 24 * 3600000);
                  setStartTime(now.toISOString().substring(0, 16));
                  setEndTime(in24Hours.toISOString().substring(0, 16));
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-[11px]"
              >
                Full Day (24 Hrs)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Election Schedule
              </button>
            </div>
          </form>
        </div>

        {/* School Badge Upload & Theme Customization */}
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">School Badge & Custom Colors</h3>
          </div>

          <p className="text-xs text-slate-400">
            Upload school badge/crest and customize background theme colors for <strong>{activeSchool?.name}</strong>.
          </p>

          <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
            {/* School Logo / Badge Upload */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                School Crest / Badge Image
              </label>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="btn-secondary text-[11px] cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3">
                    <Upload className="w-3.5 h-3.5" /> Upload Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or enter Image URL"
                    value={schoolLogo}
                    onChange={(e) => {
                      setSchoolLogo(e.target.value);
                      setLogoPreview(e.target.value);
                    }}
                    className="form-input text-[11px] py-1"
                  />
                </div>
              </div>

              {/* Sample Crest Buttons */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500">Preset Crests:</span>
                {SAMPLE_BADGES.map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSchoolLogo(b.url);
                      setLogoPreview(b.url);
                    }}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* School Motto */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                School Motto / Slogan
              </label>
              <input
                type="text"
                placeholder="e.g. Ut Omnes Unum Sint"
                value={schoolMotto}
                onChange={(e) => setSchoolMotto(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Primary Accent / Theme Color Picker */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                School Theme Accent Color
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="form-input font-mono text-xs w-28 uppercase"
                />
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-1 shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Preview Theme
                </div>
              </div>

              {/* Quick Swatches */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COLOR_PRESETS.map((cp) => (
                  <button
                    key={cp.hex}
                    type="button"
                    onClick={() => setPrimaryColor(cp.hex)}
                    className="w-5 h-5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: cp.hex }}
                    title={cp.name}
                  ></button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save School Identity & Colors
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Leading Candidates Leaderboard */}
      <div className="glass-panel p-6 border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Live Election Leaderboard ({activeElection?.title})</span>
          </h3>

          <button
            onClick={() => setShowCollationDisplay(true)}
            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:brightness-110 transition-all border border-emerald-400/30"
          >
            <Tv className="w-4 h-4 text-emerald-200" />
            <span>Open Grounds Projector Display (% Screen)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {electionPositions.map((pos) => {
            const cands = electionCandidates
              .filter((c) => c.positionId === pos.id)
              .sort((a, b) => b.votes - a.votes);

            const leader = cands[0];

            return (
              <div
                key={pos.id}
                className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">{pos.title}</span>
                  {leader ? (
                    <div className="flex items-center gap-2.5 mt-1">
                      <img
                        src={leader.photo}
                        alt={leader.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {leader.name}
                          <span className="text-[10px] text-amber-400 font-normal">
                            ("{leader.alias}")
                          </span>
                        </div>
                        <div className="text-xs text-emerald-400 font-semibold">
                          {leader.votes} vote(s) cast
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic mt-1">No candidates nominated</div>
                  )}
                </div>

                <div className="text-right">
                  <span className="badge badge-live">Leading</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCollationDisplay && (
        <LiveCollationDisplay onClose={() => setShowCollationDisplay(false)} />
      )}

      {/* Delete Election Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="glass-panel w-full max-w-lg border-red-500/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-red-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Election Session</h3>
                  <p className="text-xs text-red-300 font-mono">Irreversible Action</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-modal-scroll space-y-4 text-xs text-slate-300">
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-red-300 text-sm block">Warning: Permanent Data Removal</span>
                  <p className="text-slate-300">
                    Are you sure you want to delete this election session? This will permanently erase:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                    <li>Election session record: <strong className="text-white">{activeElection?.title}</strong></li>
                    <li>All ballot positions (<strong className="text-white">{electionPositions.length}</strong> contested positions)</li>
                    <li>All candidate nominations (<strong className="text-white">{electionCandidates.length}</strong> candidates)</li>
                    <li>The registered voter roster (<strong className="text-white">{totalVoters}</strong> student voters) and all cast ballots</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Election Title:</span>
                  <span className="font-bold text-white">{activeElection?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Election Code:</span>
                  <span className="font-mono font-bold text-amber-400">{activeElection?.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">School:</span>
                  <span className="font-semibold text-slate-200">{activeSchool?.name}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-950">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteElection(activeElection.id);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete This Election</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

