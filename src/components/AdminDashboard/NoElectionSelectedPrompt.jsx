import React from "react";
import { Vote, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { useVoting } from "../../context/VotingContext";

export const NoElectionSelectedPrompt = ({ onOpenNewElectionModal }) => {
  const {
    activeSchool,
    elections,
    setActiveElectionId,
    positions,
    candidates,
    voters,
  } = useVoting();

  const schoolElections = (elections || []).filter((e) => e.schoolId === (activeSchool?.id || ""));

  return (
    <div className="glass-panel p-8 border-slate-800 text-center max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg">
        <Vote className="w-8 h-8 text-amber-400" />
      </div>

      <div className="max-w-xl mx-auto space-y-2">
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          No Election Session Selected
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please select an election session from the dropdown above or choose from the
          available election sessions for{" "}
          <strong className="text-amber-400">{activeSchool?.name || "School"}</strong> below to manage
          candidates, voters, and results.
        </p>
      </div>

      {schoolElections.length === 0 ? (
        <div className="p-6 bg-slate-900/60 rounded-xl border border-dashed border-slate-700 text-xs text-slate-400 max-w-md mx-auto space-y-3">
          <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
          <p>No election sessions have been created for {activeSchool?.name || "School"} yet.</p>
          {onOpenNewElectionModal && (
            <button
              onClick={onOpenNewElectionModal}
              className="btn-gold text-xs px-4 py-2 mx-auto flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Election Session</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Sessions ({schoolElections.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Click any session to open & activate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schoolElections.map((elec) => {
              const elecPosCount = positions.filter((p) => p.electionId === elec.id).length;
              const elecCandCount = candidates.filter((c) => c.electionId === elec.id).length;
              const elecVoterCount = voters.filter((v) => v.electionId === elec.id).length;

              return (
                <div
                  key={elec.id}
                  onClick={() => setActiveElectionId(elec.id)}
                  className="bg-slate-900/80 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col justify-between gap-3 shadow-md hover:shadow-emerald-950/20"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                        {elec.title}
                      </h4>
                      <span className="font-mono text-[10px] bg-slate-950 text-amber-400 border border-slate-700 px-2 py-0.5 rounded-full shrink-0">
                        {elec.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {elec.description || `${elec.type} election`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-white">{elecPosCount}</strong> roles
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-white">{elecCandCount}</strong> candidates
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-white">{elecVoterCount}</strong> voters
                      </span>
                    </div>

                    <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Select
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {onOpenNewElectionModal && schoolElections.length > 0 && (
        <div className="pt-2">
          <button
            onClick={onOpenNewElectionModal}
            className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Another Election Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
