import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/VotingContext";
import {
  Plus,
  Trash2,
  Edit2,
  Award,
  BookOpen,
  User,
  PlusCircle,
  Building2,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
];

export const CandidatesTab = () => {
  const {
    activeSchool,
    activeElection,
    positions,
    candidates,
    addCandidate,
    deleteCandidate,
    addPosition,
    deletePosition,
  } = useVoting();

  const schoolPositions = positions.filter(
    (p) => p.electionId === activeElection?.id || (p.schoolId === activeSchool?.id && !p.electionId)
  );
  const schoolCandidates = candidates.filter(
    (c) => c.electionId === activeElection?.id || (c.schoolId === activeSchool?.id && !c.electionId)
  );

  // Modals state
  const [showAddCandModal, setShowAddCandModal] = useState(false);
  const [showAddPosModal, setShowAddPosModal] = useState(false);

  // New Candidate Form State
  const [candName, setCandName] = useState("");
  const [candAlias, setCandAlias] = useState("");
  const [candPositionId, setCandPositionId] = useState(schoolPositions[0]?.id || "");
  const [candHouse, setCandHouse] = useState("");
  const [candForm, setCandForm] = useState("Form 3 Science 1");
  const [candManifesto, setCandManifesto] = useState("");
  const [candMotto, setCandMotto] = useState("");
  const [candPhoto, setCandPhoto] = useState("");

  // New Position Form State
  const [posTitle, setPosTitle] = useState("");
  const [posDescription, setPosDescription] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowAddCandModal(false);
        setShowAddPosModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resetCandForm = () => {
    setCandName("");
    setCandAlias("");
    setCandHouse("");
    setCandManifesto("");
    setCandMotto("");
    setCandPhoto("");
  };

  // Photo File Upload Handler
  const handlePhotoFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCandPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    if (!candName || !candPositionId) return;

    addCandidate({
      schoolId: activeSchool?.id,
      electionId: activeElection?.id,
      positionId: candPositionId,
      name: candName,
      alias: candAlias || "Student Representative",
      house: candHouse || "General House",
      form: candForm,
      manifesto: candManifesto || "Dedicated to serving the student body with excellence.",
      motto: candMotto || "Leadership in Service",
      photo: candPhoto || DEFAULT_AVATARS[0],
    });

    resetCandForm();
    setShowAddCandModal(false);
  };

  const handleAddPositionSubmit = (e) => {
    e.preventDefault();
    if (!posTitle) return;

    addPosition({
      schoolId: activeSchool?.id,
      electionId: activeElection?.id,
      title: posTitle,
      description: posDescription || "Executive Prefectural Position.",
    });

    setShowAddPosModal(false);
    setPosTitle("");
    setPosDescription("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Nominated Candidates &amp; Positions</h3>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              {activeElection?.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage ballot positions and candidates for <strong className="text-emerald-400">{activeElection?.title}</strong> (Code: {activeElection?.code}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddPosModal(true)}
            className="btn-secondary text-xs"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create Position</span>
          </button>

          <button
            onClick={() => {
              resetCandForm();
              setCandPositionId(schoolPositions[0]?.id || "");
              setShowAddCandModal(true);
            }}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Positions Accordion/Grid */}
      <div className="space-y-6">
        {schoolPositions.map((pos) => {
          const posCandidates = schoolCandidates.filter((c) => c.positionId === pos.id);

          return (
            <div key={pos.id} className="glass-panel p-6 border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-live">Position {pos.order}</span>
                    <h4 className="text-lg font-bold text-white">{pos.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{pos.description}</p>
                </div>

                <button
                  onClick={() => deletePosition(pos.id)}
                  className="btn-danger text-xs p-2"
                  title="Remove Position"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={cand.photo}
                        alt={cand.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-amber-400 font-bold uppercase">
                          "{cand.alias}"
                        </span>
                        <h5 className="text-sm font-bold text-white truncate">{cand.name}</h5>
                        <div className="text-[11px] text-slate-400">
                          {cand.form} • <span className="text-slate-300">{cand.house}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
                      "{cand.manifesto}"
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold">{cand.votes} Votes</span>
                      <button
                        onClick={() => deleteCandidate(cand.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {posCandidates.length === 0 && (
                  <div className="col-span-full text-center py-6 text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    No candidates nominated for this position yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Candidate Modal */}
      {showAddCandModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
          onClick={() => setShowAddCandModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-lg w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            {/* Pinned Header */}
            <div className="shrink-0 p-4 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">Nominate New Candidate</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure ballot entry, profile details, and manifesto for student voting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCandModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidateSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-modal-scroll">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Ballot Position
                </label>
                <select
                  value={candPositionId}
                  onChange={(e) => setCandPositionId(e.target.value)}
                  className="form-input"
                  required
                >
                  {schoolPositions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kwame Mensah"
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Nickname / Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Reformer"
                    value={candAlias}
                    onChange={(e) => setCandAlias(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Form / Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Form 3 Science 1"
                    value={candForm}
                    onChange={(e) => setCandForm(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Dormitory House
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aggrey House"
                    value={candHouse}
                    onChange={(e) => setCandHouse(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Manifesto Summary
                </label>
                <textarea
                  rows="3"
                  placeholder="Key campaign promises and vision statement..."
                  value={candManifesto}
                  onChange={(e) => setCandManifesto(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>

              {/* Photo Upload or URL Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Candidate Photo (Upload File or Enter URL)
                </label>

                <div className="flex items-center gap-3 mb-2">
                  {candPhoto ? (
                    <div className="relative group shrink-0">
                      <img
                        src={candPhoto}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setCandPhoto("")}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 flex items-center gap-2">
                    <label className="btn-secondary text-xs py-2 px-3 cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{candPhoto ? "Change Photo File" : "Upload Photo File from Device"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                    {candPhoto && (
                      <button
                        type="button"
                        onClick={() => setCandPhoto("")}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Clear Photo
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={candPhoto}
                  onChange={(e) => setCandPhoto(e.target.value)}
                  className="form-input text-xs font-mono"
                />

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400">Default Presets:</span>
                  {DEFAULT_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Preset"
                      onClick={() => setCandPhoto(url)}
                      className="w-6 h-6 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform border border-slate-700"
                    />
                  ))}
                </div>
              </div>

              </div>

              {/* Pinned Footer */}
              <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCandModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Position Modal */}
      {showAddPosModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setShowAddPosModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel max-w-md w-full my-auto max-h-[calc(100vh-2rem)] flex flex-col border-slate-700 shadow-2xl relative animate-fadeIn rounded-2xl overflow-hidden"
          >
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-white">Create Prefectural Position</h3>
              <button
                type="button"
                onClick={() => setShowAddPosModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPositionSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-modal-scroll">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dining Hall Prefect"
                    value={posTitle}
                    onChange={(e) => setPosTitle(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Role Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Duties and responsibilities of this role..."
                    value={posDescription}
                    onChange={(e) => setPosDescription(e.target.value)}
                    className="form-input"
                  ></textarea>
                </div>
              </div>

              <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPosModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  Add Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
