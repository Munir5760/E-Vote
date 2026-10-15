import React, { useEffect } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, X } from "lucide-react";

export const VoteConfirmationModal = ({
  positions,
  candidates,
  selections,
  onClose,
  onConfirm,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel modal-surface max-w-xl w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
      >
        {/* Pinned Modal Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 modal-header flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">Review & Confirm Ballot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Please verify your selections before final submission.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-modal-scroll">
          {/* Selected Items Summary */}
          <div className="space-y-2.5">
            {positions.map((pos) => {
              const selectedCandId = selections[pos.id];
              const candidate = candidates.find((c) => c.id === selectedCandId);

              return (
                <div
                  key={pos.id}
                  className="bg-slate-50 dark:bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{pos.title}</div>
                    {candidate ? (
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mt-0.5">
                        <span>{candidate.name}</span>
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">("{candidate.alias}")</span>
                      </div>
                    ) : selectedCandId === "ABSTAIN" ? (
                      <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">ABSTAINED</div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400 italic mt-0.5">No Selection Made</div>
                    )}
                  </div>

                  <div className="text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning Note */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Irreversible Action:</span> Once you click "Submit Official Ballot", your vote will be cryptographically sealed into the database and cannot be altered or re-cast.
            </div>
          </div>
        </div>

        {/* Pinned Modal Footer */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 modal-footer flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary text-xs sm:text-sm">
            Make Edits
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center gap-2"
          >
            <span>Submit Official Ballot</span>
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
