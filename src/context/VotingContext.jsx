import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  INITIAL_SCHOOLS,
  INITIAL_ELECTIONS,
  INITIAL_POSITIONS,
  INITIAL_CANDIDATES,
  INITIAL_VOTERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SCHOOL_ADMINS,
  INITIAL_SUPER_ADMIN,
  INITIAL_OFFICERS,
  INITIAL_SYSTEM_CONFIG,
} from "../data/initialData";

const VotingContext = createContext();

const LOCAL_STORAGE_KEY = "gh_shs_evote_app_state_v8";
const SYNC_CHANNEL_NAME = "gh_shs_evote_channel_v8";
const USER_STORAGE_KEY = "gh_shs_evote_user_session_v8";
const ACTIVE_SCHOOL_KEY = "gh_shs_evote_active_school_v8";
const ACTIVE_ELECTION_KEY = "gh_shs_evote_active_election_v8";

export const VotingProvider = ({ children }) => {
  const loadStoredState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const schools = Array.isArray(parsed.schools) && parsed.schools.length > 0
            ? parsed.schools
            : INITIAL_SCHOOLS;
          const schoolAdmins = Array.isArray(parsed.schoolAdmins) && parsed.schoolAdmins.length > 0
            ? parsed.schoolAdmins
            : INITIAL_SCHOOL_ADMINS;
          return {
            ...parsed,
            schools,
            schoolAdmins,
            elections: Array.isArray(parsed.elections) && parsed.elections.length > 0 ? parsed.elections : INITIAL_ELECTIONS,
            positions: Array.isArray(parsed.positions) && parsed.positions.length > 0 ? parsed.positions : INITIAL_POSITIONS,
            candidates: Array.isArray(parsed.candidates) && parsed.candidates.length > 0 ? parsed.candidates : INITIAL_CANDIDATES,
            voters: Array.isArray(parsed.voters) && parsed.voters.length > 0 ? parsed.voters : INITIAL_VOTERS,
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_AUDIT_LOGS,
            version: Number(parsed.version) || 1,
            updatedAt: Number(parsed.updatedAt) || Date.now(),
            officers: (parsed.officers && parsed.officers.length > 0) ? parsed.officers : INITIAL_OFFICERS,
            superAdmin: parsed.superAdmin || INITIAL_SUPER_ADMIN,
            systemConfig: parsed.systemConfig || INITIAL_SYSTEM_CONFIG,
          };
        }
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
    return {
      version: 1,
      updatedAt: Date.now(),
      schools: INITIAL_SCHOOLS,
      elections: INITIAL_ELECTIONS,
      positions: INITIAL_POSITIONS,
      candidates: INITIAL_CANDIDATES,
      voters: INITIAL_VOTERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      schoolAdmins: INITIAL_SCHOOL_ADMINS,
      officers: INITIAL_OFFICERS,
      superAdmin: INITIAL_SUPER_ADMIN,
      systemConfig: INITIAL_SYSTEM_CONFIG,
    };
  };

  const [state, setState] = useState(loadStoredState);

  // Persisted current logged in session (Super Admin, School EC Admin, Officer, Voter)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to restore user session from localStorage:", e);
    }
    return null;
  });

  // Persisted active school ID
  const [activeSchoolId, setActiveSchoolId] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.schoolId) return savedUser.schoolId;
      }
      const savedSchoolId = localStorage.getItem(ACTIVE_SCHOOL_KEY);
      if (savedSchoolId) return savedSchoolId;
    } catch {}
    return INITIAL_SCHOOLS[0].id;
  });

  // Persisted active election ID
  const [activeElectionId, setActiveElectionId] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser?.electionId) return parsedUser.electionId;
      }
      const savedElectionId = localStorage.getItem(ACTIVE_ELECTION_KEY);
      if (savedElectionId) return savedElectionId;
    } catch {}
    return "";
  });

  const [toastNotification, setToastNotification] = useState(null);

  // Sync user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user session:", e);
    }
  }, [currentUser]);

  // Sync activeSchoolId to localStorage
  useEffect(() => {
    try {
      if (activeSchoolId) {
        localStorage.setItem(ACTIVE_SCHOOL_KEY, activeSchoolId);
      }
    } catch {}
  }, [activeSchoolId]);

  // Sync activeElectionId to localStorage
  useEffect(() => {
    try {
      if (activeElectionId) {
        localStorage.setItem(ACTIVE_ELECTION_KEY, activeElectionId);
      } else {
        localStorage.removeItem(ACTIVE_ELECTION_KEY);
      }
    } catch {}
  }, [activeElectionId]);

  // Global Light/Dark Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("gh_shs_theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gh_shs_theme", theme);
      if (theme === "light") {
        document.documentElement.classList.add("theme-light");
        document.documentElement.classList.remove("theme-dark");
      } else {
        document.documentElement.classList.add("theme-dark");
        document.documentElement.classList.remove("theme-light");
      }
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Generate unique tab/session ID to prevent echo loops
  const tabIdRef = useRef(Math.random().toString(36).slice(2) + Date.now().toString(36));
  // Track last synced state JSON to avoid redundant saves, broadcasts, and POSTs
  const lastSyncedJsonRef = useRef(JSON.stringify(state));
  // Track local mutations to avoid race-condition reverts from stale GETs
  const lastLocalActionTimestampRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sync state changes across tabs, devices, and cloud server
  useEffect(() => {
    const currentJson = JSON.stringify(state);
    if (currentJson === lastSyncedJsonRef.current) {
      return;
    }
    lastSyncedJsonRef.current = currentJson;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, currentJson);
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }

    // Broadcast to other open tabs/windows
    try {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: "STATE_UPDATE", state, senderTabId: tabIdRef.current });
      channel.close();
    } catch (e) {}

    // Persist to LAN server endpoint for multi-laptop sync
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: currentJson,
    }).catch(() => {});
  }, [state]);

  // Listen for external updates from other laptops or tabs
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = (event) => {
        // Prevent processing own broadcasts
        if (event.data?.senderTabId === tabIdRef.current) return;
        if (event.data?.type === "STATE_UPDATE" && event.data?.state) {
          const incomingJson = JSON.stringify(event.data.state);
          if (incomingJson !== lastSyncedJsonRef.current) {
            lastSyncedJsonRef.current = incomingJson;
            setState(event.data.state);
          }
        }
      };
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue && e.newValue !== lastSyncedJsonRef.current) {
        try {
          const parsed = JSON.parse(e.newValue);
          lastSyncedJsonRef.current = e.newValue;
          setState(parsed);
        } catch (err) {}
      }
      if (e.key === USER_STORAGE_KEY) {
        try {
          const parsedUser = e.newValue ? JSON.parse(e.newValue) : null;
          setCurrentUser(parsedUser);
        } catch {}
      }
      if (e.key === ACTIVE_SCHOOL_KEY && e.newValue) {
        setActiveSchoolId(e.newValue);
      }
      if (e.key === ACTIVE_ELECTION_KEY) {
        setActiveElectionId(e.newValue || "");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const BLOB_FALLBACK_URL = "https://65iyucgw47mmkjlx.public.blob.vercel-storage.com/election_live_store.json";

    const applyRemoteIfChanged = (data) => {
      if (!data || data.empty || !Array.isArray(data.schools) || data.schools.length === 0) {
        return;
      }

      // If a local user action just happened within 4 seconds, ignore remote to allow in-flight write to settle
      if (Date.now() - lastLocalActionTimestampRef.current < 4000) {
        return;
      }

      const remoteVersion = Number(data.version) || 0;
      const remoteUpdatedAt = Number(data.updatedAt) || 0;
      const localVersion = Number(stateRef.current?.version) || 0;
      const localUpdatedAt = Number(stateRef.current?.updatedAt) || 0;

      // If local state has a newer version or newer timestamp, do NOT overwrite with stale remote!
      // Instead, sync our newer local state up to the cloud so all other laptops get our latest data
      if (localVersion > remoteVersion || (localVersion === remoteVersion && localUpdatedAt > remoteUpdatedAt && localVersion > 1)) {
        fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stateRef.current),
        }).catch(() => {});
        return;
      }

      // Otherwise, the remote state is newer or equal: adopt it!
      const remoteJson = JSON.stringify(data);
      if (remoteJson !== lastSyncedJsonRef.current) {
        lastSyncedJsonRef.current = remoteJson;
        setState(data);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, remoteJson);
        } catch (e) {}
      }
    };

    const fetchLatestRemoteState = async () => {
      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      try {
        const res = await fetch(`/api/state?_nocache=${cacheBuster}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.empty && Array.isArray(data.schools) && data.schools.length > 0) {
            applyRemoteIfChanged(data);
            return;
          } else {
            // Re-seed remote with valid state if remote store has empty schools
            if (Array.isArray(stateRef.current?.schools) && stateRef.current.schools.length > 0) {
              fetch("/api/state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stateRef.current),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {}

      // Fallback: fetch directly from public Vercel Blob cloud store
      try {
        const fallbackRes = await fetch(`${BLOB_FALLBACK_URL}?_nocache=${cacheBuster}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data && !data.empty && Array.isArray(data.schools) && data.schools.length > 0) {
            applyRemoteIfChanged(data);
          }
        }
      } catch (fallbackErr) {}
    };

    // Initial check against server state
    fetchLatestRemoteState();

    // Periodic check for multi-device sync (every 4 seconds)
    const pollInterval = setInterval(fetchLatestRemoteState, 4000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  const showToast = (message, type = "info") => {
    setToastNotification({ id: Date.now(), message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const DEFAULT_FALLBACK_SCHOOL = INITIAL_SCHOOLS[0] || {
    id: "sch_achimota",
    name: "Achimota School",
    shortName: "Achimota",
    motto: "Ut Omnes Unum Sint (That All May Be One)",
    location: "Accra, Greater Accra Region",
    code: "ACH-2026",
    status: "active",
    primaryColor: "#10b981",
  };

  const safeSchools = Array.isArray(state?.schools) && state.schools.length > 0
    ? state.schools
    : INITIAL_SCHOOLS;

  const activeSchool =
    safeSchools.find((s) => s.id === activeSchoolId) ||
    safeSchools[0] ||
    DEFAULT_FALLBACK_SCHOOL;
  
  const safeElections = Array.isArray(state?.elections) ? state.elections : INITIAL_ELECTIONS;
  const schoolElections = safeElections.filter((e) => e.schoolId === activeSchool.id);
  const activeElection = activeElectionId
    ? safeElections.find((e) => e.id === activeElectionId && e.schoolId === activeSchool.id) || null
    : null;

  const addAuditLog = (schoolId, event, actor, details) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      schoolId,
      timestamp: new Date().toISOString(),
      event,
      actor,
      details,
    };
    setState((prev) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
    }));
  };

  // --- VOTER LOGIN STRICTLY CHECKING ELECTION REGISTER ---
  const loginAsVoter = (electionCode, indexNumber, passwordInput) => {
    const cleanCode = electionCode.trim().toUpperCase();
    const cleanIndex = indexNumber.trim();
    const cleanPass = passwordInput.trim();

    // Find election matching code
    const targetElection = state.elections.find(
      (e) => e.code.toUpperCase() === cleanCode
    );

    if (!targetElection) {
      return {
        success: false,
        message: `Election Code '${cleanCode}' is invalid. Please check the code assigned to your election (e.g. ACH-2026 or ACH-SCI2-2026).`,
      };
    }

    const targetSchool = state.schools.find((s) => s.id === targetElection.schoolId);

    if (!targetSchool || targetSchool.status === "terminated" || targetSchool.status === "suspended") {
      return {
        success: false,
        message: `Voting for ${targetSchool?.name || "this school"} has been ${targetSchool?.status?.toUpperCase() || "SUSPENDED"} by Platform Administration.`,
      };
    }

    if (targetElection.status === "ended") {
      return {
        success: false,
        message: `'${targetElection.title}' has been closed and sealed by the Electoral Commission.`,
      };
    }

    if (targetElection.status === "paused" || targetElection.status === "not_started") {
      return {
        success: false,
        message: `'${targetElection.title}' is currently ${targetElection.status.replace("_", " ").toUpperCase()}.`,
      };
    }

    // STRICT CHECK: Student must be registered under targetElection.id!
    const student = state.voters.find(
      (v) => v.electionId === targetElection.id && v.indexNumber === cleanIndex
    );

    if (!student) {
      return {
        success: false,
        message: `Index Number '${cleanIndex}' is NOT registered in the voter register for '${targetElection.title}' (Code: ${targetElection.code}).`,
      };
    }

    if (student.hasVoted) {
      return {
        success: false,
        message: `Index ${cleanIndex} (${student.fullName}) has ALREADY voted in '${targetElection.title}'. Official Receipt Hash: ${student.verificationCode}`,
        alreadyVoted: true,
        student,
        school: targetSchool,
        election: targetElection,
      };
    }

    // Check One-Time Password (OTP) generated at Electoral Officer desk
    const isOtpMatch = student.activeOtp && student.activeOtp.trim() === cleanPass;
    const isFallbackMatch = !student.activeOtp && (
      (student.isPasswordChanged && student.customPassword === cleanPass) ||
      student.passwordPin === cleanPass ||
      cleanPass === cleanIndex ||
      cleanPass === "1234"
    );

    if (!isOtpMatch && !isFallbackMatch) {
      if (student.activeOtp) {
        return {
          success: false,
          message: "Invalid One-Time Password (OTP). Please enter the 6-digit passcode issued to you at the Electoral Officer desk.",
        };
      } else {
        return {
          success: false,
          message: `No One-Time Password (OTP) has been generated for Index '${cleanIndex}' yet. Please step forward to the Electoral Officer desk with your Index Number and Level (${student.form}) to be accredited and receive your OTP.`,
        };
      }
    }

    setActiveSchoolId(targetSchool.id);
    setActiveElectionId(targetElection.id);

    setCurrentUser({
      role: "voter",
      schoolId: targetSchool.id,
      electionId: targetElection.id,
      student,
      school: targetSchool,
      election: targetElection,
    });

    addAuditLog(
      targetSchool.id,
      "VOTER_LOGIN",
      `Student Index: ${cleanIndex}`,
      `${student.fullName} logged into '${targetElection.title}' ballot using One-Time Password.`
    );

    showToast(`Welcome ${student.fullName}! Logged into '${targetElection.title}'.`, "success");
    return { success: true, student, school: targetSchool, election: targetElection };
  };

  // --- ELECTORAL OFFICER ACCREDITATION & OTP GENERATION ---
  const generateVoterOtp = (voterId, officerDesk = "Station Desk 1") => {
    if (currentUser?.role === "officer") {
      const liveOfficer = (state.officers || []).find((o) => o.id === currentUser.officerId);
      if (liveOfficer && liveOfficer.status === "suspended") {
        return {
          success: false,
          message: "ACCESS DENIED: Your officer account has been suspended by the Electoral Commissioner.",
        };
      }
    }

    const student = state.voters.find((v) => v.id === voterId);
    if (!student) {
      return { success: false, message: "Student record not found in register." };
    }

    if (student.hasVoted) {
      return {
        success: false,
        message: `ACCESSION DENIED: ${student.fullName} (${student.indexNumber}) has ALREADY voted at ${new Date(student.votedAt).toLocaleTimeString()}. Duplicate ballot authorization blocked.`,
        alreadyVoted: true,
        student,
      };
    }

    // Generate random secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const timestamp = new Date().toISOString();

    const updatedVoters = state.voters.map((v) => {
      if (v.id === voterId) {
        return {
          ...v,
          activeOtp: otp,
          otpCreatedAt: timestamp,
          otpIssuedBy: officerDesk,
          otpStatus: "ACTIVE",
        };
      }
      return v;
    });

    setState((prev) => ({
      ...prev,
      voters: updatedVoters,
    }));

    addAuditLog(
      student.schoolId,
      "OTP_ISSUED",
      officerDesk,
      `Issued One-Time Password (OTP: ${otp}) for ${student.fullName} (Index: ${student.indexNumber}, Level: ${student.form})`
    );

    showToast(`Generated OTP ${otp} for ${student.fullName}!`, "success");
    return { success: true, otp, student: { ...student, activeOtp: otp, otpStatus: "ACTIVE", otpCreatedAt: timestamp, otpIssuedBy: officerDesk } };
  };

  const revokeVoterOtp = (voterId, officerDesk = "Station Desk 1") => {
    const student = state.voters.find((v) => v.id === voterId);
    if (!student) return { success: false };

    const updatedVoters = state.voters.map((v) => {
      if (v.id === voterId) {
        return {
          ...v,
          activeOtp: null,
          otpStatus: "UNISSUED",
        };
      }
      return v;
    });

    setState((prev) => ({
      ...prev,
      voters: updatedVoters,
    }));

    addAuditLog(
      student.schoolId,
      "OTP_REVOKED",
      officerDesk,
      `Revoked One-Time Password for ${student.fullName} (Index: ${student.indexNumber})`
    );

    showToast(`Revoked OTP for ${student.fullName}`, "info");
    return { success: true };
  };

  const lookupVoterForAccreditation = (indexNumber, formLevel = "", electionId = "") => {
    const cleanIndex = indexNumber.trim().toLowerCase();
    const cleanLevel = formLevel.trim().toLowerCase();
    const targetElectionId = electionId || activeElectionId;

    const matched = state.voters.filter((v) => {
      const matchElection = !targetElectionId || v.electionId === targetElectionId;
      const matchIndex = v.indexNumber.toLowerCase().includes(cleanIndex);
      const matchLevel = !cleanLevel || cleanLevel === "all" || v.form.toLowerCase().includes(cleanLevel);
      return matchElection && matchIndex && matchLevel;
    });

    return matched;
  };

  const loginAsOfficer = (username, password, schoolId = "") => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const officer = (state.officers || []).find(
      (o) => o.username.toLowerCase() === cleanUser && (!schoolId || o.schoolId === schoolId)
    );

    if (!officer) {
      return {
        success: false,
        message: `Invalid officer username '${username}'. Please verify the credentials issued by the Electoral Commissioner.`,
      };
    }

    if (officer.status === "suspended") {
      return {
        success: false,
        isSuspended: true,
        message: `ACCESS DENIED: Officer account '${officer.name}' has been SUSPENDED by the Electoral Commissioner. You cannot access the OTP station.`,
      };
    }

    if (officer.password !== cleanPass) {
      return {
        success: false,
        message: "Incorrect password. If you forgot your password, contact the School Electoral Commissioner to reset your default credentials.",
      };
    }

    const officerSchool = state.schools.find((s) => s.id === officer.schoolId) || state.schools[0];
    setActiveSchoolId(officerSchool.id);
    setActiveElectionId("");

    setCurrentUser({
      role: "officer",
      officerId: officer.id,
      schoolId: officer.schoolId,
      username: officer.username,
      name: officer.name,
      officerDesk: officer.desk,
      phone: officer.phone,
      isPasswordChanged: officer.isPasswordChanged,
    });

    addAuditLog(
      officer.schoolId,
      "OFFICER_LOGIN",
      officer.name,
      `EC Officer logged into accreditation desk '${officer.desk}'.`
    );

    showToast(`Welcome, ${officer.name}! Authenticated for ${officer.desk}.`, "success");
    return { success: true, officer };
  };

  const changeOfficerPassword = (officerId, currentPassword, newPassword) => {
    const officer = (state.officers || []).find((o) => o.id === officerId);
    if (!officer) {
      return { success: false, message: "Officer record not found." };
    }
    if (officer.password !== currentPassword.trim()) {
      return { success: false, message: "Current password does not match." };
    }
    if (newPassword.trim().length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }

    const updatedOfficers = (state.officers || []).map((o) =>
      o.id === officerId
        ? { ...o, password: newPassword.trim(), isPasswordChanged: true }
        : o
    );

    setState((prev) => ({ ...prev, officers: updatedOfficers }));

    if (currentUser?.officerId === officerId) {
      setCurrentUser((prev) => ({ ...prev, isPasswordChanged: true }));
    }

    addAuditLog(
      officer.schoolId,
      "OFFICER_PASSWORD_CHANGE",
      officer.name,
      `Officer '${officer.name}' changed password for Election Day.`
    );

    showToast("Password successfully changed for Election Day!", "success");
    return { success: true };
  };

  const addOfficerByAdmin = ({ name, username, desk, defaultPassword, phone, schoolId }) => {
    const cleanUser = username.trim().toLowerCase();
    const exists = (state.officers || []).some((o) => o.username.toLowerCase() === cleanUser);
    if (exists) {
      return { success: false, message: `Username '${username}' is already taken. Please choose another.` };
    }

    const newOfficer = {
      id: `off_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      schoolId: schoolId || activeSchoolId,
      name: name.trim(),
      username: cleanUser,
      desk: desk.trim() || "Station Desk 1",
      password: defaultPassword.trim() || "123",
      phone: phone?.trim() || "",
      status: "active",
      isPasswordChanged: false,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      officers: [...(prev.officers || []), newOfficer],
    }));

    addAuditLog(
      newOfficer.schoolId,
      "OFFICER_RECRUITED",
      currentUser?.name || "EC Admin",
      `Recruited new EC Officer '${newOfficer.name}' for '${newOfficer.desk}'. Default password issued.`
    );

    showToast(`Officer '${newOfficer.name}' recruited successfully!`, "success");
    return { success: true, officer: newOfficer };
  };

  const toggleOfficerStatus = (officerId) => {
    const officer = (state.officers || []).find((o) => o.id === officerId);
    if (!officer) return;

    const newStatus = officer.status === "active" ? "suspended" : "active";
    const updatedOfficers = (state.officers || []).map((o) =>
      o.id === officerId ? { ...o, status: newStatus } : o
    );

    setState((prev) => ({ ...prev, officers: updatedOfficers }));

    addAuditLog(
      officer.schoolId,
      newStatus === "suspended" ? "OFFICER_SUSPENDED" : "OFFICER_ACTIVATED",
      currentUser?.name || "EC Admin",
      `Officer '${officer.name}' access status changed to ${newStatus.toUpperCase()}.`
    );

    showToast(`Officer '${officer.name}' is now ${newStatus.toUpperCase()}.`, newStatus === "suspended" ? "warning" : "success");
  };

  const adminResetOfficerPassword = (officerId, newDefaultPassword = "123") => {
    const officer = (state.officers || []).find((o) => o.id === officerId);
    if (!officer) return;

    const updatedOfficers = (state.officers || []).map((o) =>
      o.id === officerId
        ? { ...o, password: newDefaultPassword.trim(), isPasswordChanged: false }
        : o
    );

    setState((prev) => ({ ...prev, officers: updatedOfficers }));

    addAuditLog(
      officer.schoolId,
      "OFFICER_PASSWORD_RESET",
      currentUser?.name || "EC Admin",
      `Reset password for Officer '${officer.name}' to default (${newDefaultPassword.trim()}).`
    );

    showToast(`Reset password for '${officer.name}' to default (${newDefaultPassword.trim()}).`, "info");
    return { success: true };
  };

  const deleteOfficerByAdmin = (officerId) => {
    const officer = (state.officers || []).find((o) => o.id === officerId);
    if (!officer) return;

    setState((prev) => ({
      ...prev,
      officers: (prev.officers || []).filter((o) => o.id !== officerId),
    }));

    addAuditLog(
      officer.schoolId,
      "OFFICER_DELETED",
      currentUser?.name || "EC Admin",
      `Deleted officer '${officer.name}' from polling station roster.`
    );

    showToast(`Officer '${officer.name}' deleted.`, "info");
  };

  // Student First-Time Custom Password Setup
  const createStudentCustomPassword = (electionCode, indexNumber, newPassword) => {
    const cleanCode = electionCode.trim().toUpperCase();
    const cleanIndex = indexNumber.trim();
    const cleanNewPass = newPassword.trim();

    if (cleanNewPass.length < 4) {
      return { success: false, message: "Password must be at least 4 characters long." };
    }

    const matchedElection = state.elections.find((e) => e.code.toUpperCase() === cleanCode);
    if (!matchedElection) {
      return { success: false, message: `Invalid Election Code '${cleanCode}'.` };
    }

    const student = state.voters.find(
      (v) => v.electionId === matchedElection.id && v.indexNumber === cleanIndex
    );

    if (!student) {
      return { success: false, message: `Student Index Number '${cleanIndex}' not registered for '${matchedElection.title}'.` };
    }

    if (student.hasVoted) {
      return { success: false, message: "This student account has already voted!" };
    }

    const updatedVoters = state.voters.map((vtr) => {
      if (vtr.id === student.id) {
        return {
          ...vtr,
          customPassword: cleanNewPass,
          isPasswordChanged: true,
        };
      }
      return vtr;
    });

    setState((prev) => ({ ...prev, voters: updatedVoters }));

    addAuditLog(
      matchedElection.schoolId,
      "PASSWORD_SECURITY_UPDATE",
      `Student Index: ${cleanIndex}`,
      `${student.fullName} created their private password for '${matchedElection.title}'.`
    );

    showToast("Private password created successfully! You may now log in.", "success");
    return { success: true };
  };

  const adminResetStudentPassword = (voterId) => {
    setState((prev) => ({
      ...prev,
      voters: prev.voters.map((v) =>
        v.id === voterId
          ? {
              ...v,
              passwordPin: "1234",
              customPassword: null,
              isPasswordChanged: false,
            }
          : v
      ),
    }));

    showToast(`Reset student password to default '1234'`, "success");
  };

  // --- ADMIN & SUPER ADMIN AUTH ---
  const loginAsAdmin = (username, password, schoolIdOrCode = "") => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanSchoolTarget = schoolIdOrCode ? schoolIdOrCode.trim().toLowerCase() : "";

    const superAdminAccount = state.superAdmin || INITIAL_SUPER_ADMIN;
    if (cleanUser === superAdminAccount.username.toLowerCase() && cleanPass === superAdminAccount.password) {
      setCurrentUser({
        role: "super_admin",
        name: superAdminAccount.name,
      });
      showToast("Logged in as Platform Developer (Super Admin)", "success");
      return { success: true, role: "super_admin" };
    }

    // If School Code is provided:
    if (cleanSchoolTarget) {
      const targetSchool = state.schools.find(
        (s) => s.code.toLowerCase() === cleanSchoolTarget || s.id.toLowerCase() === cleanSchoolTarget
      );

      if (!targetSchool) {
        return {
          success: false,
          message: `No high school found matching School Code "${schoolIdOrCode.toUpperCase()}". Please verify your School Code.`,
        };
      }

      const schoolAdmin = state.schoolAdmins.find(
        (sa) =>
          sa.schoolId === targetSchool.id &&
          sa.username.toLowerCase() === cleanUser &&
          sa.password === cleanPass
      );

      if (!schoolAdmin) {
        return {
          success: false,
          message: `Invalid username or password for ${targetSchool.name} (${targetSchool.code}).`,
        };
      }

      if (targetSchool.status === "terminated") {
        return { success: false, message: "This school election account has been TERMINATED by Super Admin." };
      }
      if (targetSchool.status === "suspended") {
        return { success: false, message: "This school election account is currently SUSPENDED by Super Admin." };
      }

      setActiveSchoolId(targetSchool.id);
      setActiveElectionId("");

      setCurrentUser({
        role: "school_admin",
        schoolId: targetSchool.id,
        username: schoolAdmin.username,
        name: schoolAdmin.name,
        school: targetSchool,
      });
      showToast(`Logged in as EC Administrator for ${targetSchool.name}`, "success");
      return { success: true, role: "school_admin", school: targetSchool };
    }

    // If School Code is NOT provided:
    const matchingAdmins = state.schoolAdmins.filter(
      (sa) => sa.username.toLowerCase() === cleanUser && sa.password === cleanPass
    );

    if (matchingAdmins.length === 0) {
      return {
        success: false,
        message: "Invalid admin credentials. Please provide your School Code (e.g. ACH-2026 or PRM-2026), username, and password.",
      };
    }

    if (matchingAdmins.length > 1) {
      return {
        success: false,
        message: `Multiple schools share the username '${username}'. Please enter your School Code (e.g. ACH-2026 or PRM-2026) to identify your school.`,
      };
    }

    const chosenAdmin = matchingAdmins[0];
    const school = state.schools.find((s) => s.id === chosenAdmin.schoolId);

    if (school?.status === "terminated") {
      return { success: false, message: "This school election account has been TERMINATED by Super Admin." };
    }
    if (school?.status === "suspended") {
      return { success: false, message: "This school election account is currently SUSPENDED by Super Admin." };
    }

    setActiveSchoolId(chosenAdmin.schoolId);
    setActiveElectionId("");

    setCurrentUser({
      role: "school_admin",
      schoolId: chosenAdmin.schoolId,
      username: chosenAdmin.username,
      name: chosenAdmin.name,
      school,
    });
    showToast(`Logged in as EC Administrator for ${school?.name}`, "success");
    return { success: true, role: "school_admin", school };
  };

  const switchToSchoolAdmin = (schoolId) => {
    const school = state.schools.find((s) => s.id === schoolId);
    const sa = state.schoolAdmins.find((a) => a.schoolId === schoolId);
    if (!school || !sa) return;

    setActiveSchoolId(schoolId);
    setActiveElectionId("");

    setCurrentUser({
      role: "school_admin",
      schoolId: schoolId,
      username: sa.username,
      name: sa.name,
      school,
      switchedFromSuperAdmin: currentUser?.role === "super_admin" || Boolean(currentUser?.switchedFromSuperAdmin),
    });
    showToast(`Switched to EC Administrator console for ${school.name}`, "info");
  };

  const switchToSuperAdmin = () => {
    const superAdminAccount = state.superAdmin || INITIAL_SUPER_ADMIN;
    setCurrentUser({
      role: "super_admin",
      name: superAdminAccount.name,
    });
    showToast("Returned to Platform Developer Console", "info");
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_ELECTION_KEY);
    } catch {}
    showToast("Logged out successfully.", "info");
  };

  const changeDeveloperPassword = (currentPassword, newPassword) => {
    const superAdminAccount = state.superAdmin || INITIAL_SUPER_ADMIN;
    if (currentPassword.trim() !== superAdminAccount.password) {
      return { success: false, message: "Current Developer Password does not match." };
    }
    if (newPassword.trim().length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }

    const updatedSuperAdmin = {
      ...superAdminAccount,
      password: newPassword.trim(),
    };

    setState((prev) => ({
      ...prev,
      superAdmin: updatedSuperAdmin,
    }));

    addAuditLog(
      activeSchoolId,
      "DEVELOPER_PASSWORD_CHANGE",
      "Platform Developer",
      "Platform Developer updated the Super Admin access password."
    );

    showToast("Developer access password updated successfully!", "success");
    return { success: true };
  };

  const updateSystemConfig = (newConfig) => {
    setState((prev) => ({
      ...prev,
      systemConfig: {
        ...(prev.systemConfig || INITIAL_SYSTEM_CONFIG),
        ...newConfig,
      },
    }));

    addAuditLog(
      activeSchoolId,
      "SYSTEM_CONFIG_UPDATED",
      "Platform Developer",
      "Platform Developer updated system appearance and background colors."
    );

    showToast("System background theme & configuration updated!", "success");
    return { success: true };
  };

  const updateSchoolAdminPassword = (schoolId, newPassword) => {
    if (!newPassword || newPassword.trim().length < 3) {
      return { success: false, message: "Password must be at least 3 characters." };
    }

    const updatedAdmins = state.schoolAdmins.map((sa) =>
      sa.schoolId === schoolId ? { ...sa, password: newPassword.trim() } : sa
    );

    setState((prev) => ({
      ...prev,
      schoolAdmins: updatedAdmins,
    }));

    const targetSchool = state.schools.find((s) => s.id === schoolId);
    showToast(`Updated EC Admin password for ${targetSchool?.shortName || "School"} to '${newPassword.trim()}'`, "success");
    return { success: true };
  };

  // --- CREATE NEW ELECTION SESSION BY SCHOOL ADMIN ---
  const addElectionBySchoolAdmin = (schoolId, electionData) => {
    lastLocalActionTimestampRef.current = Date.now();
    const newId = `elec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const nowISO = new Date().toISOString();
    const defaultEnd = new Date(Date.now() + 8 * 3600000).toISOString(); // Default +8 hours

    const newElection = {
      id: newId,
      schoolId,
      status: "not_started",
      allowAbstain: true,
      startTime: electionData.startTime || nowISO,
      endTime: electionData.endTime || defaultEnd,
      ...electionData,
      code: electionData.code.trim().toUpperCase(),
    };

    const samplePos = {
      id: `pos_${newId}_1`,
      schoolId,
      electionId: newId,
      title: electionData.type.includes("Class") ? "Class Captain / Prefect" : "Executive Prefect",
      description: `Primary leadership role for ${electionData.title}`,
      order: 1,
    };

    setState((prev) => {
      const nextState = {
        ...prev,
        version: (prev.version || 1) + 1,
        updatedAt: Date.now(),
        elections: [...prev.elections, newElection],
        positions: [...prev.positions, samplePos],
      };
      const json = JSON.stringify(nextState);
      lastSyncedJsonRef.current = json;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
      } catch (e) {}
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      }).catch(() => {});
      return nextState;
    });

    setActiveElectionId(newId);

    addAuditLog(
      schoolId,
      "ELECTION_CREATED",
      "School EC Admin",
      `Created new election session (Inactive): '${electionData.title}' (Code: ${newElection.code})`
    );

    showToast(`Election '${electionData.title}' created (Inactive)! Electoral Commissioner can launch when ready.`, "success");
  };

  const updateElectionTimes = (electionId, startTime, endTime) => {
    setState((prev) => ({
      ...prev,
      elections: prev.elections.map((e) =>
        e.id === electionId ? { ...e, startTime, endTime } : e
      ),
    }));

    const elec = state.elections.find((e) => e.id === electionId);
    addAuditLog(
      elec?.schoolId,
      "SCHEDULE_UPDATE",
      "School EC Admin",
      `Updated schedule for election '${elec?.title}': Start: ${startTime}, End: ${endTime}`
    );

    showToast(`Updated voting start and end times for '${elec?.title}'.`, "success");
  };

  const updateSchoolBranding = (schoolId, brandingData) => {
    setState((prev) => ({
      ...prev,
      schools: prev.schools.map((s) =>
        s.id === schoolId ? { ...s, ...brandingData } : s
      ),
    }));

    const school = state.schools.find((s) => s.id === schoolId);
    addAuditLog(
      schoolId,
      "BRANDING_UPDATE",
      "School EC Admin",
      `Updated branding for ${school?.name}`
    );

    showToast(`School branding & identity updated for ${school?.name}!`, "success");
  };

  const toggleElectionSessionStatus = (electionId, newStatus) => {
    lastLocalActionTimestampRef.current = Date.now();
    const nextVersion = (stateRef.current?.version || 1) + 1;
    const nextUpdatedAt = Date.now();

    setState((prev) => {
      const updatedElections = prev.elections.map((e) =>
        e.id === electionId ? { ...e, status: newStatus } : e
      );
      const nextState = {
        ...prev,
        version: nextVersion,
        updatedAt: nextUpdatedAt,
        elections: updatedElections,
      };

      const json = JSON.stringify(nextState);
      lastSyncedJsonRef.current = json;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
      } catch (e) {}

      // Immediately push to cloud state to prevent race-condition reverts
      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      }).catch(() => {});

      return nextState;
    });

    const elec = state.elections.find((e) => e.id === electionId);
    addAuditLog(
      elec?.schoolId,
      "ELECTION_STATUS_CHANGE",
      currentUser?.name || "School EC Admin",
      `Changed status of '${elec?.title}' to ${newStatus.toUpperCase()}`
    );

    showToast(`Election '${elec?.title || "Session"}' status set to ${newStatus.toUpperCase()}`, "success");
  };

  const deleteElection = (electionId) => {
    if (!electionId) return { success: false, message: "No election selected." };
    const targetElec = state.elections.find((e) => e.id === electionId);
    if (!targetElec) return { success: false, message: "Election not found." };

    lastLocalActionTimestampRef.current = Date.now();
    const nextVersion = (stateRef.current?.version || 1) + 1;
    const nextUpdatedAt = Date.now();

    const remainingSchoolElections = state.elections.filter(
      (e) => e.schoolId === targetElec.schoolId && e.id !== electionId
    );
    const nextActiveId = remainingSchoolElections.length > 0 ? remainingSchoolElections[0].id : "";

    setState((prev) => {
      const nextState = {
        ...prev,
        version: nextVersion,
        updatedAt: nextUpdatedAt,
        elections: prev.elections.filter((e) => e.id !== electionId),
        positions: prev.positions.filter((p) => p.electionId !== electionId),
        candidates: prev.candidates.filter((c) => c.electionId !== electionId),
        voters: prev.voters.filter((v) => v.electionId !== electionId),
      };

      const json = JSON.stringify(nextState);
      lastSyncedJsonRef.current = json;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
      } catch (e) {}

      fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      }).catch(() => {});

      return nextState;
    });

    if (activeElectionId === electionId) {
      setActiveElectionId(nextActiveId);
    }

    addAuditLog(
      targetElec.schoolId,
      "ELECTION_DELETED",
      currentUser?.name || "School EC Admin",
      `Permanently deleted election session '${targetElec.title}' (Code: ${targetElec.code}) along with its candidates, positions, and registered voter rosters.`
    );

    showToast(`Election '${targetElec.title}' deleted successfully.`, "info");
    return { success: true };
  };

  // --- VOTING ACTION WITH ELECTION & CLASS TALLY ---
  const castVote = (selections) => {
    if (!currentUser || currentUser.role !== "voter") {
      return { success: false, message: "No active voter session." };
    }

    const { student, schoolId, electionId } = currentUser;
    const currentVoter = state.voters.find((v) => v.id === student.id);

    if (currentVoter?.hasVoted) {
      return { success: false, message: "You have already cast your ballot!" };
    }

    const timestamp = new Date().toISOString();
    const schoolPrefix = activeSchool?.shortName?.substring(0, 3).toUpperCase() || "VOT";
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const verificationCode = `${schoolPrefix}-VOTE-${randomHex}`;

    const studentClass = student.form.includes("1")
      ? "SHS 1"
      : student.form.includes("2")
      ? "SHS 2"
      : "SHS 3";

    const updatedCandidates = state.candidates.map((cand) => {
      const selectedCandId = selections[cand.positionId];
      if (selectedCandId === cand.id) {
        const classVotes = cand.classVotes || { "SHS 1": 0, "SHS 2": 0, "SHS 3": 0 };
        return {
          ...cand,
          votes: cand.votes + 1,
          classVotes: {
            ...classVotes,
            [studentClass]: (classVotes[studentClass] || 0) + 1,
          },
        };
      }
      return cand;
    });

    const updatedVoters = state.voters.map((vtr) => {
      if (vtr.id === student.id) {
        return {
          ...vtr,
          hasVoted: true,
          votedAt: timestamp,
          verificationCode,
          activeOtp: null,
          otpStatus: "USED",
        };
      }
      return vtr;
    });

    setState((prev) => ({
      ...prev,
      candidates: updatedCandidates,
      voters: updatedVoters,
    }));

    addAuditLog(
      schoolId,
      "VOTE_CAST",
      `Student Index: ${student.indexNumber}`,
      `Ballot cast for election '${activeElection?.title}' by ${student.fullName} (${studentClass}). Verification Code: ${verificationCode}`
    );

    const updatedStudent = {
      ...student,
      hasVoted: true,
      votedAt: timestamp,
      verificationCode,
    };

    setCurrentUser({
      ...currentUser,
      student: updatedStudent,
    });

    showToast("Vote submitted successfully! Official receipt generated.", "success");

    return {
      success: true,
      verificationCode,
      timestamp,
      selections,
      student: updatedStudent,
    };
  };

  // --- CANDIDATES & POSITIONS ACTIONS ---
  const addCandidate = (candData) => {
    const newId = `cand_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const targetElectionId = candData.electionId || activeElectionId;

    const newCand = {
      id: newId,
      electionId: targetElectionId,
      ...candData,
      votes: 0,
      classVotes: { "SHS 1": 0, "SHS 2": 0, "SHS 3": 0 },
    };

    setState((prev) => ({
      ...prev,
      candidates: [...prev.candidates, newCand],
    }));

    addAuditLog(
      candData.schoolId,
      "CANDIDATE_ADD",
      "School EC Admin",
      `Nominated candidate ${candData.name} for position ${candData.positionId}`
    );

    showToast(`Candidate '${candData.name}' added successfully!`, "success");
  };

  const deleteCandidate = (id) => {
    const cand = state.candidates.find((c) => c.id === id);
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((c) => c.id !== id),
    }));

    if (cand) {
      addAuditLog(cand.schoolId, "CANDIDATE_DELETE", "School EC Admin", `Removed candidate ${cand.name}`);
    }
    showToast("Candidate removed.", "info");
  };

  const addPosition = (posData) => {
    const newId = `pos_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const targetElectionId = posData.electionId || activeElectionId;

    const newPos = {
      id: newId,
      electionId: targetElectionId,
      ...posData,
      order: state.positions.filter((p) => p.electionId === targetElectionId).length + 1,
    };

    setState((prev) => ({
      ...prev,
      positions: [...prev.positions, newPos],
    }));

    showToast(`Position '${posData.title}' created.`, "success");
  };

  const deletePosition = (id) => {
    setState((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.id !== id),
      candidates: prev.candidates.filter((c) => c.positionId !== id),
    }));
    showToast("Position removed.", "info");
  };

  const addVoter = (voterData) => {
    const cleanIndex = voterData.indexNumber.trim();
    const targetElectionId = voterData.electionId || activeElectionId;

    const exists = state.voters.some(
      (v) => v.electionId === targetElectionId && v.indexNumber === cleanIndex
    );

    if (exists) {
      showToast(`Index Number ${cleanIndex} already exists in this election register!`, "error");
      return false;
    }

    const newVoter = {
      id: `vtr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      electionId: targetElectionId,
      ...voterData,
      indexNumber: cleanIndex,
      isPasswordChanged: false,
      customPassword: null,
      hasVoted: false,
      votedAt: null,
      verificationCode: null,
    };

    setState((prev) => ({
      ...prev,
      voters: [...prev.voters, newVoter],
    }));

    showToast(`Voter ${voterData.fullName} (${voterData.form}) registered for this election.`, "success");
    return true;
  };

  // Helper for flexible Excel/CSV column matching
  const extractRowField = (row, candidateKeys, fallback = "") => {
    if (!row || typeof row !== "object") return fallback;
    const rowKeys = Object.keys(row);

    // 1. Direct key match
    for (const cKey of candidateKeys) {
      if (row[cKey] !== undefined && row[cKey] !== null && String(row[cKey]).trim() !== "") {
        return String(row[cKey]).trim();
      }
    }

    // 2. Normalized fuzzy match (ignore case, spaces, underscores, dashes)
    for (const cKey of candidateKeys) {
      const normCandidate = cKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const rKey of rowKeys) {
        const normRowKey = rKey.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normRowKey === normCandidate || (normRowKey && normCandidate.includes(normRowKey))) {
          const val = row[rKey];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            return String(val).trim();
          }
        }
      }
    }

    return fallback;
  };

  // UPLOAD REGISTER SPECIFICALLY TO CURRENT ELECTION (electionId)
  const uploadVoterRegister = (schoolId, electionId, newVotersList, targetForm = "AUTO", mode = "append") => {
    const targetElectionId = electionId || activeElectionId;
    const school = state.schools.find((s) => s.id === schoolId);
    const schoolPrefix = school?.shortName?.substring(0, 3).toUpperCase() || "STU";

    const formattedNewVoters = newVotersList.map((item, idx) => {
      const rawIndex = extractRowField(item, [
        "indexNumber", "IndexNumber", "Index Number", "index_number", "index",
        "studentId", "student_id", "Student ID", "id", "ID", "indexNo", "index_no", "regNo", "registrationNumber",
        "sn", "s/n", "SN", "S/N", "no", "No", "no.", "No.", "#", "roll", "rollno", "Roll",
        "admNo", "admission", "Admission", "voterId", "code"
      ]);

      const rawName = extractRowField(item, [
        "fullName", "FullName", "Full Name", "full_name", "name", "Name",
        "studentName", "student_name", "Student Name", "student", "Student",
        "voterName", "voter_name", "Voter Name", "surname", "Surname"
      ], `Student ${idx + 1}`);

      const rawPass = extractRowField(item, [
        "passwordPin", "PasswordPin", "Password", "password", "pin", "PIN",
        "pinCode", "code", "pass", "secret"
      ], "1234");

      const rawHouse = extractRowField(item, [
        "house", "House", "dormitory", "Dormitory", "hall", "Hall", "residence"
      ], "General House");

      const rawFormStr = extractRowField(item, [
        "form", "Form", "class", "Class", "formClass", "form_class", "grade", "level"
      ], "");

      let finalForm = "SHS 1";
      if (targetForm !== "AUTO") {
        finalForm = targetForm;
      } else {
        const itemForm = rawFormStr.toUpperCase();
        if (itemForm.includes("1")) finalForm = "SHS 1";
        else if (itemForm.includes("2")) finalForm = "SHS 2";
        else if (itemForm.includes("3")) finalForm = "SHS 3";
        else finalForm = "SHS 1";
      }

      // If index is missing or blank, auto-generate a valid unique student index
      let finalIndex = rawIndex ? String(rawIndex).trim() : "";
      if (!finalIndex) {
        const classNum = finalForm.includes("1") ? "101" : finalForm.includes("2") ? "102" : "103";
        finalIndex = `${classNum}00${String(idx + 1).padStart(4, "0")}`;
      }

      return {
        id: `vtr_csv_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        schoolId,
        electionId: targetElectionId,
        indexNumber: finalIndex,
        fullName: rawName,
        passwordPin: rawPass,
        form: finalForm,
        house: rawHouse,
        isPasswordChanged: false,
        customPassword: null,
        hasVoted: false,
        votedAt: null,
        verificationCode: null,
      };
    });

    if (formattedNewVoters.length === 0) {
      showToast("No voter rows found in uploaded file. Please check file formatting.", "error");
      return;
    }

    let addedCount = 0;
    let updatedCount = 0;

    setState((prev) => {
      let updatedList;
      if (mode === "replace") {
        // Replace voters for this specific election and target class
        const otherVoters = prev.voters.filter(
          (v) => v.electionId !== targetElectionId || (targetForm !== "AUTO" && v.form !== targetForm)
        );
        updatedList = [...otherVoters, ...formattedNewVoters];
        addedCount = formattedNewVoters.length;
      } else {
        const uploadedMap = new Map();
        formattedNewVoters.forEach((v) => uploadedMap.set(v.indexNumber, v));

        const updatedExisting = prev.voters.map((v) => {
          // Class-isolated matching: only update if within the same target class when specified
          const formMatches = targetForm === "AUTO" || v.form === targetForm;
          if (v.electionId === targetElectionId && formMatches && uploadedMap.has(v.indexNumber)) {
            const newInfo = uploadedMap.get(v.indexNumber);
            uploadedMap.delete(v.indexNumber);
            updatedCount++;
            return {
              ...v,
              fullName: newInfo.fullName || v.fullName,
              passwordPin: newInfo.passwordPin || v.passwordPin,
              form: newInfo.form || v.form,
              house: newInfo.house || v.house,
            };
          }
          return v;
        });

        const brandNewVoters = Array.from(uploadedMap.values());
        addedCount = brandNewVoters.length;
        updatedList = [...updatedExisting, ...brandNewVoters];
      }
      return { ...prev, voters: updatedList };
    });

    const formLabel = targetForm !== "AUTO" ? targetForm : "Excel register";
    const elec = state.elections.find((e) => e.id === targetElectionId);

    addAuditLog(
      schoolId,
      "REGISTER_UPLOAD",
      "School EC Admin",
      `Uploaded register for '${elec?.title}' (${formLabel}): ${addedCount} added, ${updatedCount} updated.`
    );

    if (updatedCount > 0 && addedCount > 0) {
      showToast(`${addedCount} new student(s) added & ${updatedCount} updated in ${formLabel} register!`, "success");
    } else if (updatedCount > 0) {
      showToast(`${updatedCount} student record(s) updated in ${formLabel} register!`, "success");
    } else {
      showToast(`Successfully registered all ${addedCount} student(s) in ${formLabel}!`, "success");
    }
  };

  const deleteVoter = (voterId) => {
    setState((prev) => ({
      ...prev,
      voters: prev.voters.filter((v) => v.id !== voterId),
    }));
    showToast("Voter removed from election register.", "info");
  };

  const resetVoterStatus = (voterId) => {
    setState((prev) => ({
      ...prev,
      voters: prev.voters.map((v) =>
        v.id === voterId
          ? { ...v, hasVoted: false, votedAt: null, verificationCode: null }
          : v
      ),
    }));
    showToast("Voter voting status reset to pending.", "info");
  };

  const toggleElectionStatus = (schoolId, newStatus) => {
    setState((prev) => ({
      ...prev,
      schools: prev.schools.map((s) => (s.id === schoolId ? { ...s, status: newStatus } : s)),
    }));

    const school = state.schools.find((s) => s.id === schoolId);
    addAuditLog(
      schoolId,
      "ELECTION_STATUS_CHANGE",
      "Admin",
      `Election status for ${school?.name} set to ${newStatus.toUpperCase()}`
    );

    showToast(`Election status set to ${newStatus.toUpperCase()}`, "success");
  };

  const addSchoolByDeveloper = (schoolData, adminUsername, adminPassword) => {
    const cleanCode = schoolData.code.trim().toUpperCase();

    // Validate unique school code
    const existingCode = state.schools.find((s) => s.code.toUpperCase() === cleanCode);
    if (existingCode) {
      showToast(`School Code '${cleanCode}' is already assigned to '${existingCode.name}'. School Codes must be unique!`, "error");
      return { success: false, message: `School Code '${cleanCode}' is already taken by ${existingCode.name}.` };
    }

    const cleanAdminUser = (adminUsername || `admin_${schoolData.shortName.toLowerCase()}`).trim();
    const cleanAdminPass = (adminPassword || "123").trim();

    const newId = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newSchool = {
      id: newId,
      status: "active",
      votingStartTime: new Date().toISOString(),
      votingEndTime: new Date(Date.now() + 86400000).toISOString(),
      allowAbstain: true,
      ...schoolData,
      code: cleanCode,
    };

    const newElectionId = `elec_${newId}_gen`;
    const newElection = {
      id: newElectionId,
      schoolId: newId,
      title: "General School Election",
      code: cleanCode,
      type: "General Prefectural",
      description: `Official general prefectural election for ${schoolData.name}`,
      status: "not_started",
      allowAbstain: true,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
    };

    const newAdmin = {
      id: `admin_${newId}`,
      schoolId: newId,
      username: cleanAdminUser,
      password: cleanAdminPass,
      name: `${schoolData.name} Electoral Commissioner`,
    };

    const samplePos = {
      id: `pos_${newElectionId}_1`,
      schoolId: newId,
      electionId: newElectionId,
      title: "Senior Prefect (Head Prefect)",
      description: "Chief student leader for the school.",
      order: 1,
    };

    setState((prev) => ({
      ...prev,
      schools: [...prev.schools, newSchool],
      elections: [...prev.elections, newElection],
      schoolAdmins: [...prev.schoolAdmins, newAdmin],
      positions: [...prev.positions, samplePos],
    }));

    const matchingAdminsCount = state.schoolAdmins.filter(
      (sa) => sa.username.toLowerCase() === cleanAdminUser.toLowerCase()
    ).length;

    if (matchingAdminsCount > 0) {
      showToast(
        `Provisioned '${schoolData.name}'! (Shared username '${cleanAdminUser}' isolated via School Code ${cleanCode})`,
        "success"
      );
    } else {
      showToast(
        `Developer: Provisioned '${schoolData.name}' (Code: ${cleanCode}) successfully!`,
        "success"
      );
    }

    return { success: true };
  };

  const toggleSchoolAccountStatus = (schoolId, newStatus) => {
    setState((prev) => ({
      ...prev,
      schools: prev.schools.map((s) => (s.id === schoolId ? { ...s, status: newStatus } : s)),
    }));

    const school = state.schools.find((s) => s.id === schoolId);
    showToast(
      `Platform Developer: Account for '${school?.name}' set to ${newStatus.toUpperCase()}`,
      newStatus === "terminated" ? "error" : "info"
    );
  };

  const deleteSchoolByDeveloper = (schoolId) => {
    const targetSch = state.schools.find((s) => s.id === schoolId);
    setState((prev) => ({
      ...prev,
      schools: prev.schools.filter((s) => s.id !== schoolId),
      elections: prev.elections.filter((e) => e.schoolId !== schoolId),
      schoolAdmins: prev.schoolAdmins.filter((sa) => sa.schoolId !== schoolId),
      officers: (prev.officers || []).filter((o) => o.schoolId !== schoolId),
      positions: prev.positions.filter((p) => p.schoolId !== schoolId),
      candidates: prev.candidates.filter((c) => c.schoolId !== schoolId),
      voters: prev.voters.filter((v) => v.schoolId !== schoolId),
    }));
    showToast(`School account '${targetSch?.name || schoolId}' permanently purged.`, "info");
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_SCHOOL_KEY);
      localStorage.removeItem(ACTIVE_ELECTION_KEY);
      localStorage.removeItem("gh_shs_admin_tab");
    } catch {}
    setState({
      schools: INITIAL_SCHOOLS,
      elections: INITIAL_ELECTIONS,
      positions: INITIAL_POSITIONS,
      candidates: INITIAL_CANDIDATES,
      voters: INITIAL_VOTERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      schoolAdmins: INITIAL_SCHOOL_ADMINS,
      officers: INITIAL_OFFICERS,
      superAdmin: INITIAL_SUPER_ADMIN,
      systemConfig: INITIAL_SYSTEM_CONFIG,
    });
    setActiveSchoolId(INITIAL_SCHOOLS[0].id);
    setActiveElectionId("");
    setCurrentUser(null);
    showToast("Application reset to default state.", "info");
  };

  return (
    <VotingContext.Provider
      value={{
        schools: state.schools,
        elections: state.elections,
        positions: state.positions,
        candidates: state.candidates,
        voters: state.voters,
        auditLogs: state.auditLogs,
        schoolAdmins: state.schoolAdmins,
        officers: state.officers || [],
        activeSchool,
        activeSchoolId,
        setActiveSchoolId,
        activeElection,
        activeElectionId,
        setActiveElectionId,
        currentUser,
        loginAsVoter,
        generateVoterOtp,
        revokeVoterOtp,
        lookupVoterForAccreditation,
        loginAsOfficer,
        changeOfficerPassword,
        addOfficerByAdmin,
        toggleOfficerStatus,
        adminResetOfficerPassword,
        deleteOfficerByAdmin,
        createStudentCustomPassword,
        adminResetStudentPassword,
        loginAsAdmin,
        switchToSchoolAdmin,
        switchToSuperAdmin,
        logout,
        castVote,
        addCandidate,
        deleteCandidate,
        addPosition,
        deletePosition,
        addVoter,
        uploadVoterRegister,
        deleteVoter,
        resetVoterStatus,
        toggleElectionStatus,
        addElectionBySchoolAdmin,
        deleteElection,
        toggleElectionSessionStatus,
        updateElectionTimes,
        updateSchoolBranding,
        addSchoolByDeveloper,
        toggleSchoolAccountStatus,
        deleteSchoolByDeveloper,
        resetAllData,
        toastNotification,
        showToast,
        theme,
        setTheme,
        toggleTheme,
        systemConfig: state.systemConfig || INITIAL_SYSTEM_CONFIG,
        superAdmin: state.superAdmin || INITIAL_SUPER_ADMIN,
        changeDeveloperPassword,
        updateSystemConfig,
        updateSchoolAdminPassword,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => useContext(VotingContext);
