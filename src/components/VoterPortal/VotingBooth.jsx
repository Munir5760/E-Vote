import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Vote,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldAlert,
  Sparkles,
  Award,
  BookOpen,
  UserCheck,
  Clock,
  Timer,
  X
} from "lucide-react";
import { VoteConfirmationModal } from "./VoteConfirmationModal";
import { VoteReceipt } from "./VoteReceipt";

export const VotingBooth = () => {
  const {
    activeSchool,
    elections,
    positions,
    candidates,
    currentUser,
    castVote,
  } = useVoting();

  if (!currentUser || currentUser.role !== "voter") {
    return null;
  }

  // Safe references from active voter session
  const student = currentUser.student || {};
  const school = currentUser.school || activeSchool || {};
  const liveElection =
    elections?.find((e) => e.id === currentUser?.electionId) ||
    currentUser.election ||
    {};

  // STRICT ELECTION ISOLATION: Show ONLY positions for THIS logged-in election!
  const targetElectionId = currentUser.electionId;
  const schoolPositions = positions
    .filter((p) => p.electionId === targetElectionId)
    .sort((a, b) => a.order - b.order);

  const schoolCandidates = candidates.filter((c) => c.electionId === targetElectionId);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({}); // { [posId]: candId or 'ABSTAIN' }
  const [showManifestoModal, setShowManifestoModal] = useState(null); // candidate obj
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voteReceiptData, setVoteReceiptData] = useState(null);

  // Calculate live countdown timer from Election End Time set by Admin
  const calculateRemainingSeconds = () => {
    if (liveElection?.endTime) {
      const endMs = new Date(liveElection.endTime).getTime();
      if (!isNaN(endMs)) {
        return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      }
    }
    // Fallback: 8 hours default if not configured
    return 28800;
  };

  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(calculateRemainingSeconds);

  useEffect(() => {
    // Sync initial remaining time
    setSessionSecondsLeft(calculateRemainingSeconds());

    if (student?.hasVoted || voteReceiptData) return;

    const timer = setInterval(() => {
      setSessionSecondsLeft(calculateRemainingSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, [student?.hasVoted, voteReceiptData, liveElection?.endTime]);

  // Auto-submit vote if election schedule reaches 0
  useEffect(() => {
    if (sessionSecondsLeft === 0 && !student?.hasVoted && !voteReceiptData) {
      handleFinalSubmit();
    }
  }, [sessionSecondsLeft]);

  // Close manifesto modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowManifestoModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return "00:00:00 (Voting Closed)";
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
    }
    return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  // If student has already completed voting, display receipt immediately
  if (student?.hasVoted || voteReceiptData) {
    return (
      <VoteReceipt
        student={student}
        receiptData={voteReceiptData}
        school={school}
      />
    );
  }

  if (schoolPositions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="glass-panel p-8 text-slate-400">
          <Info className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Active Positions Configured</h3>
          <p className="text-xs">The Electoral Commission has not added ballot positions for this election yet.</p>
        </div>
      </div>
    );
  }

  const safeStepIndex = Math.min(
    Math.max(0, currentStepIndex),
    Math.max(0, schoolPositions.length - 1)
  );
  const currentPosition = schoolPositions[safeStepIndex] || {};
  const positionCandidates = currentPosition?.id
    ? schoolCandidates.filter((c) => c.positionId === currentPosition.id)
    : [];

  const handleSelectCandidate = (candId) => {
    if (!currentPosition?.id) return;
    setSelections((prev) => ({
      ...prev,
      [currentPosition.id]: candId,
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < schoolPositions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached the end, show review & confirm modal
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const isCurrentPositionSelected = !!(currentPosition?.id && selections[currentPosition.id]);

  const handleFinalSubmit = () => {
    const res = castVote(selections);
    if (res.success) {
      setVoteReceiptData(res);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header Info Bar */}
      <div className="glass-panel p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
            {(school.shortName || school.name || "S").charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{school.name} Prefectural Ballot</h2>
            <p className="text-xs text-slate-400">
              Voter: <span className="text-amber-400 font-semibold">{student.fullName || "Student"}</span> (Index: {student.indexNumber || "N/A"})
            </p>
          </div>
        </div>

        {/* Live Session Timer & Progress Stepper */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              sessionSecondsLeft < 300
                ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
            title="Time remaining till voting closes as set by Electoral Commissioner schedule"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Polls Close In: {formatTimer(sessionSecondsLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              Position {currentStepIndex + 1} of {schoolPositions.length}
            </span>
            <div className="w-28 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / schoolPositions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Title & Description */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-live">Official Ballot</span>
          <span className="text-xs text-slate-400">Select ONE candidate</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">
          {currentPosition.title}
        </h3>
        <p className="text-sm text-slate-400 mt-1">{currentPosition.description}</p>
      </div>

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {positionCandidates.map((cand) => {
          const isSelected = selections[currentPosition.id] === cand.id;

          return (
            <div
              key={cand.id}
              onClick={() => handleSelectCandidate(cand.id)}
              className={`glass-panel p-5 cursor-pointer relative transition-all duration-200 border-2 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/50 scale-[1.02]"
                  : "border-slate-800/80 hover:border-slate-600 bg-slate-900/60"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Candidate Photo */}
                <div className="relative shrink-0">
                  <img
                    src={cand.photo}
                    alt={cand.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    {cand.house ? cand.house.split(" ")[0] : "HOUSE"}
                  </span>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> "{cand.alias}"
                  </div>
                  <h4 className="text-lg font-bold text-white truncate">{cand.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {cand.form} • <span className="text-slate-300 font-medium">{cand.house || "General House"}</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 italic">
                    "{cand.manifesto}"
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowManifestoModal(cand);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read Full Manifesto
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCandidate(cand.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isSelected ? "Selected" : "Vote Candidate"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Abstain Option if enabled */}
        {(liveElection?.allowAbstain ?? school?.allowAbstain ?? true) && (
          <div
            onClick={() => handleSelectCandidate("ABSTAIN")}
            className={`glass-panel p-5 cursor-pointer flex items-center justify-between border-2 transition-all ${
              selections[currentPosition.id] === "ABSTAIN"
                ? "border-amber-500 bg-amber-950/20"
                : "border-slate-800/80 hover:border-slate-600 bg-slate-900/40"
            }`}
          >
            <div>
              <h4 className="text-base font-bold text-slate-300">Abstain / Skip Position</h4>
              <p className="text-xs text-slate-500">Cast a neutral non-vote for this specific role.</p>
            </div>
            {selections[currentPosition.id] === "ABSTAIN" ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                Abstained
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400">Select Abstain</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="text-xs text-slate-400">
          {isCurrentPositionSelected ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Choice recorded for this position
            </span>
          ) : (
            <span className="text-amber-400">Please pick a candidate or abstain to proceed</span>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isCurrentPositionSelected}
          className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>
            {currentStepIndex === schoolPositions.length - 1
              ? "Review & Submit Ballot"
              : "Next Position"}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>      {/* Candidate Manifesto Modal */}
      {showManifestoModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowManifestoModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-lg w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={showManifestoModal.photo}
                  alt={showManifestoModal.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-slate-700 shrink-0"
                />
                <div>
                  <span className="badge badge-live text-[10px] mb-1">{showManifestoModal.house}</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">{showManifestoModal.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">"{showManifestoModal.alias}"</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManifestoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm text-slate-300 leading-relaxed custom-modal-scroll">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Official Manifesto &amp; Vision Statement
                </div>
                <p className="whitespace-pre-line text-xs sm:text-sm text-slate-200">{showManifestoModal.manifesto}</p>
                {showManifestoModal.motto && (
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-amber-400">
                    Campaign Motto: <span className="text-white font-normal">"{showManifestoModal.motto}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManifestoModal(null)}
                className="btn-secondary text-xs sm:text-sm px-4 py-2"
              >
                Close Manifesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Confirm Modal */}
      {showConfirmModal && (
        <VoteConfirmationModal
          positions={schoolPositions}
          candidates={schoolCandidates}
          selections={selections}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleFinalSubmit}
        />
      )}
    </div>
  );
};
