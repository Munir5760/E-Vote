import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useVoting } from "../../context/VotingContext";
import {
  Upload,
  Download,
  Plus,
  Search,
  Trash2,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Key,
  Lock,
  RefreshCw,
  Users,
  FileText
} from "lucide-react";

export const VoterRegisterTab = () => {
  const {
    activeSchool,
    activeElection,
    voters,
    addVoter,
    uploadVoterRegister,
    deleteVoter,
    resetVoterStatus,
    adminResetStudentPassword,
  } = useVoting();

  const electionVoters = voters.filter(
    (v) => v.electionId === activeElection?.id || (!v.electionId && v.schoolId === activeSchool.id)
  );

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | VOTED | PENDING
  const [classFilter, setClassFilter] = useState("ALL"); // ALL | SHS 1 | SHS 2 | SHS 3

  // Modals state
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showPrintCardsModal, setShowPrintCardsModal] = useState(false);

  // Single Voter Form
  const [indexNum, setIndexNum] = useState("");
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("1234");
  const [formClass, setFormClass] = useState("SHS 3");
  const [house, setHouse] = useState("Guggisberg House");

  // CSV Drag state
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState("append");

  // Universal Excel (.xlsx, .xls) & CSV Upload handler for current election
  const handleFileUpload = (file, targetForm = "AUTO") => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Smart Header Detection: supports titles/empty rows at top
          const raw2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          let headerRowIndex = -1;
          for (let r = 0; r < Math.min(raw2D.length, 10); r++) {
            const rowStrings = (raw2D[r] || []).map((c) => String(c).toLowerCase().trim());
            const hasKeyword = rowStrings.some(
              (c) =>
                c.includes("name") ||
                c.includes("index") ||
                c.includes("student") ||
                c.includes("id") ||
                c.includes("house") ||
                c.includes("class") ||
                c.includes("form")
            );
            if (hasKeyword) {
              headerRowIndex = r;
              break;
            }
          }

          let jsonData = [];
          if (headerRowIndex >= 0) {
            const headers = raw2D[headerRowIndex].map((h) => String(h).trim());
            for (let r = headerRowIndex + 1; r < raw2D.length; r++) {
              const row = raw2D[r];
              if (!row || row.every((c) => String(c).trim() === "")) continue;
              const rowObj = {};
              headers.forEach((h, colIdx) => {
                if (h) rowObj[h] = row[colIdx] !== undefined ? row[colIdx] : "";
              });
              jsonData.push(rowObj);
            }
          } else {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          }

          if (jsonData && jsonData.length > 0) {
            uploadVoterRegister(activeSchool.id, activeElection.id, jsonData, targetForm, uploadMode);
          } else {
            alert("No student data rows found in uploaded Excel worksheet.");
          }
        } catch (err) {
          console.error("Excel Read Error:", err);
          alert(`Failed to parse Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Fallback for CSV / TSV text files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            uploadVoterRegister(activeSchool.id, activeElection.id, results.data, targetForm, uploadMode);
          } else {
            alert("No valid rows parsed from file. Please check file formatting.");
          }
        },
        error: (error) => {
          alert(`File Parse Error: ${error.message}`);
        },
      });
    }
  };

  const handleDownloadSampleCSV = (formType = "ALL") => {
    let csvContent = "";
    let fileName = `sample_voter_register_${activeSchool.shortName || 'School'}`;

    if (formType === "SHS 1") {
      csvContent =
        "IndexNumber,FullName,Password,Form,House\n" +
        "101001001,Kwame Mensah,1234,SHS 1,Guggisberg House\n" +
        "101001002,Abena Osei,1234,SHS 1,Aggrey House\n" +
        "101001003,Kofi Annan,1234,SHS 1,Cadbury House\n" +
        "101001004,Ama Serwaa,1234,SHS 1,Livingstone House\n" +
        "101001005,Fred Adom,1234,SHS 1,Guggisberg House\n";
      fileName += "_SHS1";
    } else if (formType === "SHS 2") {
      csvContent =
        "IndexNumber,FullName,Password,Form,House\n" +
        "102002001,Emmanuel Frimpong,1234,SHS 2,Guggisberg House\n" +
        "102002002,Jessica Animah,1234,SHS 2,Aggrey House\n" +
        "102002003,Samuel Kwarteng,1234,SHS 2,Cadbury House\n" +
        "102002004,Yaw Badu,1234,SHS 2,Livingstone House\n" +
        "102002005,Grace Baah,1234,SHS 2,Aggrey House\n";
      fileName += "_SHS2";
    } else if (formType === "SHS 3") {
      csvContent =
        "IndexNumber,FullName,Password,Form,House\n" +
        "103003001,Kwabena Boateng,1234,SHS 3,Guggisberg House\n" +
        "103003002,Akosua Bonsu,1234,SHS 3,Aggrey House\n" +
        "103003003,Kwame Addo,1234,SHS 3,Cadbury House\n" +
        "103003004,Otumfuo Baafi,1234,SHS 3,Livingstone House\n" +
        "103003005,Nana Appiah,1234,SHS 3,Cadbury House\n";
      fileName += "_SHS3";
    } else {
      csvContent =
        "IndexNumber,FullName,Password,Form,House\n" +
        "101001001,Kwame Mensah,1234,SHS 1,Guggisberg House\n" +
        "102002001,Jessica Animah,1234,SHS 2,Aggrey House\n" +
        "103003001,Kwabena Boateng,1234,SHS 3,Cadbury House\n";
      fileName += "_General";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSingleSubmit = (e) => {
    e.preventDefault();
    if (!indexNum || !fullName) return;

    const success = addVoter({
      schoolId: activeSchool.id,
      electionId: activeElection.id,
      indexNumber: indexNum,
      fullName,
      passwordPin: pin || "1234",
      form: formClass,
      house,
    });

    if (success) {
      setShowAddSingleModal(false);
      setIndexNum("");
      setFullName("");
    }
  };

  // Class groupings metrics for active election
  const shs1Count = electionVoters.filter((v) => v.form.includes("1")).length;
  const shs2Count = electionVoters.filter((v) => v.form.includes("2")).length;
  const shs3Count = electionVoters.filter((v) => v.form.includes("3")).length;

  // Filter voters for active election
  const filteredVoters = electionVoters.filter((v) => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.indexNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "VOTED" && v.hasVoted) ||
      (statusFilter === "PENDING" && !v.hasVoted);

    const matchesClass =
      classFilter === "ALL" ||
      (classFilter === "SHS 1" && v.form.includes("1")) ||
      (classFilter === "SHS 2" && v.form.includes("2")) ||
      (classFilter === "SHS 3" && v.form.includes("3"));

    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Active Election Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 p-4 rounded-xl border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
            Isolated Voter Register For Election:
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{activeElection?.title}</span>
            <span className="text-xs font-mono font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40">
              Code: {activeElection?.code}
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Only students uploaded to this specific register can vote in this election using code <strong className="text-amber-400 font-mono">{activeElection?.code}</strong>.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-slate-300 bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800">
          <div>Registered Voters: <strong className="text-emerald-400 font-bold">{electionVoters.length}</strong></div>
          <div>Voted: <strong className="text-amber-400 font-bold">{electionVoters.filter(v => v.hasVoted).length}</strong></div>
        </div>
      </div>

      {/* Top Banner & Quick Controls */}
      <div className="glass-panel p-6 border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Voter Register Management</span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload Excel (.xlsx, .xls) or CSV class registers individually (SHS 1, SHS 2, SHS 3) or print credentials slips for {activeSchool.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSampleCSV}
              className="btn-secondary text-xs"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Excel/CSV Template</span>
            </button>

            <button
              onClick={() => setShowAddSingleModal(true)}
              className="btn-secondary text-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Single Voter</span>
            </button>

            <button
              onClick={() => setShowPrintCardsModal(true)}
              className="btn-gold text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Credential Slips</span>
            </button>
          </div>
        </div>

        {/* 3 Dedicated Class Upload Cards (SHS 1, SHS 2, SHS 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* SHS 1 Upload Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> SHS 1 Class Register
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                {shs1Count} Students
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload Excel (.xlsx, .xls) or CSV file containing Form 1 / SHS 1 students.
            </p>
            <div className="space-y-2 pt-1">
              <label className="btn-primary text-xs justify-center py-2 cursor-pointer font-bold w-full flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>Upload SHS 1 Excel/CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "SHS 1");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => handleDownloadSampleCSV("SHS 1")}
                className="w-full text-center text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" /> Download SHS 1 Template
              </button>
            </div>
          </div>

          {/* SHS 2 Upload Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> SHS 2 Class Register
              </span>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                {shs2Count} Students
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload Excel (.xlsx, .xls) or CSV file containing Form 2 / SHS 2 students.
            </p>
            <div className="space-y-2 pt-1">
              <label className="btn-gold text-xs justify-center py-2 cursor-pointer font-bold w-full flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>Upload SHS 2 Excel/CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "SHS 2");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => handleDownloadSampleCSV("SHS 2")}
                className="w-full text-center text-[10px] text-amber-400 hover:text-amber-300 hover:underline flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" /> Download SHS 2 Template
              </button>
            </div>
          </div>

          {/* SHS 3 Upload Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> SHS 3 Class Register
              </span>
              <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                {shs3Count} Students
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload Excel (.xlsx, .xls) or CSV file containing Form 3 / SHS 3 students.
            </p>
            <div className="space-y-2 pt-1">
              <label className="btn-secondary text-xs justify-center py-2 cursor-pointer font-bold text-purple-300 border-purple-500/30 hover:bg-purple-950/40 w-full flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Upload SHS 3 Excel/CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .tsv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "SHS 3");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => handleDownloadSampleCSV("SHS 3")}
                className="w-full text-center text-[10px] text-purple-400 hover:text-purple-300 hover:underline flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" /> Download SHS 3 Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SHS Class Grouping Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400 font-bold px-3 uppercase tracking-wider">
          Class Groupings:
        </span>

        <button
          onClick={() => setClassFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            classFilter === "ALL"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          All Classes ({electionVoters.length})
        </button>

        <button
          onClick={() => setClassFilter("SHS 1")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            classFilter === "SHS 1"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          SHS 1 Register ({shs1Count})
        </button>

        <button
          onClick={() => setClassFilter("SHS 2")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            classFilter === "SHS 2"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          SHS 2 Register ({shs2Count})
        </button>

        <button
          onClick={() => setClassFilter("SHS 3")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            classFilter === "SHS 3"
              ? "bg-emerald-500 text-slate-950 shadow-md"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          SHS 3 Register ({shs3Count})
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search voter by name or index number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 text-xs py-2"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Voting Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs py-1.5 px-3 bg-slate-900 border-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="VOTED">Voted</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Voter Register Table */}
      <div className="glass-panel overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Index Number</th>
                <th className="py-3 px-4">Full Student Name</th>
                <th className="py-3 px-4">Class / Form</th>
                <th className="py-3 px-4">House</th>
                <th className="py-3 px-4">Password Status</th>
                <th className="py-3 px-4">Voting Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredVoters.map((vtr) => (
                <tr key={vtr.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {vtr.indexNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{vtr.fullName}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
                      {vtr.form}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{vtr.house}</td>
                  <td className="py-3 px-4">
                    {vtr.isPasswordChanged ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" /> Private Password Set
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Default: {vtr.passwordPin}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {vtr.hasVoted ? (
                      <span className="badge badge-live">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Voted
                      </span>
                    ) : (
                      <span className="badge badge-paused">
                        <Clock className="w-3 h-3 text-amber-400" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {/* Admin Reset Password Button */}
                    <button
                      onClick={() => adminResetStudentPassword(vtr.id)}
                      className="text-amber-400 hover:underline text-[11px] font-semibold inline-flex items-center gap-1"
                      title="Reset password back to default '1234'"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Pass
                    </button>

                    {vtr.hasVoted && (
                      <button
                        onClick={() => resetVoterStatus(vtr.id)}
                        className="text-emerald-400 hover:underline text-[11px] font-semibold"
                        title="Reset Voting Status"
                      >
                        Reset Vote
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${vtr.fullName} from register?`)) {
                          deleteVoter(vtr.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete Voter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 italic">
                    No voters found matching current class or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Voter Modal */}
      {showAddSingleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 border-slate-700 shadow-2xl relative animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Register Single Student</h3>

            <form onSubmit={handleAddSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Student Index Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 101002010"
                  value={indexNum}
                  onChange={(e) => setIndexNum(e.target.value)}
                  className="form-input font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yaw Osei Bonsu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Class / Form
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="form-input"
                  >
                    <option value="SHS 1">SHS 1</option>
                    <option value="SHS 2">SHS 2</option>
                    <option value="SHS 3">SHS 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Default Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Dormitory House
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guggisberg House"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSingleModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Voter Credentials Cards Modal */}
      {showPrintCardsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full p-6 border-slate-700 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 no-print">
              <div>
                <h3 className="text-xl font-bold text-white">Printable Voter Credential Slips</h3>
                <p className="text-xs text-slate-400">Class distribution slips for {activeSchool.name} students</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="btn-gold text-xs">
                  <Printer className="w-4 h-4" /> Print Slips Now
                </button>
                <button
                  onClick={() => setShowPrintCardsModal(false)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {electionVoters.map((vtr) => (
                <div
                  key={vtr.id}
                  className="bg-white text-slate-950 p-3 rounded-lg border-2 border-slate-300 shadow-sm text-xs space-y-1 font-sans"
                >
                  <div className="font-bold text-[11px] border-b border-slate-200 pb-1 flex justify-between">
                    <span>{activeSchool.shortName} ({activeElection?.code})</span>
                    <span className="text-[9px] text-slate-500 font-mono">{vtr.form}</span>
                  </div>
                  <div className="font-extrabold text-sm truncate">{vtr.fullName}</div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Election Code:</span>
                    <span className="font-mono font-bold text-amber-800">{activeElection?.code}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Index:</span>
                    <span className="font-mono font-bold text-emerald-800">{vtr.indexNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Default Password:</span>
                    <span className="font-mono font-bold text-blue-800">
                      {vtr.isPasswordChanged ? "(Custom Password Set)" : vtr.passwordPin}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-200 truncate">
                    Election: {activeElection?.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
