import React, { useState, useMemo } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  KeyRound,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  RefreshCw,
  Users,
  Vote,
  Clock,
  Sparkles,
  Wifi,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Lock,
  LogOut,
  Key,
  ShieldAlert
} from "lucide-react";

export const PollingStationPortal = ({ onOpenTabletMode }) => {
  const {
    activeSchool,
    elections,
    activeElection,
    activeElectionId,
    setActiveElectionId,
    voters,
    generateVoterOtp,
    revokeVoterOtp,
    showToast,
    currentUser,
    logout,
    officers,
    changeOfficerPassword,
  } = useVoting();

  const [stationName, setStationName] = useState(currentUser?.officerDesk || "Station Desk 1");
  const [isEditingStation, setIsEditingStation] = useState(false);

  // Officer Change Password Modal
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [changePassError, setChangePassError] = useState("");

  // Fast Student Accreditation inputs
  const [lookupIndex, setLookupIndex] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL"); // ALL | SHS 1 | SHS 2 | SHS 3

  // Active generated OTP modal or banner
  const [issuedSlip, setIssuedSlip] = useState(null);

  // Register Search & Filter
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState("ALL"); // ALL | PENDING_OTP | ACTIVE_OTP | VOTED
  const [tableLevelFilter, setTableLevelFilter] = useState("ALL");

  const schoolElections = elections.filter((e) => e.schoolId === activeSchool?.id);

  // Check if current logged in officer is suspended
  const currentOfficer = (officers || []).find((o) => o.id === currentUser?.officerId);
  const isSuspendedOfficer = currentUser?.role === "officer" && currentOfficer?.status === "suspended";

  // Filter voters for active election
  const currentElectionVoters = useMemo(() => {
    if (!activeElection) return [];
    return voters.filter(
      (v) => v.electionId === activeElection.id || (!v.electionId && v.schoolId === activeSchool?.id)
    );
  }, [voters, activeElection, activeSchool?.id]);

  // Statistics
  const totalRegistered = currentElectionVoters.length;
  const votedCount = currentElectionVoters.filter((v) => v.hasVoted).length;
  const activeOtpCount = currentElectionVoters.filter((v) => !v.hasVoted && v.activeOtp).length;
  const pendingCount = currentElectionVoters.filter((v) => !v.hasVoted && !v.activeOtp).length;
  const turnoutPercent = totalRegistered > 0 ? ((votedCount / totalRegistered) * 100).toFixed(1) : "0.0";

  // Fast lookup matched student
  const matchedStudent = useMemo(() => {
    const clean = lookupIndex.trim().toLowerCase();
    if (!clean || !activeElection) return null;

    return currentElectionVoters.find((v) => {
      const matchIndex = v.indexNumber.toLowerCase() === clean;
      const matchLevel =
        selectedLevel === "ALL" ||
        v.form.toLowerCase().includes(selectedLevel.toLowerCase());
      return matchIndex && matchLevel;
    }) || currentElectionVoters.find((v) => v.indexNumber.toLowerCase() === clean);
  }, [lookupIndex, selectedLevel, currentElectionVoters, activeElection]);

  // Generate OTP handler
  const handleGenerateOtp = (student) => {
    if (!student) return;
    if (isSuspendedOfficer) {
      showToast("ACCESS DENIED: Your EC Officer account has been suspended by the Electoral Commissioner.", "error");
      return;
    }
    const effectiveDesk = currentUser?.officerDesk || stationName;
    const res = generateVoterOtp(student.id, effectiveDesk);
    if (res.success) {
      setIssuedSlip({
        student: res.student,
        otp: res.otp,
        election: activeElection,
        issuedAt: new Date(),
      });
    } else {
      showToast(res.message, "error");
    }
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setChangePassError("");
    if (!currentPassInput || !newPassInput || !confirmPassInput) {
      setChangePassError("Please fill out all password fields.");
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setChangePassError("New passwords do not match. Please re-enter.");
      return;
    }
    const res = changeOfficerPassword(currentUser?.officerId, currentPassInput, newPassInput);
    if (!res.success) {
      setChangePassError(res.message);
    } else {
      setShowChangePassModal(false);
      setCurrentPassInput("");
      setNewPassInput("");
      setConfirmPassInput("");
    }
  };

  const handleCopyOtp = (otp) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(otp);
      showToast(`Copied OTP ${otp} to clipboard!`, "success");
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Filtered table voters
  const filteredTableVoters = useMemo(() => {
    return currentElectionVoters.filter((v) => {
      const matchSearch =
        !tableSearch ||
        v.fullName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        v.indexNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
        v.house?.toLowerCase().includes(tableSearch.toLowerCase());

      const matchLevel =
        tableLevelFilter === "ALL" ||
        v.form.toLowerCase().includes(tableLevelFilter.toLowerCase());

      const matchStatus =
        tableStatusFilter === "ALL" ||
        (tableStatusFilter === "VOTED" && v.hasVoted) ||
        (tableStatusFilter === "ACTIVE_OTP" && !v.hasVoted && v.activeOtp) ||
        (tableStatusFilter === "PENDING_OTP" && !v.hasVoted && !v.activeOtp);

      return matchSearch && matchLevel && matchStatus;
    });
  }, [currentElectionVoters, tableSearch, tableLevelFilter, tableStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Station Control Header Bar */}
      <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-live uppercase tracking-widest text-[10px]">
                OFFICIAL POLLING STATION DESK
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-semibold">Live Multi-Device LAN Sync</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2 font-display">
              <KeyRound className="w-6 h-6 text-amber-400" />
              <span>Voter Accreditation &amp; OTP Station</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accredit students with their Index Number &amp; Level, generate One-Time Passwords (OTP), and authorize tablet ballot access.
            </p>
          </div>

          {/* Session & Station Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Active Election Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">
                Session Target
              </label>
              <select
                value={activeElectionId || ""}
                onChange={(e) => setActiveElectionId(e.target.value)}
                className="bg-transparent font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- Select Election Session --
                </option>
                {schoolElections.map((el) => (
                  <option key={el.id} value={el.id} className="bg-slate-900 text-white">
                    {el.title} ({el.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Station Desk Identifier */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <label className="text-[10px] text-slate-500 font-bold uppercase block">
                Officer Desk ID
              </label>
              {isEditingStation ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs w-32 border border-slate-700 font-bold"
                  />
                  <button
                    onClick={() => setIsEditingStation(false)}
                    className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingStation(true)}
                  className="font-bold text-slate-200 cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1"
                  title="Click to rename desk"
                >
                  <span>{stationName}</span>
                  <span className="text-[10px] text-slate-500">✎</span>
                </div>
              )}
            </div>

            {currentUser?.role === "officer" && (
              <button
                onClick={() => setShowChangePassModal(true)}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md"
                title="Change your election day password"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Change Password</span>
              </button>
            )}

            {onOpenTabletMode && (
              <button
                onClick={onOpenTabletMode}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                title="Launch Student Tablet Terminal"
              >
                <Vote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Launch Tablet Terminal</span>
              </button>
            )}
          </div>
        </div>

        {/* Station Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Total Register
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5 font-display">
              {totalRegistered} <span className="text-xs text-slate-500 font-normal">students</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-400" /> Active OTPs
            </span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5 font-display">
              {activeOtpCount} <span className="text-xs text-slate-500 font-normal">at tablets</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
              <Vote className="w-3 h-3 text-emerald-400" /> Ballots Cast
            </span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-display">
              {votedCount} <span className="text-xs text-emerald-400/70 font-semibold">({turnoutPercent}%)</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/90">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Awaiting OTP
            </span>
            <div className="text-xl font-extrabold text-slate-300 mt-0.5 font-display">
              {pendingCount} <span className="text-xs text-slate-500 font-normal">in queue</span>
            </div>
          </div>
        </div>
      </div>

      {isSuspendedOfficer && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3 animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">OFFICER ACCOUNT SUSPENDED BY ELECTORAL COMMISSIONER</p>
            <p className="text-[11px] text-rose-300/90 mt-0.5">
              Your accreditation credentials have been temporarily deactivated. You cannot issue OTPs to students.
            </p>
          </div>
        </div>
      )}

      {!activeElection ? (
        <div className="glass-panel p-10 border-slate-800 text-center space-y-4 max-w-2xl mx-auto animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Vote className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Please Select an Election Session
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Before accrediting students or generating One-Time Passwords (OTPs), please select an active election session from the <strong>Session Target</strong> dropdown above.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {schoolElections.map((el) => (
              <button
                key={el.id}
                onClick={() => setActiveElectionId(el.id)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500/50 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2"
              >
                <span>{el.title}</span>
                <span className="font-mono text-[10px] text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">
                  {el.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Main Split Grid: Fast Accreditation Workstation & Live Register */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Verification & OTP Generation Workstation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Student Accreditation</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Code: {activeElection?.code}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Ask the student to state their <strong>Index Number</strong> and <strong>Level / Form</strong>. Enter details below to authenticate:
            </p>

            {/* Level Selector Tabs */}
            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                1. Student Level / Form
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {["ALL", "SHS 1", "SHS 2", "SHS 3"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLevel === lvl
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Index Number Input */}
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>2. Student Index Number</span>
                {lookupIndex && (
                  <button
                    onClick={() => setLookupIndex("")}
                    className="text-slate-400 hover:text-white text-[10px] flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-amber-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. 101001001"
                  value={lookupIndex}
                  onChange={(e) => setLookupIndex(e.target.value)}
                  className="form-input pl-11 font-mono text-base font-bold tracking-wider text-white bg-slate-950 border-slate-700"
                  autoFocus
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Type index number or scan student barcode.
              </span>
            </div>

            {/* Verification Result Card */}
            {matchedStudent ? (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  matchedStudent.hasVoted
                    ? "bg-red-950/20 border-red-500/40"
                    : matchedStudent.activeOtp
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-slate-900 border-emerald-500/40 shadow-lg"
                }`}
              >
                {/* Status Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Accreditation Status
                  </span>
                  {matchedStudent.hasVoted ? (
                    <span className="badge badge-ended text-[10px] px-2 py-0.5">
                      <AlertCircle className="w-3 h-3 text-red-400" /> ALREADY VOTED
                    </span>
                  ) : matchedStudent.activeOtp ? (
                    <span className="badge badge-live text-[10px] px-2 py-0.5 text-amber-300 border-amber-500/40">
                      <KeyRound className="w-3 h-3 text-amber-400" /> OTP ACTIVE
                    </span>
                  ) : (
                    <span className="badge badge-live text-[10px] px-2 py-0.5 text-emerald-300 border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ELIGIBLE TO VOTE
                    </span>
                  )}
                </div>

                {/* Student Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-base font-black text-white">
                    {matchedStudent.fullName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Index Number</span>
                      <span className="font-mono text-amber-400 font-bold">{matchedStudent.indexNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Level / Class</span>
                      <span className="text-slate-200 font-bold">{matchedStudent.form}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">House</span>
                      <span className="text-slate-300">{matchedStudent.house}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Election Code</span>
                      <span className="font-mono text-emerald-400 font-bold">{activeElection?.code}</span>
                    </div>
                  </div>
                </div>

                {/* Already Voted Alert */}
                {matchedStudent.hasVoted && (
                  <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" /> Duplicate Voting Blocked
                    </div>
                    <div>Voted at: {new Date(matchedStudent.votedAt).toLocaleString()}</div>
                    <div className="font-mono text-[10px] text-amber-400">Receipt: {matchedStudent.verificationCode}</div>
                  </div>
                )}

                {/* Active OTP Card if already issued */}
                {!matchedStudent.hasVoted && matchedStudent.activeOtp && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Active One-Time Password
                    </span>
                    <div className="text-2xl font-mono font-black text-amber-300 tracking-widest flex items-center justify-center gap-2">
                      <span>{matchedStudent.activeOtp}</span>
                      <button
                        onClick={() => handleCopyOtp(matchedStudent.activeOtp)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy OTP"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Issued {new Date(matchedStudent.otpCreatedAt || Date.now()).toLocaleTimeString()} by {matchedStudent.otpIssuedBy || "Station"}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  {matchedStudent.hasVoted ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Ballot Already Sealed</span>
                    </button>
                  ) : matchedStudent.activeOtp ? (
                    <>
                      <button
                        onClick={() => handleGenerateOtp(matchedStudent)}
                        className="flex-1 btn-secondary text-xs py-2 justify-center font-bold text-amber-300"
                        title="Re-generate new OTP if student lost the previous one"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-Issue OTP
                      </button>
                      <button
                        onClick={() => {
                          setIssuedSlip({
                            student: matchedStudent,
                            otp: matchedStudent.activeOtp,
                            election: activeElection,
                            issuedAt: new Date(matchedStudent.otpCreatedAt || Date.now()),
                          });
                        }}
                        className="flex-1 btn-primary text-xs py-2 justify-center font-bold"
                      >
                        <Printer className="w-3.5 h-3.5" /> Show / Print Slip
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleGenerateOtp(matchedStudent)}
                      className="w-full btn-primary py-3 justify-center text-sm font-bold shadow-lg shadow-emerald-950 flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Generate One-Time Password (OTP)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : lookupIndex ? (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                <div className="font-bold text-white mb-1">Index Not Found</div>
                <div>No registered voter with Index '{lookupIndex}' in '{activeElection?.title}'.</div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Please verify the student index number or check if the student belongs to another election session.
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                <KeyRound className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                <div>Awaiting student index number...</div>
                <div className="text-[10px]">Enter index number above to authenticate and issue voting OTP.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Accreditation Register Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1222] border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Accreditation Queue &amp; Register</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredTableVoters.length} of {totalRegistered} registered voters.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level Filter */}
                <select
                  value={tableLevelFilter}
                  onChange={(e) => setTableLevelFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg font-bold"
                >
                  <option value="ALL">All Levels</option>
                  <option value="SHS 1">SHS 1</option>
                  <option value="SHS 2">SHS 2</option>
                  <option value="SHS 3">SHS 3</option>
                </select>

                {/* Status Filter */}
                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg font-bold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_OTP">Pending OTP</option>
                  <option value="ACTIVE_OTP">Active OTP</option>
                  <option value="VOTED">Voted</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search voter by name, index number, or house..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="form-input pl-9 text-xs py-2 bg-slate-900 border-slate-800"
              />
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900/90 sticky top-0 z-10 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Index / Level</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTableVoters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                        No voter records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTableVoters.map((vtr) => (
                      <tr
                        key={vtr.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white leading-tight">
                            {vtr.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {vtr.house}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono">
                          <div className="text-amber-400 font-bold">
                            {vtr.indexNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {vtr.form}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          {vtr.hasVoted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Voted
                            </span>
                          ) : vtr.activeOtp ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <KeyRound className="w-2.5 h-2.5 text-amber-400" /> OTP: {vtr.activeOtp}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Awaiting OTP
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          {vtr.hasVoted ? (
                            <span className="text-[10px] text-slate-500 italic">
                              Ballot Sealed
                            </span>
                          ) : vtr.activeOtp ? (
                            <button
                              onClick={() => {
                                setLookupIndex(vtr.indexNumber);
                                setIssuedSlip({
                                  student: vtr,
                                  otp: vtr.activeOtp,
                                  election: activeElection,
                                  issuedAt: new Date(vtr.otpCreatedAt || Date.now()),
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-all"
                            >
                              View Slip
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLookupIndex(vtr.indexNumber);
                                handleGenerateOtp(vtr);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[10px] font-bold transition-all"
                            >
                              Issue OTP
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Official Voting Slip Modal (Ready for printing or handing to student) */}
      {issuedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1222] border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIssuedSlip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Slip Printable Area */}
            <div id="printable-voting-slip" className="text-left bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
              <div className="border-b border-slate-800 pb-3 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  GHANA SHS ELECTORAL COMMISSION
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  Official One-Time Ballot Passcode
                </div>
                <div className="text-[10px] text-slate-400">
                  {issuedSlip.election?.title} ({issuedSlip.election?.code})
                </div>
              </div>

              {/* Student Identification */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Voter Name</span>
                  <span className="font-bold text-white">{issuedSlip.student?.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Index Number</span>
                  <span className="font-mono text-amber-400 font-bold">{issuedSlip.student?.indexNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Level / Class</span>
                  <span className="text-slate-300">{issuedSlip.student?.form}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Station Desk</span>
                  <span className="text-slate-300">{stationName}</span>
                </div>
              </div>

              {/* The OTP Big Card */}
              <div className="bg-[#0a152d] border-2 border-emerald-500/60 rounded-xl p-4 text-center">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold block">
                  ONE-TIME PASSWORD (OTP)
                </span>
                <div className="text-3xl font-mono font-black text-white tracking-widest mt-1 flex items-center justify-center gap-2">
                  <span>{issuedSlip.otp}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Valid for exactly 1 ballot submission on any tablet.
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">How to cast your vote:</div>
                <div>1. Walk to any open voting tablet.</div>
                <div>2. Enter Election Code: <strong className="text-amber-400 font-mono">{issuedSlip.election?.code}</strong></div>
                <div>3. Enter Index Number: <strong className="text-white font-mono">{issuedSlip.student?.indexNumber}</strong></div>
                <div>4. Enter OTP: <strong className="text-emerald-400 font-mono">{issuedSlip.otp}</strong></div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => handleCopyOtp(issuedSlip.otp)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Code</span>
              </button>

              <button
                onClick={handlePrintSlip}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print Slip</span>
              </button>

              <button
                onClick={() => {
                  setIssuedSlip(null);
                  setLookupIndex("");
                }}
                className="btn-primary text-xs py-2 px-4 font-bold"
              >
                <span>Ready for Next Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICER CHANGE PASSWORD MODAL */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 border-slate-700 shadow-2xl space-y-4 animate-fadeIn relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  Change Election Day Password
                </h3>
              </div>
              <button
                onClick={() => setShowChangePassModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Update your EC Officer password for today's voting session.
            </p>

            {changePassError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Current Password / Default PIN
                </label>
                <input
                  type="password"
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  New Private Password (min 4 chars)
                </label>
                <input
                  type="password"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="form-input text-xs py-2 px-3 bg-slate-900 border-slate-700 text-white w-full"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs px-4 py-2 font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
