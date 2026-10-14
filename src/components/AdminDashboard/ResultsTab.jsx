import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  TrendingUp,
  Sparkles,
  Users,
  Tv
} from "lucide-react";
import { LiveCollationDisplay } from "./LiveCollationDisplay";

export const ResultsTab = () => {
  const { activeSchool, activeElection, positions, candidates, voters } = useVoting();

  const [selectedClassTab, setSelectedClassTab] = useState("ALL"); // ALL | SHS 1 | SHS 2 | SHS 3
  const [showCollationDisplay, setShowCollationDisplay] = useState(false);

  const schoolPositions = (positions || []).filter(
    (p) => p.electionId === activeElection?.id || (p.schoolId === (activeSchool?.id || "") && !p.electionId)
  );
  const schoolCandidates = (candidates || []).filter(
    (c) => c.electionId === activeElection?.id || (c.schoolId === (activeSchool?.id || "") && !c.electionId)
  );
  const schoolVoters = (voters || []).filter(
    (v) => v.electionId === activeElection?.id || (!v.electionId && v.schoolId === (activeSchool?.id || ""))
  );

  const totalVoters = schoolVoters.length;
  const votedVoters = schoolVoters.filter((v) => v.hasVoted).length;

  // Class turnout metrics
  const shs1Voters = schoolVoters.filter((v) => v.form.includes("1"));
  const shs2Voters = schoolVoters.filter((v) => v.form.includes("2"));
  const shs3Voters = schoolVoters.filter((v) => v.form.includes("3"));

  const shs1Turnout = shs1Voters.filter((v) => v.hasVoted).length;
  const shs2Turnout = shs2Voters.filter((v) => v.hasVoted).length;
  const shs3Turnout = shs3Voters.filter((v) => v.hasVoted).length;

  return (
    <div className="space-y-6">
      {/* Collation Header */}
      <div className="glass-panel p-6 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-live">Live Collation Center</span>
            <h3 className="text-xl font-bold text-white">Certified Results ({activeElection?.title})</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time vote tallies for <strong className="text-amber-400">{activeElection?.title}</strong> (Code: {activeElection?.code}) • Registered Voters: {totalVoters}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCollationDisplay(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md hover:brightness-110 transition-all border border-emerald-400/30"
          >
            <Tv className="w-4 h-4 text-emerald-200" />
            <span>Launch Projector Screen (% Display)</span>
          </button>

          <button onClick={() => window.print()} className="btn-gold text-xs">
            <Printer className="w-4 h-4" /> Print Certified Collation Declaration
          </button>
        </div>
      </div>

      {/* Class Turnout Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            SHS 1 Turnout
          </div>
          <div className="text-2xl font-extrabold text-white font-display">
            {shs1Turnout} / {shs1Voters.length}{" "}
            <span className="text-xs font-normal text-emerald-400">
              ({shs1Voters.length > 0 ? Math.round((shs1Turnout / shs1Voters.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${shs1Voters.length > 0 ? (shs1Turnout / shs1Voters.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            SHS 2 Turnout
          </div>
          <div className="text-2xl font-extrabold text-white font-display">
            {shs2Turnout} / {shs2Voters.length}{" "}
            <span className="text-xs font-normal text-amber-400">
              ({shs2Voters.length > 0 ? Math.round((shs2Turnout / shs2Voters.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${shs2Voters.length > 0 ? (shs2Turnout / shs2Voters.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            SHS 3 Turnout
          </div>
          <div className="text-2xl font-extrabold text-white font-display">
            {shs3Turnout} / {shs3Voters.length}{" "}
            <span className="text-xs font-normal text-purple-400">
              ({shs3Voters.length > 0 ? Math.round((shs3Turnout / shs3Voters.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-purple-500"
              style={{ width: `${shs3Voters.length > 0 ? (shs3Turnout / shs3Voters.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tally by Class */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400 font-bold px-3 uppercase tracking-wider">
          Filter Tally Breakdown:
        </span>
        {["ALL", "SHS 1", "SHS 2", "SHS 3"].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClassTab(cls)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedClassTab === cls
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {cls === "ALL" ? "Overall Total Tally" : `${cls} Class Votes`}
          </button>
        ))}
      </div>

      {/* Position Results Grid */}
      <div className="space-y-6">
        {schoolPositions.map((pos) => {
          const posCandidates = schoolCandidates
            .filter((c) => c.positionId === pos.id)
            .sort((a, b) => {
              const votesA = selectedClassTab === "ALL" ? a.votes : a.classVotes?.[selectedClassTab] || 0;
              const votesB = selectedClassTab === "ALL" ? b.votes : b.classVotes?.[selectedClassTab] || 0;
              return votesB - votesA;
            });

          const totalPosVotes = posCandidates.reduce((acc, c) => {
            const count = selectedClassTab === "ALL" ? c.votes : c.classVotes?.[selectedClassTab] || 0;
            return acc + count;
          }, 0);

          return (
            <div key={pos.id} className="glass-panel p-6 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>{pos.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{pos.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    {totalPosVotes} {selectedClassTab !== "ALL" ? `${selectedClassTab} ` : ""}Votes Cast
                  </div>
                  <div className="text-[10px] text-slate-500">Ballots counted</div>
                </div>
              </div>

              {/* Candidates Results Bars */}
              <div className="space-y-2">
                {posCandidates.map((cand, idx) => {
                  const candidateVotes =
                    selectedClassTab === "ALL"
                      ? cand.votes
                      : cand.classVotes?.[selectedClassTab] || 0;

                  const percent = totalPosVotes > 0 ? Math.round((candidateVotes / totalPosVotes) * 100) : 0;
                  const isWinner = idx === 0 && candidateVotes > 0;

                  return (
                    <div
                      key={cand.id}
                      className={`bg-slate-900/90 p-3 rounded-xl border transition-all ${
                        isWinner
                          ? "border-amber-500/60 bg-amber-950/20 shadow-md"
                          : "border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={cand.photo}
                            alt={cand.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{cand.name}</h5>
                              {isWinner && (
                                <span className="badge badge-live text-[10px] py-0.5">
                                  <Sparkles className="w-3 h-3 text-amber-400" /> ELECTED / LEADER
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2.5 flex-wrap">
                              <span>"{cand.alias}" • {cand.house}</span>
                              {/* Class Tally Pills */}
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                                  SHS 1: {cand.classVotes?.["SHS 1"] || 0}
                                </span>
                                <span className="px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                                  SHS 2: {cand.classVotes?.["SHS 2"] || 0}
                                </span>
                                <span className="px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                                  SHS 3: {cand.classVotes?.["SHS 3"] || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-white font-display">
                            {candidateVotes} <span className="text-xs font-normal text-slate-400">votes</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-400">{percent}%</div>
                        </div>
                      </div>

                      {/* Vote Progress Bar */}
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isWinner
                              ? "bg-gradient-to-r from-amber-500 to-emerald-500"
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

      {showCollationDisplay && (
        <LiveCollationDisplay onClose={() => setShowCollationDisplay(false)} />
      )}
    </div>
  );
};
