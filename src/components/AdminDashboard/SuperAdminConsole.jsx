import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Building2,
  Plus,
  ShieldCheck,
  Ban,
  Play,
  LogOut,
  Code,
  AlertTriangle,
  Trash2,
  X,
  Palette,
  Sliders,
  KeyRound,
  Lock,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";

const COLOR_PRESETS = [
  {
    name: "Ghana Emerald & Gold (Default)",
    glow1: "#10b981",
    glow2: "#f59e0b",
    bg: "#030712",
    badge: "Official",
  },
  {
    name: "Royal Sapphire & Gold",
    glow1: "#2563eb",
    glow2: "#f59e0b",
    bg: "#020617",
    badge: "Executive",
  },
  {
    name: "Cyber Amethyst & Neon Teal",
    glow1: "#a855f7",
    glow2: "#14b8a6",
    bg: "#0b051b",
    badge: "Modern",
  },
  {
    name: "Independence Ruby & Amber",
    glow1: "#ef4444",
    glow2: "#f97316",
    bg: "#130505",
    badge: "Vibrant",
  },
  {
    name: "Deep Oceanic Cyan",
    glow1: "#06b6d4",
    glow2: "#3b82f6",
    bg: "#04131d",
    badge: "Cool",
  },
  {
    name: "Minimalist Slate Obsidian",
    glow1: "#64748b",
    glow2: "#94a3b8",
    bg: "#0b0f19",
    badge: "Clean",
  },
];

