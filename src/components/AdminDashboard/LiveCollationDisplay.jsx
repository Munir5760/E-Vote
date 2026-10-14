import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Award,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Clock,
  TrendingUp,
  Building2,
  Radio,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";

export const LiveCollationDisplay = ({ onClose }) => {
  const {
    activeSchool,
    activeElection,
    positions,
    candidates,
    voters,
  } = useVoting();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [density, setDensity] = useState("compact"); // 'compact' | 'comfortable'
  const [columnLayout, setColumnLayout] = useState("auto"); // 'auto' | '2' | '3' | '4'
  const [showNotice, setShowNotice] = useState(true);

  // Filter positions and candidates for the active election
  const electionPositions = positions
    .filter((p) => p.electionId === activeElection?.id || (p.schoolId === activeSchool?.id && !p.electionId))
    .sort((a, b) => a.order - b.order);

  const electionCandidates = candidates.filter(
    (c) => c.electionId === activeElection?.id || (c.schoolId === activeSchool?.id && !c.electionId)
  );

  const electionVoters = voters.filter(
    (v) => v.electionId === activeElection?.id || (!v.electionId && v.schoolId === activeSchool?.id)
  );

  const totalVoters = electionVoters.length;
  const votedCount = electionVoters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : "0.0";

  // Calculate live election end countdown
  const calculateRemainingSeconds = () => {
    if (activeElection?.endTime) {
      const endMs = new Date(activeElection.endTime).getTime();
      if (!isNaN(endMs)) {
        return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      }
    }
    return 0;
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateRemainingSeconds);

  useEffect(() => {
    setSecondsLeft(calculateRemainingSeconds());
    const interval = setInterval(() => {
      setSecondsLeft(calculateRemainingSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeElection?.endTime]);

  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return "Voting Concluded";
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const schoolColor = activeSchool?.primaryColor || "#10b981";
  const isElectionEnded = activeElection?.status === "ended";

  // Determine dynamic responsive grid based on number of portfolios
  const getGridColsClass = () => {
    if (columnLayout === "2") return "grid-cols-1 md:grid-cols-2";
    if (columnLayout === "3") return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (columnLayout === "4") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

    const count = electionPositions.length;
    if (count <= 1) return "grid-cols-1 max-w-xl mx-auto";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
    if (count === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (count <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6";
    if (count <= 8) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#070b14] text-white overflow-y-auto flex flex-col justify-between selection:bg-emerald-500 selection:text-white"
      style={{
        backgroundColor: "#060a14",
        backgroundImage: `radial-gradient(circle at 50% -15%, ${schoolColor}25 0%, transparent 60%)`,
        isolation: "isolate",
      }}
    >
      {/* 100% Solid Backdrop Guard to guarantee no underlying screen bleed-through */}
      <div className="fixed inset-0 bg-[#060a14] -z-10 pointer-events-none" />

      {/* Top Collation Broadcast Bar */}
      <header className="border-b border-slate-800 bg-[#0a101f] px-4 py-2.5 md:px-6 md:py-3 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* School & Election Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-slate-900 border-2 flex items-center justify-center overflow-hidden shadow-lg shrink-0"
              style={{ borderColor: schoolColor }}
            >
              {activeSchool?.logo ? (
                <img
                  src={activeSchool.logo}
                  alt={activeSchool?.name || "School"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isElectionEnded ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OFFICIAL CERTIFIED RESULTS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    <Radio className="w-3 h-3 text-red-400" /> LIVE COLLATION FEED
                  </span>
                )}
                <span className="text-[11px] font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                  Code: {activeElection?.code || "N/A"}
                </span>
                <span className="hidden sm:inline-block text-[10px] text-slate-400 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80">
                  {electionPositions.length} {electionPositions.length === 1 ? "Portfolio" : "Portfolios"}
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight mt-0.5">
                {activeSchool?.name} — {activeElection?.title}
              </h1>
              {activeSchool?.motto && (
                <p className="text-[11px] text-slate-400 italic hidden sm:block">"{activeSchool.motto}"</p>
              )}
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex items-center gap-2.5 md:gap-3 flex-wrap">
            {/* Live Voter Turnout */}
            <div className="bg-[#0d1629] border border-slate-800 px-3 py-1.5 rounded-xl text-center shadow-inner">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Turnout
              </div>
              <div className="text-lg md:text-xl font-black text-emerald-400 font-display">
                {turnoutPercent}%
              </div>
            </div>

            {/* Polls Closing / Status Timer */}
            <div className="bg-[#0d1629] border border-slate-800 px-3 py-1.5 rounded-xl text-center shadow-inner">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> {isElectionEnded ? "Status" : "Remaining"}
              </div>
              <div className="text-xs md:text-sm font-mono font-extrabold text-amber-300 mt-0.5">
                {isElectionEnded ? "Collation Sealed" : formatTimer(secondsLeft)}
              </div>
            </div>

            {/* Density Selector */}
            <div className="flex items-center bg-[#070d1a] border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setDensity("compact")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  density === "compact"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Compact View (fits many portfolios on screen)"
              >
                Compact
              </button>
              <button
                onClick={() => setDensity("comfortable")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  density === "comfortable"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Comfortable View"
              >
                Normal
              </button>
            </div>

            {/* Column Layout Selector */}
            <div className="hidden lg:flex items-center bg-[#070d1a] border border-slate-800 rounded-xl p-0.5">
              <span className="text-[9px] font-bold text-slate-500 px-1.5 uppercase">
                <LayoutGrid className="w-3 h-3 inline mr-0.5" />
              </span>
              {["auto", "2", "3", "4"].map((col) => (
                <button
                  key={col}
                  onClick={() => setColumnLayout(col)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    columnLayout === col
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={`${col} Column Grid Layout`}
                >
                  {col === "auto" ? "Auto" : `${col}x`}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Projector Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md"
                >
                  <X className="w-3.5 h-3.5" /> Exit
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Collation Display Area */}
      <main className="max-w-[1920px] mx-auto w-full px-3 py-3 md:px-6 md:py-4 space-y-3 flex-grow">
        {/* Grounds Display Info Notice */}
        {showNotice && (
          <div className="bg-[#0c1427] border border-slate-800/90 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs text-slate-300 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] md:text-xs">
                {isElectionEnded ? (
                  <>
                    <strong className="text-emerald-400 font-bold">Official Certified Results:</strong> Election concluded. Final vote totals and percentage shares are certified.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-300 font-bold">Live Grounds Progress:</strong> Showing live candidate progress visually via green status bars. Certified percentages and totals will be displayed once concluded.
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isElectionEnded ? "bg-emerald-400" : "bg-emerald-400 animate-ping"}`}></span>
                <span>{isElectionEnded ? "Certified Final" : "Live Sync"}</span>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                title="Dismiss Notice to free screen space"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Positions Grid */}
        <div className={`grid gap-3 ${getGridColsClass()}`}>
          {electionPositions.map((pos) => {
            const posCandidates = electionCandidates
              .filter((c) => c.positionId === pos.id)
              .sort((a, b) => b.votes - a.votes);

            const totalVotesForPos = posCandidates.reduce((acc, c) => acc + c.votes, 0);

            return (
              <div
                key={pos.id}
                className="bg-[#0d1527] border border-slate-800/90 rounded-2xl shadow-xl p-3 md:p-3.5 flex flex-col justify-between relative overflow-hidden transition-all"
              >
                {/* Position Title Bar */}
                <div className="border-b border-slate-800/80 pb-2 mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                      Contested Office
                    </span>
                    <h3 className="text-sm md:text-base font-black text-white flex items-center gap-1.5 truncate">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{pos.title}</span>
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                      isElectionEnded
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : totalVotesForPos > 0
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isElectionEnded
                      ? "Complete"
                      : totalVotesForPos > 0
                      ? "In Progress"
                      : "Awaiting Ballots"}
                  </span>
                </div>

                {/* Candidate Progress Cards */}
                <div className={density === "compact" ? "space-y-1.5" : "space-y-2.5"}>
                  {posCandidates.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      No nominated candidates for this position.
                    </div>
                  ) : (
                    posCandidates.map((cand, idx) => {
                      const percentNum =
                        totalVotesForPos > 0
                          ? ((cand.votes / totalVotesForPos) * 100).toFixed(1)
                          : "0.0";
                      const isLeader = idx === 0 && cand.votes > 0;

                      return (
                        <div
                          key={cand.id}
                          className={`rounded-xl border transition-all duration-300 relative ${
                            density === "compact" ? "p-2" : "p-3"
                          } ${
                            isLeader
                              ? "bg-[#0f1d38] border-emerald-500/50 shadow-md shadow-emerald-950/40"
                              : "bg-[#090f1e] border-slate-800/90"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2.5">
                            {/* Candidate Photo & Names */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={cand.photo}
                                alt={cand.name}
                                className={`rounded-lg object-cover border border-slate-700 shadow-sm shrink-0 ${
                                  density === "compact" ? "w-8 h-8 md:w-9 md:h-9" : "w-11 h-11"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs md:text-sm font-bold text-white truncate leading-tight">
                                    {cand.name}
                                  </h4>
                                  {isLeader && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider shrink-0">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                      {isElectionEnded ? "ELECTED" : "LEAD"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate mt-0.5">
                                  {cand.alias && (
                                    <span className="text-amber-400/90 font-medium truncate">
                                      "{cand.alias}"
                                    </span>
                                  )}
                                  {cand.alias && (cand.form || cand.house) && <span>•</span>}
                                  <span className="truncate">
                                    {cand.form} {cand.house ? `(${cand.house})` : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: If Election Ended show % and Votes, otherwise show status indicator */}
                            <div className="text-right shrink-0 pl-1">
                              {isElectionEnded ? (
                                <>
                                  <div className="text-xs md:text-sm font-black font-display tracking-tight text-white flex items-baseline justify-end gap-0.5">
                                    <span className={isLeader ? "text-amber-400" : "text-slate-200"}>
                                      {percentNum}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">%</span>
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-400 leading-tight">
                                    {cand.votes} votes
                                  </div>
                                </>
                              ) : (
                                <div>
                                  {isLeader ? (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 inline-flex items-center gap-1 shadow-sm">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Leading
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5">
                                      Candidate
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Dynamic Green Progress Bar (compact) */}
                          <div
                            className={`w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 ${
                              density === "compact" ? "h-1.5 mt-1.5" : "h-2 mt-2"
                            }`}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 shadow-sm"
                              style={{ width: `${percentNum}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Broadcast Footer */}
      <footer className="border-t border-slate-800 bg-[#0a101f] py-2.5 px-4 md:px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-400 text-[11px] md:text-xs">
              National High School Electoral Commission Certified Live Collation System
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] md:text-[11px] text-slate-400">
            <span>Official Grounds Projector Display</span>
            <span>•</span>
            <span>Cryptographically Verified Ballots</span>
            <span>•</span>
            <span className="font-mono text-amber-400">{activeElection?.code || "N/A"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

