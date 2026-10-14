import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Vote,
  KeyRound,
  UserCheck,
  Building2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Key,
  X
} from "lucide-react";

export const VoterLogin = ({ onOpenOfficerDesk }) => {
  const { loginAsVoter, createStudentCustomPassword, schools, voters, elections } = useVoting();

  const [schoolCode, setSchoolCode] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadyVotedInfo, setAlreadyVotedInfo] = useState(null);

  // First-time Password Setup Modal state
  const [showPasswordSetupModal, setShowPasswordSetupModal] = useState(false);
  const [setupSchoolCode, setSetupSchoolCode] = useState("");
  const [setupIndex, setSetupIndex] = useState("");
  const [setupNewPass, setSetupNewPass] = useState("");
  const [setupConfirmPass, setSetupConfirmPass] = useState("");
  const [setupError, setSetupError] = useState("");

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPasswordSetupModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setAlreadyVotedInfo(null);

    if (!schoolCode.trim() || !indexNumber.trim() || !passwordInput.trim()) {
      setErrorMsg("Please enter Election Code, Student Index Number, and One-Time Password (OTP).");
      return;
    }

    const res = loginAsVoter(schoolCode, indexNumber, passwordInput);
    if (!res.success) {
      setErrorMsg(res.message);
      if (res.alreadyVoted) {
        setAlreadyVotedInfo(res.student);
      }
    }
  };

  const handlePasswordSetupSubmit = (e) => {
    e.preventDefault();
    setSetupError("");

    if (!setupSchoolCode.trim() || !setupIndex.trim() || !setupNewPass.trim()) {
      setSetupError("Please fill out all fields.");
      return;
    }

    if (setupNewPass.trim() !== setupConfirmPass.trim()) {
      setSetupError("Passwords do not match. Please check and re-type.");
      return;
    }

    const res = createStudentCustomPassword(
      setupSchoolCode,
      setupIndex,
      setupNewPass
    );

    if (!res.success) {
      setSetupError(res.message);
    } else {
      setShowPasswordSetupModal(false);
      setSchoolCode(setupSchoolCode);
      setIndexNumber(setupIndex);
      setPasswordInput(setupNewPass);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Title & Terminal Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Vote className="w-3.5 h-3.5" /> Tablet Voting Terminal • Polling Grounds
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 font-display">
          Student <span className="gradient-text-gold">Tablet Voting Booth</span>
        </h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          Enter your <strong>Election Code</strong>, <strong>Student Index Number</strong>, and the <strong>One-Time Password (OTP)</strong> issued to you at the Electoral Officer desk.
        </p>
      </div>

      {/* Terminal Login Card */}
      <div className="glass-panel p-6 lg:p-8 shadow-2xl relative border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unique Election Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>1. Election Code</span>
              <span className="text-[10px] text-amber-400 font-normal">Provided on voting slip</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3.5 w-5 h-5 text-amber-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. ACH-2026, BWK-2026, or GAV-2026"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="form-input pl-11 font-mono uppercase font-bold text-amber-400 tracking-wider text-xs"
              />
            </div>
            {/* Quick Election Code Chips */}
            {elections?.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Quick Code:</span>
                {elections.slice(0, 3).map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => setSchoolCode(el.code)}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                      schoolCode.toUpperCase() === el.code.toUpperCase()
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {el.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student Index Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Student Index Number
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 101001001"
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                className="form-input pl-11 font-mono tracking-wider font-bold text-white text-sm"
              />
            </div>
          </div>

          {/* One-Time Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. One-Time Password (OTP)
              </label>
              {onOpenOfficerDesk && (
                <button
                  type="button"
                  onClick={onOpenOfficerDesk}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Need OTP? Go to Officer Desk
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP (e.g. 829410)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input pl-11 font-mono tracking-widest text-base font-bold text-emerald-400"
                maxLength={10}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Generated by the Electoral Officer at the accreditation desk when you present your Index &amp; Level.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5">Authentication Error</div>
                <div>{errorMsg}</div>

                {alreadyVotedInfo && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-red-500/20 text-[11px] space-y-1 text-slate-200">
                    <div className="flex items-center gap-1 font-bold text-red-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400" /> Recorded Ballot Receipt:
                    </div>
                    <div>Voter: {alreadyVotedInfo.fullName}</div>
                    <div>Receipt Hash: <span className="font-mono text-amber-400">{alreadyVotedInfo.verificationCode}</span></div>
                    <div className="text-[10px] text-slate-400">Each student may cast exactly one ballot.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn-primary py-3.5 text-base justify-center font-bold tracking-wide shadow-lg shadow-emerald-950 mt-2"
          >
            <span>Verify OTP &amp; Unlock Ballot</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Single-Use Token Security Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Single-Use Token Security</span>
          </div>
        </div>
      </div>

      {/* First-Time Password Creation Modal */}
      {showPasswordSetupModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowPasswordSetupModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-md w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">Create Private Password</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Set your personal password to protect your account.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordSetupModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form with Scrollable Body and Pinned Footer */}
            <form onSubmit={handlePasswordSetupSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs custom-modal-scroll">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    School Election Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACH-2026 or PRM-2026"
                    value={setupSchoolCode}
                    onChange={(e) => setSetupSchoolCode(e.target.value)}
                    className="form-input font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Student Index Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 101001001"
                    value={setupIndex}
                    onChange={(e) => setSetupIndex(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Your New Private Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create private password"
                    value={setupNewPass}
                    onChange={(e) => setSetupNewPass(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase mb-1">
                    Confirm Private Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter private password"
                    value={setupConfirmPass}
                    onChange={(e) => setSetupConfirmPass(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                </div>

                {setupError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {setupError}
                  </div>
                )}
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordSetupModal(false)}
                  className="btn-secondary text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs sm:text-sm font-bold">
                  Set My Private Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
