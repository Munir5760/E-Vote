import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import { ShieldCheck, ArrowRight, X } from "lucide-react";

export const AdminLogin = ({ onClose }) => {
  const { loginAsAdmin, schools } = useVoting();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [targetSchoolId, setTargetSchoolId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [highlightSchoolSelect, setHighlightSchoolSelect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setHighlightSchoolSelect(false);

    const res = loginAsAdmin(username, password, targetSchoolId);
    if (!res.success) {
      setErrorMsg(res.message);
      if (res.requiresSchoolSelection) {
        setHighlightSchoolSelect(true);
      }
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 lg:p-8 border-slate-700 shadow-2xl relative animate-fadeIn">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight font-display">
            Administrative Access
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Log in as School Electoral Commissioner or Platform Developer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target School Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Target School / Tenant</span>
              <span className="text-[10px] text-amber-400 font-normal lowercase">(isolates shared usernames)</span>
            </label>
            <select
              value={targetSchoolId}
              onChange={(e) => {
                setTargetSchoolId(e.target.value);
                setErrorMsg("");
                setHighlightSchoolSelect(false);
              }}
              className={`form-input text-xs ${
                highlightSchoolSelect
                  ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50 animate-pulse"
                  : ""
              }`}
            >
              <option value="">-- All Schools / Auto-Detect Tenant --</option>
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name} (Code: {sch.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              placeholder="e.g. admin or admin_ach"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input font-mono"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-gold py-3 text-sm justify-center font-bold"
          >
            <span>Authenticate to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