export const SuperAdminConsole = () => {
  const {
    schools,
    schoolAdmins,
    addSchoolByDeveloper,
    toggleSchoolAccountStatus,
    deleteSchoolByDeveloper,
    switchToSchoolAdmin,
    logout,
    superAdmin,
    systemConfig,
    changeDeveloperPassword,
    updateSystemConfig,
    updateSchoolAdminPassword,
    theme,
  } = useVoting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmActionModal, setConfirmActionModal] = useState(null); // { school, action: 'terminate' | 'delete' }

  // Settings & Customization Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState("passwords"); // "passwords" | "theme"

  // Developer Password Change State
  const [currentDevPass, setCurrentDevPass] = useState("");
  const [newDevPass, setNewDevPass] = useState("");
  const [confirmDevPass, setConfirmDevPass] = useState("");
  const [showDevPass, setShowDevPass] = useState(false);
  const [devPassError, setDevPassError] = useState("");
  const [devPassSuccess, setDevPassSuccess] = useState("");

  // Default EC Admin Password State
  const [defaultSchoolPass, setDefaultSchoolPass] = useState(systemConfig?.defaultPassword || "123");

  // Background Glows & Colors State
  const [glow1, setGlow1] = useState(systemConfig?.glowColor1 || "#10b981");
  const [glow2, setGlow2] = useState(systemConfig?.glowColor2 || "#f59e0b");
  const [bgColor, setBgColor] = useState(systemConfig?.backgroundColor || "#030712");
  const [activePreset, setActivePreset] = useState(systemConfig?.presetName || "Ghana Emerald & Gold (Default)");

  // Change individual School Admin Password Modal State
  const [changeAdminPasswordModal, setChangeAdminPasswordModal] = useState(null); // school
  const [newSchoolAdminPass, setNewSchoolAdminPass] = useState("");

  const [schName, setSchName] = useState("");
  const [schShortName, setSchShortName] = useState("");
  const [schLocation, setSchLocation] = useState("Accra, Ghana");
  const [schMotto, setSchMotto] = useState("Excellence & Integrity");
  const [schCode, setSchCode] = useState("WGH-2026");
  const [schLogo, setSchLogo] = useState(
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80"
  );
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState(systemConfig?.defaultPassword || "123");
  const [formError, setFormError] = useState("");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!schName || !schShortName || !schCode) return;

    const res = addSchoolByDeveloper(
      {
        name: schName,
        shortName: schShortName,
        location: schLocation,
        motto: schMotto,
        code: schCode.trim().toUpperCase(),
        logo: schLogo,
      },
      adminUsername || `admin_${schShortName.toLowerCase()}`,
      adminPassword || "1234"
    );

    if (res?.success) {
      setShowAddModal(false);
      setSchName("");
      setSchShortName("");
      setAdminUsername("");
      setFormError("");
    } else if (res?.message) {
      setFormError(res.message);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmActionModal) return;
    const { school, action } = confirmActionModal;
    if (action === "terminate") {
      toggleSchoolAccountStatus(school.id, "terminated");
    } else if (action === "delete") {
      deleteSchoolByDeveloper(school.id);
    }
    setConfirmActionModal(null);
  };

  const handleDevPasswordSubmit = (e) => {
    e.preventDefault();
    setDevPassError("");
    setDevPassSuccess("");

    if (!currentDevPass || !newDevPass) {
      setDevPassError("Please provide both current and new password.");
      return;
    }
    if (newDevPass.length < 4) {
      setDevPassError("New password must be at least 4 characters.");
      return;
    }
    if (newDevPass !== confirmDevPass) {
      setDevPassError("New passwords do not match. Please verify.");
      return;
    }

    const res = changeDeveloperPassword(currentDevPass, newDevPass);
    if (!res.success) {
      setDevPassError(res.message);
    } else {
      setDevPassSuccess("Developer access password updated successfully!");
      setCurrentDevPass("");
      setNewDevPass("");
      setConfirmDevPass("");
    }
  };

  const handleDefaultPassSave = (e) => {
    e.preventDefault();
    if (!defaultSchoolPass.trim()) return;
    updateSystemConfig({ defaultPassword: defaultSchoolPass.trim() });
    setAdminPassword(defaultSchoolPass.trim());
  };

  const handleSelectPreset = (preset) => {
    setGlow1(preset.glow1);
    setGlow2(preset.glow2);
    setBgColor(preset.bg);
    setActivePreset(preset.name);
    updateSystemConfig({
      glowColor1: preset.glow1,
      glowColor2: preset.glow2,
      backgroundColor: preset.bg,
      presetName: preset.name,
    });
  };

  const handleSaveCustomGlows = (e) => {
    e.preventDefault();
    updateSystemConfig({
      glowColor1: glow1,
      glowColor2: glow2,
      backgroundColor: bgColor,
      presetName: "Custom Palette",
    });
    setActivePreset("Custom Palette");
  };

  const handleUpdateSchoolAdminPasswordSubmit = (e) => {
    e.preventDefault();
    if (!changeAdminPasswordModal || !newSchoolAdminPass.trim()) return;
    updateSchoolAdminPassword(changeAdminPasswordModal.id, newSchoolAdminPass.trim());
    setChangeAdminPasswordModal(null);
    setNewSchoolAdminPass("");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Super Admin Banner */}
      <div className="glass-panel p-6 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-live">PLATFORM DEVELOPER CONSOLE</span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Platform Master Registry &amp; School Accounts
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provision new High School elections, manage EC Admin credentials, or switch/terminate election accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDevPassError("");
              setDevPassSuccess("");
              setShowSettingsModal(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            title="Configure developer password, default credentials, and background colors"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Developer Settings &amp; Theme</span>
          </button>

          <button
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New School Election</span>
          </button>
        </div>
      </div>

      {/* Schools & Assigned EC Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((sch) => {
          const ecAdmin = schoolAdmins.find((sa) => sa.schoolId === sch.id);
          const isTerminated = sch.status === "terminated";
          const isSuspended = sch.status === "suspended";

          return (
            <div key={sch.id} className="glass-panel p-6 border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={sch.logo}
                    alt={sch.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{sch.name}</h3>
                    <div className="text-xs text-amber-400 font-semibold">{sch.motto}</div>
                  </div>
                </div>

                <span
                  className={`badge uppercase text-[10px] ${
                    isTerminated
                      ? "badge-ended"
                      : isSuspended
                      ? "badge-paused"
                      : "badge-live"
                  }`}
                >
                  {sch.status}
                </span>
              </div>

              {/* Credentials Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Voter Login School Code:</span>
                  <span className="font-mono font-bold text-amber-400">{sch.code}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Assigned EC Admin User:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {ecAdmin?.username || `admin_${sch.shortName.toLowerCase()}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">EC Admin Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-300">
                      {ecAdmin?.password || "123"}
                    </span>
                    <button
                      onClick={() => {
                        setChangeAdminPasswordModal(sch);
                        setNewSchoolAdminPass(ecAdmin?.password || "123");
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                      title="Change this school's EC Admin Password"
                    >
                      <KeyRound className="w-3 h-3" /> Change
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Account Control Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => switchToSchoolAdmin(sch.id)}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500/30 transition-colors"
                  title="Directly manage this school's EC Admin Dashboard"
                >
                  <Code className="w-3.5 h-3.5 text-blue-400" /> Switch to EC Dashboard
                </button>

                <div className="flex items-center gap-2">
                  {sch.status !== "active" ? (
                    <button
                      onClick={() => toggleSchoolAccountStatus(sch.id, "active")}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/30"
                      title="Re-activate school account"
                    >
                      <Play className="w-3.5 h-3.5" /> Re-Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleSchoolAccountStatus(sch.id, "suspended")}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30"
                      title="Temporarily suspend school account"
                    >
                      <Ban className="w-3.5 h-3.5" /> Suspend
                    </button>
                  )}

                  {!isTerminated ? (
                    <button
                      onClick={() => setConfirmActionModal({ school: sch, action: "terminate" })}
                      className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                      title="Block all logins and terminate election account"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Terminate
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmActionModal({ school: sch, action: "delete" })}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-500/30"
                      title="Permanently remove school from registry"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Terminate / Delete */}
      {confirmActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-red-500/40 shadow-2xl relative animate-fadeIn space-y-4">
            <button
              onClick={() => setConfirmActionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  Confirm {confirmActionModal.action} Account
                </h3>
                <p className="text-xs text-slate-400">
                  Target School: <span className="font-bold text-amber-400">{confirmActionModal.school.name}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {confirmActionModal.action === "terminate"
                ? `Terminating '${confirmActionModal.school.name}' will block all voter logins and EC Admin dashboard access. You can re-activate the account anytime.`
                : `Permanently deleting '${confirmActionModal.school.name}' will purge all registered voters, elections, candidates, and EC Admin accounts for this school. This action cannot be undone!`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmActionModal(null)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="btn-danger text-xs font-bold py-2 px-4 flex items-center gap-1.5"
              >
                {confirmActionModal.action === "terminate" ? (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Yes, Terminate Account
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete School
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 border-slate-700 shadow-2xl relative my-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-1">Provision New High School</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set up school profile and generate EC Admin credentials. Each school requires a unique Voter School Code to isolate logins.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Full School Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wesley Girls' High School"
                    value={schName}
                    onChange={(e) => setSchName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Short Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wey Gey Hey"
                    value={schShortName}
                    onChange={(e) => setSchShortName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Unique School Code</span>
                    <span className="text-[10px] text-amber-400 font-normal lowercase">(required)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WGH-2026"
                    value={schCode}
                    onChange={(e) => {
                      setSchCode(e.target.value);
                      setFormError("");
                    }}
                    className="form-input font-mono uppercase font-bold text-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cape Coast"
                    value={schLocation}
                    onChange={(e) => setSchLocation(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g. Live Pure, Speak True, Right Wrong"
                  value={schMotto}
                  onChange={(e) => setSchMotto(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* EC Admin Account Setup */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex justify-between items-center">
                  <span>School EC Admin Login Credentials</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(Isolated per tenant)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      EC Admin Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. admin or admin_wgh"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="form-input text-xs font-mono"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Same usernames (e.g. &lsquo;admin&rsquo;) are separated by Target School Code during login.
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      EC Admin Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="form-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Provision School Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Developer Settings & Customization Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 lg:p-8 border-slate-700 shadow-2xl relative my-8 animate-fadeIn space-y-6">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">
                  Developer Settings &amp; Theme Customization
                </h3>
                <p className="text-xs text-slate-400">
                  Update Super Admin credentials, default passwords, and background aesthetic palettes.
                </p>
              </div>
            </div>

            {/* Modal Tab Switcher */}
            <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsTab("passwords")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  settingsTab === "passwords"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security &amp; Passwords</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab("theme")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  settingsTab === "theme"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Background Colors &amp; Themes</span>
              </button>
            </div>

            {/* TAB 1: PASSWORDS & SECURITY */}
            {settingsTab === "passwords" && (
              <div className="space-y-6">
                {/* Developer Account Password */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-400" />
                        <span>Platform Developer Access Password</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Username: <span className="font-mono text-purple-300 font-bold">developer</span> (Super Admin)
                      </p>
                    </div>
                    <span className="badge badge-live text-[10px]">Super Admin</span>
                  </div>

                  {devPassError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                      {devPassError}
                    </div>
                  )}

                  {devPassSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4" /> {devPassSuccess}
                    </div>
                  )}

                  <form onSubmit={handleDevPasswordSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Current Developer Password
                      </label>
                      <input
                        type={showDevPass ? "text" : "password"}
                        placeholder="Enter current password (default: dev123)"
                        value={currentDevPass}
                        onChange={(e) => {
                          setCurrentDevPass(e.target.value);
                          setDevPassError("");
                          setDevPassSuccess("");
                        }}
                        className="form-input font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          New Developer Password
                        </label>
                        <input
                          type={showDevPass ? "text" : "password"}
                          placeholder="Min. 4 characters"
                          value={newDevPass}
                          onChange={(e) => {
                            setNewDevPass(e.target.value);
                            setDevPassError("");
                            setDevPassSuccess("");
                          }}
                          className="form-input font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type={showDevPass ? "text" : "password"}
                          placeholder="Re-type new password"
                          value={confirmDevPass}
                          onChange={(e) => {
                            setConfirmDevPass(e.target.value);
                            setDevPassError("");
                            setDevPassSuccess("");
                          }}
                          className="form-input font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDevPass(!showDevPass)}
                        className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                      >
                        {showDevPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showDevPass ? "Hide" : "Show"} Passwords</span>
                      </button>

                      <button
                        type="submit"
                        className="btn-gold text-xs font-bold py-2 px-4 shadow-md"
                      >
                        Update Developer Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Default Password for New Schools */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Default System Password</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The default password automatically assigned to new school EC Admins and recruited officers.
                    </p>
                  </div>

                  <form onSubmit={handleDefaultPassSave} className="flex items-center gap-3 text-xs">
                    <input
                      type="text"
                      value={defaultSchoolPass}
                      onChange={(e) => setDefaultSchoolPass(e.target.value)}
                      placeholder="e.g. 123"
                      className="form-input font-mono max-w-xs font-bold text-amber-400"
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary text-xs font-bold py-2.5 px-4"
                    >
                      Save Default Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: BACKGROUND COLORS & THEMES */}
            {settingsTab === "theme" && (
              <div className="space-y-6">
                {/* Color Presets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Curated Aesthetic Palettes</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Click to instantly apply &amp; sync</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = activePreset === preset.name;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 shadow-lg ring-2 ring-emerald-500/40"
                              : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {preset.badge}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                              style={{ backgroundColor: preset.glow1 }}
                              title={`Glow 1: ${preset.glow1}`}
                            />
                            <div
                              className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                              style={{ backgroundColor: preset.glow2 }}
                              title={`Glow 2: ${preset.glow2}`}
                            />
                            <div
                              className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                              style={{ backgroundColor: preset.bg }}
                              title={`Background: ${preset.bg}`}
                            />
                          </div>

                          <div className="text-xs font-bold text-white leading-tight">
                            {preset.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Tuning */}
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Custom Ambient Glow &amp; Background Tuning
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adjust individual hex values to create a unique custom ambiance.
                    </p>
                  </div>

                  <form onSubmit={handleSaveCustomGlows} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Primary Glow Accent
                        </label>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <input
                            type="color"
                            value={glow1}
                            onChange={(e) => setGlow1(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs font-bold text-white uppercase">{glow1}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Secondary Glow Accent
                        </label>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <input
                            type="color"
                            value={glow2}
                            onChange={(e) => setGlow2(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs font-bold text-white uppercase">{glow2}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Dark Mode Canvas Tone
                        </label>
                        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <span className="font-mono text-xs font-bold text-white uppercase">{bgColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div
                      className="p-4 rounded-xl border border-slate-700 transition-all flex items-center justify-between text-xs"
                      style={{
                        backgroundColor: bgColor,
                        backgroundImage: `radial-gradient(circle at 10% 20%, ${glow1}33 0%, transparent 60%), radial-gradient(circle at 90% 80%, ${glow2}33 0%, transparent 60%)`,
                      }}
                    >
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Live Color Preview</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">
                        {glow1} • {glow2} • {bgColor}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSelectPreset(COLOR_PRESETS[0])}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Ghana Default</span>
                      </button>

                      <button
                        type="submit"
                        className="btn-primary text-xs font-bold py-2 px-4 shadow-md"
                      >
                        Apply &amp; Save Custom Palette
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="btn-secondary text-xs"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change School Admin Password Modal */}
      {changeAdminPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-slate-700 shadow-2xl relative animate-fadeIn space-y-4">
            <button
              onClick={() => setChangeAdminPasswordModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Change EC Admin Password
                </h3>
                <p className="text-xs text-amber-400 font-semibold">
                  {changeAdminPasswordModal.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSchoolAdminPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New EC Admin Password
                </label>
                <input
                  type="text"
                  placeholder="Enter new password (e.g. 1234)"
                  value={newSchoolAdminPass}
                  onChange={(e) => setNewSchoolAdminPass(e.target.value)}
                  className="form-input font-mono font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setChangeAdminPasswordModal(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
