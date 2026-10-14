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
  Vote,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";

export const OfficerLogin = ({ onClose, onLoginSuccess }) => {
  const {
    loginAsOfficer,
    schools,
    activeSchool,
    showToast,
  } = useVoting();

  const [selectedSchoolId, setSelectedSchoolId] = useState(
    activeSchool?.id || (schools && schools.length > 0 ? schools[0].id : "")
  );

  React.useEffect(() => {
    if (activeSchool?.id) {
      setSelectedSchoolId(activeSchool.id);
    } else if (schools && schools.length > 0) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [activeSchool?.id, schools]);

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

    const res = loginAsOfficer(username, password, selectedSchoolId);
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
          <KeyRound className="w-8 h-8 text-teal-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          EC Officer Polling Desk Sign In
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Recruited Electoral Commission Polling Officers must authenticate with the
          credentials and default password issued by the School Electoral Commissioner.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 shadow-2xl space-y-6">
        {/* School Target Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Assigned School Institution</span>
          </label>
          <select
            value={selectedSchoolId}
            onChange={(e) => {
              setSelectedSchoolId(e.target.value);
              setActiveSchoolId(e.target.value);
              setErrorMsg("");
              setIsSuspended(false);
            }}
            className="form-input text-xs py-2.5 px-3 bg-slate-900 border-slate-700 text-white font-medium"
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
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
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Officer Username / Recruited ID</span>
            </label>
            <input
              type="text"
              placeholder="e.g. officer1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input text-sm py-2.5 px-3.5 bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Station Password / PIN</span>
              </label>
              <span className="text-[10px] text-slate-400">
                Default given by EC Admin
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-sm py-2.5 pl-3.5 pr-10 bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Only officially recruited polling station personnel can issue student OTPs.
            All OTP issuances and ballot accreditations are digitally stamped with your officer ID.
          </p>
        </div>

        {onClose && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
            >
              Return to Student Voting Terminal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
