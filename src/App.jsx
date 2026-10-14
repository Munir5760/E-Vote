import React, { useState, useEffect } from "react";
import { VotingProvider, useVoting } from "./context/VotingContext";
import { Header } from "./components/Header";
import { VoterLogin } from "./components/VoterPortal/VoterLogin";
import { VotingBooth } from "./components/VoterPortal/VotingBooth";
import { AdminDashboard } from "./components/AdminDashboard/AdminDashboard";
import { AdminLogin } from "./components/AdminDashboard/AdminLogin";
import { PollingStationPortal } from "./components/AdminDashboard/PollingStationPortal";
import { OfficerLogin } from "./components/AdminDashboard/OfficerLogin";
import { Toast } from "./components/Toast";
import { ShieldCheck, Lock, RefreshCw, Vote, Building2, KeyRound } from "lucide-react";

const MainAppContent = () => {
  const { currentUser, resetAllData, activeSchool, theme, systemConfig } = useVoting();
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [portalMode, setPortalMode] = useState(() => {
    try {
      return localStorage.getItem("gh_shs_portal_mode") || "student";
    } catch {
      return "student";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gh_shs_portal_mode", portalMode);
    } catch {}
  }, [portalMode]);

  const isAdminLoggedIn =
    currentUser?.role === "school_admin" ||
    currentUser?.role === "super_admin" ||
    currentUser?.role === "admin";

  const isOfficerLoggedIn = currentUser?.role === "officer";

  const glow1 = systemConfig?.glowColor1 || activeSchool?.primaryColor || "#10b981";
  const glow2 = systemConfig?.glowColor2 || "#f59e0b";
  const bgBase = systemConfig?.backgroundColor || "#030712";

  const dynamicBackground =
    theme === "light"
      ? {
          backgroundColor: "#f8fafc",
          backgroundImage: `
            radial-gradient(at 0% 0%, ${glow1}18 0px, transparent 45%),
            radial-gradient(at 100% 0%, ${glow2}15 0px, transparent 45%),
            radial-gradient(at 50% 100%, ${glow1}10 0px, transparent 50%)
          `,
        }
      : {
          backgroundColor: bgBase,
          backgroundImage: `
            radial-gradient(at 0% 0%, ${glow1}25 0px, transparent 45%),
            radial-gradient(at 100% 0%, ${glow2}20 0px, transparent 45%),
            radial-gradient(at 50% 100%, ${glow1}18 0px, transparent 50%)
          `,
        };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-500 ${
        theme === "light" ? "theme-light" : "theme-dark"
      }`}
      style={dynamicBackground}
    >
      {/* Header Bar */}
      <Header onOpenAdminLogin={() => setShowAdminLoginModal(true)} />

      {/* Main Body View */}
      <main className="flex-grow pb-12">
        {isAdminLoggedIn ? (
          <AdminDashboard />
        ) : isOfficerLoggedIn ? (
          <div className="max-w-7xl mx-auto py-6 px-4">
            <PollingStationPortal onOpenTabletMode={() => setPortalMode("student")} />
          </div>
        ) : currentUser?.role === "voter" ? (
          <VotingBooth />
        ) : (
          <div>
            {/* Mode Switcher Banner on Homepage */}
            <div className="max-w-2xl mx-auto pt-6 px-4 no-print">
              <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-1.5 shadow-lg">
                <button
                  onClick={() => setPortalMode("student")}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    portalMode === "student"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>Tablet Voting Terminal</span>
                </button>

                <button
                  onClick={() => setPortalMode("officer")}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    portalMode === "officer"
                      ? "bg-teal-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Officer OTP Station</span>
                </button>

                <button
                  onClick={() => setPortalMode("admin")}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    portalMode === "admin"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>EC Admin Login</span>
                </button>
              </div>
            </div>

            {/* Portal Content View */}
            {portalMode === "admin" ? (
              <div className="max-w-xl mx-auto pt-4">
                <AdminLogin onClose={() => setPortalMode("student")} />
              </div>
            ) : portalMode === "officer" ? (
              isOfficerLoggedIn || isAdminLoggedIn ? (
                <div className="max-w-7xl mx-auto py-6 px-4">
                  <PollingStationPortal onOpenTabletMode={() => setPortalMode("student")} />
                </div>
              ) : (
                <div className="max-w-xl mx-auto pt-4">
                  <OfficerLogin
                    onClose={() => setPortalMode("student")}
                    onLoginSuccess={() => setPortalMode("officer")}
                  />
                </div>
              )
            ) : (
              <VoterLogin onOpenOfficerDesk={() => setPortalMode("officer")} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800 bg-slate-950/90 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">Ghana SHS National Electoral Commission Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>256-Bit Cryptographic Isolation</span>
            <span>•</span>
            <span>Multi-Tenant High School Platform</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Reset all elections and voters to default state?")) {
                  resetAllData();
                }
              }}
              className="text-slate-500 hover:text-amber-400 text-[11px] flex items-center gap-1"
              title="Reset System Data"
            >
              <RefreshCw className="w-3 h-3" /> Reset System Data
            </button>

            {!currentUser && (
              <button
                onClick={() => setPortalMode(portalMode === "admin" ? "student" : "admin")}
                className="text-amber-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Switch Portal Mode
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Admin Login Modal if triggered from Header */}
      {showAdminLoginModal && (
        <AdminLogin onClose={() => setShowAdminLoginModal(false)} />
      )}

      {/* Toast Alert */}
      <Toast />
    </div>
  );
};

import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <VotingProvider>
        <MainAppContent />
      </VotingProvider>
    </ErrorBoundary>
  );
}
