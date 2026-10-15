import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useVoting } from "../../context/VotingContext";
import {
  CheckCircle,
  ShieldCheck,
  Printer,
  LogOut,
  QrCode,
  Building2,
  Award,
  Sparkles,
  Clock,
  ArrowRight
} from "lucide-react";

export const VoteReceipt = ({ student, receiptData, school }) => {
  const { logout } = useVoting();
  const [secondsLeft, setSecondsLeft] = useState(12);

  useEffect(() => {
    // Trigger celebratory confetti burst on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"],
      });
    } catch (e) {
      // fallback if canvas confetti fails
    }

    // Auto-reset countdown so next student can use tablet
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logout]);

  const verificationCode =
    receiptData?.verificationCode || student?.verificationCode || "GH-VOTE-CONFIRMED";
  const votedAtTime =
    receiptData?.timestamp || student?.votedAt || new Date().toISOString();

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="glass-panel p-6 lg:p-8 shadow-2xl border-slate-700 relative overflow-hidden text-center">
        {/* Decorative Top Accent */}
        <div className="w-full h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 absolute top-0 left-0"></div>

        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 shadow-lg shadow-emerald-950/50">
          <CheckCircle className="w-9 h-9 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
          Ballot Cast Successfully!
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Your votes have been securely recorded into the Electoral Commission database.
        </p>

        {/* Official Printable Receipt Card */}
        <div className="voting-slip-card p-6 rounded-2xl border border-slate-700 text-left space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{school.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Official Prefectural Election 2026</div>
              </div>
            </div>
            <span className="badge badge-live">SEALED</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Voter Name</span>
              <div className="text-slate-900 dark:text-white font-bold">{student.fullName}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Index Number</span>
              <div className="text-amber-600 dark:text-amber-400 font-mono font-bold">{student.indexNumber}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Form / Class</span>
              <div className="text-slate-700 dark:text-slate-300 font-medium">{student.form}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Dormitory House</span>
              <div className="text-slate-700 dark:text-slate-300 font-medium">{student.house}</div>
            </div>
          </div>

          {/* Verification Code Box */}
          <div className="mt-4 p-4 rounded-xl otp-badge-box flex items-center justify-between gap-3">
            <div>
              <div className="otp-code-label text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verification Receipt Code
              </div>
              <div className="text-lg font-mono font-extrabold otp-code-text tracking-widest mt-0.5">
                {verificationCode}
              </div>
              <div className="otp-code-sub text-[10px] mt-1">
                Recorded: {new Date(votedAtTime).toLocaleString()}
              </div>
            </div>

            <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-sm">
              <QrCode className="w-10 h-10 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Tablet Terminal Turnover Banner */}
        <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              Tablet terminal ready for next voter in <strong className="text-white font-mono">{secondsLeft}s</strong>
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Auto-Resetting
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={logout}
            className="btn-primary text-xs py-3 px-5 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold shadow-lg shadow-emerald-950"
          >
            <span>Ready for Next Student</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
