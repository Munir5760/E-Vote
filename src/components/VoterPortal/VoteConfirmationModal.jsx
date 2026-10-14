import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, X } from "lucide-react";

export const VoteConfirmationModal = ({
  positions,
  candidates,
  selections,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-xl w-full p-6 lg:p-8 border-slate-700 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Review & Confirm Ballot</h3>
            <p className="text-xs text-slate-400">Please verify your selections before final submission.</p>
          </div>
        </div>

        {/* Selected Items Summary */}
        <div className="space-y-3 my-6 max-h-72 overflow-y-auto pr-1">
          {positions.map((pos) => {
            const selectedCandId = selections[pos.id];
            const candidate = candidates.find((c) => c.id === selectedCandId);

            return (
              <div
                key={pos.id}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-400">{pos.title}</div>
                  {candidate ? (
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-2 mt-0.5">
                      <span>{candidate.name}</span>
                      <span className="text-[11px] font-normal text-slate-400">("{candidate.alias}")</span>
                    </div>
                  ) : selectedCandId === "ABSTAIN" ? (
                    <div className="text-sm font-bold text-amber-400 mt-0.5">ABSTAINED</div>
                  ) : (
                    <div className="text-sm text-red-400 italic mt-0.5">No Selection Made</div>
                  )}
                </div>

                <div className="text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Note */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 mb-6">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold">Irreversible Action:</span> Once you click "Submit Official Ballot", your vote will be cryptographically sealed into the database and cannot be altered or re-cast.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Make Edits
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600"
          >
            <span>Submit Official Ballot</span>
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
