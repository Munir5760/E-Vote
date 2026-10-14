import React from "react";
import { useVoting } from "../context/VotingContext";
import { CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

export const Toast = () => {
  const { toastNotification } = useVoting();

  if (!toastNotification) return null;

  const { message, type } = toastNotification;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/40 bg-emerald-950/90 text-emerald-100",
    error: "border-red-500/40 bg-red-950/90 text-red-100",
    info: "border-amber-500/40 bg-slate-900/90 text-amber-100",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn no-print">
      <div
        className={`glass-panel p-4 rounded-xl border flex items-center gap-3 shadow-2xl max-w-md ${
          borders[type] || borders.info
        }`}
      >
        {icons[type] || icons.info}
        <div className="text-xs font-semibold leading-snug">{message}</div>
      </div>
    </div>
  );
};
