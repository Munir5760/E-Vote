import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import { ShieldCheck, ArrowRight, X } from "lucide-react";

export const AdminLogin = ({ onClose }) => {
  const { loginAsAdmin } = useVoting();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const res = loginAsAdmin(username, password, schoolCode);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      if (onClose) onClose();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={() => onClose && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel modal-surface max-w-md w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col p-6 lg:p-8 border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-y-auto custom-modal-scroll"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
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
          {/* School Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>School Code</span>
              <span className="text-[10px] text-amber-400 font-normal lowercase">(e.g. ACH-2026 / leave empty for Developer)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ACH-2026 or PRM-2026"
              value={schoolCode}
              onChange={(e) => {
                setSchoolCode(e.target.value);
                setErrorMsg("");
              }}
              className="form-input text-xs font-mono uppercase tracking-wider"
              autoCapitalize="characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              placeholder="e.g. admin or developer"
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
