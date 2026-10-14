import React from "react";
import { useVoting } from "../context/VotingContext";
import {
  Vote,
  ShieldCheck,
  LogOut,
  Lock,
  UserCheck,
  Building2,
  Code,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";

export const Header = ({ onOpenAdminLogin }) => {
  const {
    activeSchool,
    currentUser,
    logout,
    switchToSuperAdmin,
    theme,
    toggleTheme,
  } = useVoting();

  return (
    <header className="no-print sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-amber-500 to-red-500 p-0.5 shadow-lg shadow-emerald-950">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Vote className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display tracking-tight text-white">
                Ghana SHS <span className="gradient-text-gold">E-Vote</span>
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-400">National High School Electoral Commission</p>
          </div>
        </div>

        {/* Right side: Session Controls / Theme Toggle / Log Out Buttons */}
        <div className="flex items-center gap-3">
          {/* Global Light / Dark Theme Toggle for All Users */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px] text-slate-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline text-[11px] text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Electoral Officer Session Header */}
          {currentUser?.role === "officer" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-xl text-teal-300 text-xs font-bold">
                <KeyRound className="w-4 h-4 text-teal-400" />
                <span>Station:</span>
                <span className="text-white font-extrabold">{currentUser.officerDesk || "Polling Desk"}</span>
              </div>

              <button
                onClick={logout}
                className="btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
                title="Log Out Officer Session"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Super Admin Session Header */}
          {currentUser?.role === "super_admin" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl text-purple-300 text-xs font-bold">
                <Code className="w-4 h-4 text-purple-400" /> Platform Developer (Super Admin)
              </div>

              <button
                onClick={logout}
                className="btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
                title="Log Out Super Admin Session"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* School EC Admin Session Header */}
          {currentUser?.role === "school_admin" && (
            <div className="flex items-center gap-3">
              {currentUser?.switchedFromSuperAdmin && (
                <button
                  onClick={switchToSuperAdmin}
                  className="px-2.5 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-purple-500/30 transition-colors shadow-sm"
                  title="Return to Super Admin Developer Console"
                >
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Dev Console</span>
                </button>
              )}

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">EC Admin:</span>
                <span className="font-bold text-white">{activeSchool?.name}</span>
              </div>

              <button
                onClick={logout}
                className="btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
                title="Log Out EC Admin Session"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* Student Session Header */}
          {currentUser?.role === "voter" && (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-400">
                  {currentUser.student?.fullName}
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeSchool?.name} • Index: {currentUser.student?.indexNumber}
                </div>
              </div>

              <button
                onClick={logout}
                className="ml-2 text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Exit Voting Booth"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
