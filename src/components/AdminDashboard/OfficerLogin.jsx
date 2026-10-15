import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  KeyRound,
  ShieldCheck,
  Building2,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export const OfficerLogin = ({ onClose, onLoginSuccess }) => {
  const {
    loginAsOfficer,
    schools,
    activeSchool,
  } = useVoting();

  // School Code is completely optional / non-compulsory
  const [schoolCode, setSchoolCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSuspended(false);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both Officer Username and Password.");
      return;
    }

    const res = loginAsOfficer(username, password, schoolCode);
    if (!res.success) {
      setErrorMsg(res.message);
      if (res.isSuspended) {
        setIsSuspended(true);
      }
    } else {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center mb-6 space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto shadow-lg shadow-teal-950/40">
          <KeyRound className="w-8 h-8 text-teal-500 dark:text-teal-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          EC Officer Polling Desk Sign In
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Recruited Electoral Commission Polling Officers can authenticate directly with their
          credentials. School code is optional and will auto-detect from your assigned officer account.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="glass-panel p-6 sm:p-8 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* School Code Input (Non-compulsory / Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              <span>Assigned School Code</span>
            </label>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              Optional — or auto-detect
            </span>
          </div>

          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 dark:text-teal-400 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. BSEC-2026, ACH-2026 (Optional)"
              value={schoolCode}
              onChange={(e) => {
                setSchoolCode(e.target.value);
                setErrorMsg("");
                setIsSuspended(false);
              }}
              className="form-input text-xs py-2.5 pl-10 pr-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500"
              list="registered-school-codes-list"
            />
            {schoolCode && (
              <button
                type="button"
                onClick={() => setSchoolCode("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-1"
                title="Clear school code"
              >
                ✕
              </button>
            )}
            <datalist id="registered-school-codes-list">
              {(schools || []).map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </datalist>
          </div>

          {/* Quick School Code Chips */}
          {(schools || []).length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Available Codes:
              </span>
              {schools.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSchoolCode(s.code || "")}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                    schoolCode.trim().toUpperCase() === (s.code || "").toUpperCase()
                      ? "bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/50"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {s.code}
                </button>
              ))}
              {schoolCode && (
                <button
                  type="button"
                  onClick={() => setSchoolCode("")}
                  className="text-[10px] text-slate-500 hover:text-rose-500 underline ml-1"
                >
                  Clear (Auto-detect)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs animate-shake ${
              isSuspended
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-bold">{isSuspended ? "ACCOUNT ACCESS SUSPENDED" : "Authentication Failed"}</p>
              <p className="text-[11px] mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              <span>Officer Username / Recruited ID</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1427094 or officer1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input text-sm py-2.5 px-3.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span>Station Password / PIN</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Default given by EC Admin
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-sm py-2.5 pl-3.5 pr-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-950 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In to Accreditation Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Only officially recruited polling station personnel can issue student OTPs.
            School code is optional. All OTP issuances and ballot accreditations are digitally stamped with your officer ID.
          </p>
        </div>

        {onClose && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              Return to Student Voting Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
