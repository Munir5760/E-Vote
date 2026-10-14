import React from "react";
import { useVoting } from "../../context/VotingContext";
import { ShieldCheck, Download, History, Clock } from "lucide-react";

export const AuditLogTab = () => {
  const { auditLogs, activeSchool, schools } = useVoting();

  const schoolLogs = auditLogs.filter((log) => log.schoolId === activeSchool.id);

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schoolLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit_log_${activeSchool.shortName}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Cryptographic Audit & Event Logs</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable trace of all voter logins, register edits, and cast ballot receipts for {activeSchool.name}.
          </p>
        </div>

        <button onClick={handleExportLogs} className="btn-secondary text-xs">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor / User</th>
                <th className="py-3 px-4">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {schoolLogs.map((log) => {
                const school = schools.find((s) => s.id === log.schoolId);

                return (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {school?.shortName || "System"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-live font-mono text-[10px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{log.actor}</td>
                    <td className="py-3 px-4 text-slate-300">{log.details}</td>
                  </tr>
                );
              })}

              {schoolLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 italic">
                    No log records captured for this election yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
