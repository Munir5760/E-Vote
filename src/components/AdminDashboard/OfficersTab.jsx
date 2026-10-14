import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Trash2,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  Lock,
  Building2,
  X,
  ExternalLink
} from "lucide-react";

export const OfficersTab = () => {
  const {
    activeSchool,
    officers,
    addOfficerByAdmin,
    toggleOfficerStatus,
    adminResetOfficerPassword,
    deleteOfficerByAdmin,
    showToast,
  } = useVoting();

  const schoolOfficers = (officers || []).filter((o) => o.schoolId === (activeSchool?.id || ""));

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | active | suspended

  // Modal states
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedOfficerForReset, setSelectedOfficerForReset] = useState(null);
  const [issuedSlipOfficer, setIssuedSlipOfficer] = useState(null);

  // New Officer Form
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [desk, setDesk] = useState(`Station Desk ${(schoolOfficers || []).length + 1}`);
  const [defaultPassword, setDefaultPassword] = useState("123");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  // Reset Password Form
  const [newDefaultPass, setNewDefaultPass] = useState("123");

  // Filtering
  const filteredOfficers = schoolOfficers.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.desk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = schoolOfficers.filter((o) => o.status === "active").length;
  const suspendedCount = schoolOfficers.filter((o) => o.status === "suspended").length;
  const changedPassCount = schoolOfficers.filter((o) => o.isPasswordChanged).length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRecruitModal(false);
        setShowResetModal(false);
        setIssuedSlipOfficer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRecruitSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !username.trim() || !defaultPassword.trim()) {
      setFormError("Please fill in Officer Name, Username, and Default Password.");
      return;
    }

    const res = addOfficerByAdmin({
      name: fullName,
      username: username.trim(),
      desk: desk.trim() || `Station Desk ${schoolOfficers.length + 1}`,
      defaultPassword: defaultPassword.trim(),
      phone: phone.trim(),
      schoolId: activeSchool?.id || "",
    });

    if (!res.success) {
      setFormError(res.message);
    } else {
      setShowRecruitModal(false);
      setIssuedSlipOfficer(res.officer);
      setFullName("");
      setUsername("");
      setDesk(`Station Desk ${schoolOfficers.length + 2}`);
      setDefaultPassword("123");
      setPhone("");
    }
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!selectedOfficerForReset || !newDefaultPass.trim()) return;

    adminResetOfficerPassword(selectedOfficerForReset.id, newDefaultPass.trim());
    setShowResetModal(false);
    setSelectedOfficerForReset(null);
    setNewDefaultPass("123");
  };

  const handleCopyCredentials = (off) => {
    const credText = `--- GHANA SHS E-VOTE EC CREDENTIALS ---\nSchool: ${activeSchool?.name || "School"}\nOfficer: ${off.name}\nStation: ${off.desk}\nUsername: ${off.username}\nDefault Password: ${off.password}\nNote: Change this password on Election Day.`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(credText);
      showToast(`Copied credentials for ${off.name} to clipboard!`, "success");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Stats */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-live">ACCREDITATION PERSONNEL</span>
              <h3 className="text-xl font-extrabold text-white">
                Recruited EC Polling Officers
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recruit, credential, and manage polling station officers for{" "}
              <strong className="text-amber-400">{activeSchool?.name || "School"}</strong>. Officers can only
              access the student OTP generation portal with authorized credentials.
            </p>
          </div>

          <button
            onClick={() => {
              setDesk(`Station Desk ${schoolOfficers.length + 1}`);
              setShowRecruitModal(true);
            }}
            className="btn-gold text-xs px-4 py-2.5 flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Recruit New EC Officer</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Officers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{schoolOfficers.length}</span>
              <span className="text-[10px] text-slate-500">recruited</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Desks
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
              <span className="text-[10px] text-emerald-500/70">authorized</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Suspended Access
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-400">{suspendedCount}</span>
              <span className="text-[10px] text-rose-500/70">blocked</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Custom Passwords
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-400">{changedPassCount}</span>
              <span className="text-[10px] text-slate-500">secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search officer by name, username, or desk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input text-xs pl-10 pr-4 py-2 bg-slate-900 border-slate-700 text-white w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white font-semibold"
          >
            <option value="ALL">All Statuses ({schoolOfficers.length})</option>
            <option value="active">Active Only ({activeCount})</option>
            <option value="suspended">Suspended Only ({suspendedCount})</option>
          </select>
        </div>
      </div>

      {/* Officers List Table */}
      <div className="glass-panel border-slate-800 overflow-hidden shadow-xl">
        {filteredOfficers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No EC Officers Found</p>
            <p className="text-[11px] text-slate-500">
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search query or status filter."
                : "Recruit your first polling station officer above to grant OTP station access."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Officer & Station</th>
                  <th className="py-3 px-4">Recruited Username</th>
                  <th className="py-3 px-4">Password Status</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOfficers.map((off) => {
                  const isSuspended = off.status === "suspended";

                  return (
                    <tr
                      key={off.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSuspended ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Name & Desk */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-md ${
                              isSuspended
                                ? "bg-rose-950 text-rose-400 border border-rose-800"
                                : "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                            }`}
                          >
                            {off.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-2">
                              <span>{off.name}</span>
                              {off.phone && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  {off.phone}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-teal-400/90 font-medium mt-0.5">
                              {off.desk}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-amber-400 font-bold">
                          {off.username}
                        </span>
                      </td>

                      {/* Password Status */}
                      <td className="py-3.5 px-4">
                        {off.isPasswordChanged ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            <span>Changed by Officer</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Default: <span className="font-mono font-bold">{off.password}</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Access Status */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span>SUSPENDED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Slip */}
                          <button
                            onClick={() => handleCopyCredentials(off)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Copy officer credentials"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setSelectedOfficerForReset(off);
                              setNewDefaultPass("123");
                              setShowResetModal(true);
                            }}
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                            title="Reset officer default password"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Activate Button */}
                          <button
                            onClick={() => toggleOfficerStatus(off.id)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                              isSuspended
                                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                            }`}
                            title={isSuspended ? "Restore officer OTP station access" : "Suspend officer from accessing OTP station"}
                          >
                            {isSuspended ? (
                              <>
                                <ShieldCheck className="w-3 h-3" />
                                <span>Activate</span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>

                          {/* Delete Officer */}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete EC Officer '${off.name}' (${off.desk})? This cannot be undone.`
                                )
                              ) {
                                deleteOfficerByAdmin(off.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete officer permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECRUIT OFFICER MODAL */}
      {showRecruitModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowRecruitModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-md w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            {/* Pinned Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Recruit EC Polling Officer
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Create official polling station credentials for student accreditation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecruitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecruitSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs custom-modal-scroll">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Full Name of Recruited Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ama Boateng"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Officer Username / Staff ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. officer_desk3"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Assigned Polling Desk Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Station Desk 3 - Assembly Hall"
                    value={desk}
                    onChange={(e) => setDesk(e.target.value)}
                    className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">
                      Default Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123"
                      value={defaultPassword}
                      onChange={(e) => setDefaultPassword(e.target.value)}
                      className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-amber-400 font-mono font-bold w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0244123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    The officer will use this default password to log into the OTP station and can change it on Election Day.
                  </span>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecruitModal(false)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs px-4 py-2 font-bold shadow-md"
                >
                  Issue Credentials &amp; Recruit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedOfficerForReset && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowResetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-sm w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="font-extrabold text-white text-base">
                  Reset Officer Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs custom-modal-scroll">
                <p className="text-slate-400">
                  Set a new default password for{" "}
                  <strong className="text-white">{selectedOfficerForReset.name}</strong> (
                  {selectedOfficerForReset.desk}).
                </p>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    New Default Password
                  </label>
                  <input
                    type="text"
                    value={newDefaultPass}
                    onChange={(e) => setNewDefaultPass(e.target.value)}
                    className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-amber-400 font-mono font-bold w-full"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs px-4 py-2 font-bold"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECRUITED OFFICER CREDENTIAL SLIP MODAL */}
      {issuedSlipOfficer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setIssuedSlipOfficer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-md w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden text-center"
          >
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-base font-black text-white">
                  EC Officer Recruited Successfully!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssuedSlipOfficer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-modal-scroll">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <p className="text-xs text-slate-400">
                Hand these official polling station credentials to the recruited officer:
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">School:</span>
                  <span className="text-white font-bold">{activeSchool?.name || "School"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Officer Name:</span>
                  <span className="text-emerald-400 font-bold">{issuedSlipOfficer.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Assigned Desk:</span>
                  <span className="text-white">{issuedSlipOfficer.desk}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Username:</span>
                  <span className="text-amber-400 font-bold">{issuedSlipOfficer.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Default Password:</span>
                  <span className="text-teal-400 font-bold">{issuedSlipOfficer.password}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyCredentials(issuedSlipOfficer)}
                className="btn-gold text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Credentials Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setIssuedSlipOfficer(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
