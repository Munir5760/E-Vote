import React, { useState } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Building2,
  Plus,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export const SchoolsTab = () => {
  const { schools, activeSchoolId, setActiveSchoolId, addSchool } = useVoting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [schName, setSchName] = useState("");
  const [schShortName, setSchShortName] = useState("");
  const [schLocation, setSchLocation] = useState("Accra, Ghana");
  const [schMotto, setSchMotto] = useState("Excellence & Service");
  const [schCode, setSchCode] = useState("SCH-2026");
  const [schLogo, setSchLogo] = useState(
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80"
  );

  const handleAddSchoolSubmit = (e) => {
    e.preventDefault();
    if (!schName || !schShortName) return;

    addSchool({
      name: schName,
      shortName: schShortName,
      location: schLocation,
      motto: schMotto,
      code: schCode,
      logo: schLogo,
    });

    setShowAddModal(false);
    setSchName("");
    setSchShortName("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Multi-Tenant School Institutions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage isolated voting sessions for multiple Senior High Schools concurrently without data cross-contamination.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add New SHS Institution
        </button>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((sch) => {
          const isActive = sch.id === activeSchoolId;

          return (
            <div
              key={sch.id}
              className={`glass-panel p-6 border-2 transition-all ${
                isActive
                  ? "border-emerald-500 bg-emerald-950/20 shadow-xl"
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-amber-400 overflow-hidden shadow-md">
                    {sch.logo ? (
                      <img src={sch.logo} alt={sch.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{sch.name}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {sch.location}
                    </div>
                  </div>
                </div>

                <span className="badge badge-live uppercase text-[10px]">
                  {sch.status}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1 mb-4">
                <div className="text-amber-400 font-semibold italic">"{sch.motto}"</div>
                <div className="text-slate-400">
                  Institution Code: <span className="font-mono text-white">{sch.code}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Isolated Database Partition
                </div>

                {isActive ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> Currently Active
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveSchoolId(sch.id)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <span>Switch to this School</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 border-slate-700 shadow-2xl relative animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Add Senior High School</h3>

            <form onSubmit={handleAddSchoolSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Full School Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wesley Girls' High School"
                    value={schName}
                    onChange={(e) => setSchName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Short Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wey Gey Hey"
                    value={schShortName}
                    onChange={(e) => setSchShortName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cape Coast, Central Region"
                    value={schLocation}
                    onChange={(e) => setSchLocation(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    School Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WGH-2026"
                    value={schCode}
                    onChange={(e) => setSchCode(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g. Live Pure, Speak True, Right Wrong"
                  value={schMotto}
                  onChange={(e) => setSchMotto(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  School Logo Image URL
                </label>
                <input
                  type="url"
                  value={schLogo}
                  onChange={(e) => setSchLogo(e.target.value)}
                  className="form-input text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create School Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
