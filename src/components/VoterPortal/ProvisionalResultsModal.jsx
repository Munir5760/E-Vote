import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import { X, BarChart3, Award, Sparkles, Building2, ShieldCheck, Users } from "lucide-react";

export const ProvisionalResultsModal = ({ school, onClose }) => {
  const { elections, positions, candidates, voters } = useVoting();

  const schoolElections = elections.filter((e) => e.schoolId === school.id);
  const [selectedElectionId, setSelectedElectionId] = useState(schoolElections[0]?.id);

  const selectedElection = schoolElections.find((e) => e.id === selectedElectionId) || schoolElections[0];

  const [selectedClassTab, setSelectedClassTab] = useState("ALL"); // ALL | SHS 1 | SHS 2 | SHS 3

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

  // Strictly filter by this specific selected election
  const schoolPositions = positions.filter(
    (p) => p.electionId === selectedElection?.id || (p.schoolId === school.id && !p.electionId)
  );
  const schoolCandidates = candidates.filter(
    (c) => c.electionId === selectedElection?.id || (c.schoolId === school.id && !c.electionId)
  );
  const schoolVoters = voters.filter(
    (v) => v.electionId === selectedElection?.id || (!v.electionId && v.schoolId === school.id)
  );

  const totalVoters = schoolVoters.length;
  const votedCount = schoolVoters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  // Class turnout metrics
  const shs1Voters = schoolVoters.filter((v) => v.form.includes("1"));
  const shs2Voters = schoolVoters.filter((v) => v.form.includes("2"));
  const shs3Voters = schoolVoters.filter((v) => v.form.includes("3"));

  const shs1Turnout = shs1Voters.filter((v) => v.hasVoted).length;
  const shs2Turnout = shs2Voters.filter((v) => v.hasVoted).length;
  const shs3Turnout = shs3Voters.filter((v) => v.hasVoted).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel max-w-2xl w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
      >
        {/* Pinned Modal Top Header Bar */}
        <div className="shrink-0 bg-slate-900/95 px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">Provisional Election Tally</h3>
                <span className="badge badge-live text-[10px]">LIVE TALLY</span>
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-0.5 truncate max-w-xs sm:max-w-md">
                {school.name} • {selectedElection?.title} ({selectedElection?.code})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Election Session Selector Dropdown if multiple elections exist */}
        {schoolElections.length > 1 && (
          <div className="shrink-0 bg-slate-950 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              Select Election Session:
            </span>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="form-input text-xs py-1 px-3 bg-slate-900 border-slate-700 text-amber-400 font-bold w-auto"
            >
              {schoolElections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-modal-scroll">
          {/* Class Turnout Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">SHS 1 Turnout</div>
              <div className="text-base font-extrabold text-white mt-0.5 font-display">
                {shs1Turnout} / {shs1Voters.length}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">SHS 2 Turnout</div>
              <div className="text-base font-extrabold text-white mt-0.5 font-display">
                {shs2Turnout} / {shs2Voters.length}
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">SHS 3 Turnout</div>
              <div className="text-base font-extrabold text-white mt-0.5 font-display">
                {shs3Turnout} / {shs3Voters.length}
              </div>
            </div>
          </div>

          {/* Class Breakdown Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {["ALL", "SHS 1", "SHS 2", "SHS 3"].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClassTab(cls)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedClassTab === cls
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cls === "ALL" ? "Overall Total" : cls}
              </button>
            ))}
          </div>

          {/* Positions Tally List */}
          <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
            {schoolPositions.map((pos) => {
              const posCandidates = schoolCandidates
                .filter((c) => c.positionId === pos.id)
                .sort((a, b) => {
                  const votesA = selectedClassTab === "ALL" ? a.votes : a.classVotes?.[selectedClassTab] || 0;
                  const votesB = selectedClassTab === "ALL" ? b.votes : b.classVotes?.[selectedClassTab] || 0;
                  return votesB - votesA;
                });

              const totalVotes = posCandidates.reduce((sum, c) => {
                const count = selectedClassTab === "ALL" ? c.votes : c.classVotes?.[selectedClassTab] || 0;
                return sum + count;
              }, 0);

              return (
                <div key={pos.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> {pos.title}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {totalVotes} {selectedClassTab !== "ALL" ? `${selectedClassTab} ` : ""}Votes
                    </span>
                  </div>

                  <div className="space-y-3">
                    {posCandidates.map((cand, idx) => {
                      const candidateVotes =
                        selectedClassTab === "ALL"
                          ? cand.votes
                          : cand.classVotes?.[selectedClassTab] || 0;

                      const percent = totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0;
                      const isLeading = idx === 0 && candidateVotes > 0;

                      return (
                        <div key={cand.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={cand.photo}
                                alt={cand.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700"
                              />
                              <span className="font-bold text-white">{cand.name}</span>
                              <span className="text-[10px] text-slate-400">("{cand.alias}")</span>
                              {isLeading && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                                  Leading
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-emerald-400">
                              {candidateVotes} votes ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full ${
                                isLeading
                                  ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                                  : "bg-slate-600"
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Modal Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Official Class Provisional Tally • {school.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs sm:text-sm px-4 py-2 shrink-0"
          >
            Close Tally
          </button>
        </div>
      </div>
    </div>
  );
};
