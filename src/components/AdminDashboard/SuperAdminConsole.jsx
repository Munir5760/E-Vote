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
  X
} from "lucide-react";

export const SuperAdminConsole = () => {
  const {
    schools,
    schoolAdmins,
    addSchoolByDeveloper,
    toggleSchoolAccountStatus,
    deleteSchoolByDeveloper,
    switchToSchoolAdmin,
    logout,
  } = useVoting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmActionModal, setConfirmActionModal] = useState(null); // { school, action: 'terminate' | 'delete' }

  const [schName, setSchName] = useState("");
  const [schShortName, setSchShortName] = useState("");
  const [schLocation, setSchLocation] = useState("Accra, Ghana");
  const [schMotto, setSchMotto] = useState("Excellence & Integrity");
  const [schCode, setSchCode] = useState("WGH-2026");
  const [schLogo, setSchLogo] = useState(
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80"
  );
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("1234");
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

                <div className="flex justify-between">
                  <span className="text-slate-400">EC Admin Password:</span>
                  <span className="font-mono font-bold text-slate-300">
                    {ecAdmin?.password || "1234"}
                  </span>
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
    </div>
  );
};
