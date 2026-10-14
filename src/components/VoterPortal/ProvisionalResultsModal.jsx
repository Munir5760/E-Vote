import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import { X, BarChart3, Award, Sparkles, Building2, ShieldCheck, Users } from "lucide-react";

export const ProvisionalResultsModal = ({ school, onClose }) => {
  const { elections, positions, candidates, voters } = useVoting();

  const schoolElections = elections.filter((e) => e.schoolId === school.id);
  const [selectedElectionId, setSelectedElectionId] = useState(schoolElections[0]?.id);

  const selectedElection = schoolElections.find((e) => e.id === selectedElectionId) || schoolElections[0];

  const [selectedClassTab, setSelectedClassTab] = useState("ALL"); // ALL | SHS 1 | SHS 2 | SHS 3

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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-start justify-center pt-16 pb-12 px-4 overflow-y-auto">
      <div className="glass-panel max-w-2xl w-full border-slate-700 shadow-2xl relative my-auto animate-fadeIn overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="bg-slate-900/95 px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-display">Provisional Election Tally</h3>
                <span className="badge badge-live">LIVE TALLY</span>
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                {school.name} • Session: {selectedElection?.title} ({selectedElection?.code})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Tally View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Election Session Selector Dropdown if multiple elections exist */}
        {schoolElections.length > 1 && (
          <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
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

        <div className="p-6 lg:p-8 space-y-6">
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

          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Class-by-Class Provisional Tally for {school.name}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
