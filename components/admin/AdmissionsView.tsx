"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  X,
  UserPlus,
  ShieldCheck,
  Clock,
  Download,
  Award,
  Layers,
  GraduationCap,
  MessageCircle,
  Printer,
  FileCheck2,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";
import { DEMO_ADMISSIONS } from "@/lib/demo/demoMockData";
import {
  getAdmissionCandidatesAction,
  createAdmissionCandidateAction,
  toggleAdmissionDocumentVerificationAction,
  updateAdmissionStatusAction,
  enrollApplicantAsStudentAction,
  deleteAdmissionCandidateAction,
} from "@/lib/actions/admissionActions";

export interface AdmissionCandidateItem {
  id: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  program: string;
  archetype: string;
  appliedDate: string;
  status: "Pending" | "Confirmed" | "Admitted" | "Waitlisted" | "Rejected";
  meritScore: string;
  numericScore: number;
  quotaType: string;
  documentsVerified: boolean;
  notes: string;
  enrolledStudentId?: string;
  documents: { title: string; verified: boolean; type: string }[];
}

interface AdmissionsViewProps {
  archetype: InstitutionalArchetype;
}

export default function AdmissionsView({ archetype }: AdmissionsViewProps) {
  const { activeSubTab, theme, isDemoMode, institutionName } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [candidates, setCandidates] = useState<AdmissionCandidateItem[]>(() =>
    isDemoMode ? (DEMO_ADMISSIONS as AdmissionCandidateItem[]) : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState<"Newest first" | "Highest Merit">("Newest first");
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [inspectModalCandidate, setInspectModalCandidate] = useState<AdmissionCandidateItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allotmentModalCandidate, setAllotmentModalCandidate] = useState<AdmissionCandidateItem | null>(null);
  const [enrolledSuccessData, setEnrolledSuccessData] = useState<{
    candidateName: string;
    studentId: string;
    admissionNo: string;
    invoiceNo: string;
    phone: string;
  } | null>(null);

  // New Admission Form State
  const [newName, setNewName] = useState("");
  const [newGuardian, setNewGuardian] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newProgram, setNewProgram] = useState(
    archetype === "K12_SCHOOL"
      ? "Class 10 - Section A"
      : archetype === "DEGREE_COLLEGE"
      ? "B.Tech Computer Science & AI"
      : archetype === "UNIVERSITY"
      ? "School of Computing & AI"
      : "Rankers Batch JEE 2027"
  );
  const [newScore, setNewScore] = useState("92.5%");
  const [newQuota, setNewQuota] = useState("General Merit");
  const [newNotes, setNewNotes] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const refreshCandidates = useCallback(() => {
    if (isDemoMode) {
      setCandidates(DEMO_ADMISSIONS as AdmissionCandidateItem[]);
      return;
    }

    setIsLoading(true);
    getAdmissionCandidatesAction(archetype)
      .then((res) => {
        if (res.success) {
          setCandidates(res.candidates as AdmissionCandidateItem[]);
        } else {
          setCandidates([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load admissions from DB:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isDemoMode, archetype]);

  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;
    getAdmissionCandidatesAction(archetype)
      .then((res) => {
        if (isMounted) {
          if (res.success) {
            setCandidates(res.candidates as AdmissionCandidateItem[]);
          } else {
            setCandidates([]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load admissions from DB:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, archetype]);

  // Handle Quick Status Updates
  const handleConfirm = async (id: string, name: string) => {
    if (isDemoMode) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Confirmed" } : c))
      );
      triggerToast(`Approved and confirmed admission for ${name}`);
      return;
    }

    const res = await updateAdmissionStatusAction(id, "CONFIRMED");
    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Confirmed" } : c))
      );
      triggerToast(`Approved and confirmed admission for ${name}`);
    } else {
      alert(res.error || "Failed to update admission status");
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (isDemoMode) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c))
      );
      triggerToast(`Application flagged and rejected for ${name}`);
      return;
    }

    const res = await updateAdmissionStatusAction(id, "REJECTED");
    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c))
      );
      triggerToast(`Application flagged and rejected for ${name}`);
    } else {
      alert(res.error || "Failed to update admission status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (isDemoMode) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Archived application dossier for ${name}`);
      return;
    }

    const res = await deleteAdmissionCandidateAction(id);
    if (res.success) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Archived application dossier for ${name}`);
    } else {
      alert(res.error || "Failed to archive candidate");
    }
  };

  // Toggle Document Verification
  const toggleDocumentVerification = async (candidateId: string, docIndex: number) => {
    if (isDemoMode) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const updatedDocs = [...c.documents];
          updatedDocs[docIndex] = {
            ...updatedDocs[docIndex],
            verified: !updatedDocs[docIndex].verified,
          };
          const allVerified = updatedDocs.every((d) => d.verified);
          return { ...c, documents: updatedDocs, documentsVerified: allVerified };
        })
      );
      triggerToast("Updated statutory document verification status.");
      return;
    }

    const res = await toggleAdmissionDocumentVerificationAction(candidateId, docIndex);
    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const updatedDocs = [...c.documents];
          updatedDocs[docIndex] = {
            ...updatedDocs[docIndex],
            verified: !updatedDocs[docIndex].verified,
          };
          return {
            ...c,
            documents: updatedDocs,
            documentsVerified: Boolean(res.documentsVerified),
          };
        })
      );
      triggerToast("Updated statutory document verification status in PostgreSQL.");
    } else {
      alert(res.error || "Failed to update document verification");
    }
  };

  const handleExportCsv = () => {
    if (candidates.length === 0) {
      alert("No candidate records available to export.");
      return;
    }
    const headers = ["ID", "Name", "Guardian Name", "Phone", "Email", "Program", "Merit Score", "Numeric Score", "Quota", "Status", "Applied Date"];
    const rows = candidates.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.guardianName.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.program.replace(/"/g, '""')}"`,
      `"${c.meritScore}"`,
      c.numericScore,
      `"${c.quotaType}"`,
      c.status,
      `"${c.appliedDate}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admissions_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported candidate records to CSV");
  };

  // 1-Click Complete Admission & Enroll as Student
  const handleEnrollStudent = async (candidate: AdmissionCandidateItem) => {
    if (isDemoMode) {
      const demoAdmNo = `SCH/2026/0${490 + (candidates.length % 50)}`;
      const demoInvNo = `INV/2026/0${10 + (candidates.length % 80)}`;
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, status: "Admitted" } : c))
      );
      setInspectModalCandidate(null);
      setEnrolledSuccessData({
        candidateName: candidate.name,
        studentId: candidate.id,
        admissionNo: demoAdmNo,
        invoiceNo: demoInvNo,
        phone: candidate.phone,
      });
      triggerToast(`Enrolled ${candidate.name} as active student!`);
      return;
    }

    const res = await enrollApplicantAsStudentAction(candidate.id);
    if (res.success && res.studentId && res.admissionNo) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id
            ? { ...c, status: "Admitted", enrolledStudentId: res.studentId }
            : c
        )
      );
      setInspectModalCandidate(null);
      setEnrolledSuccessData({
        candidateName: candidate.name,
        studentId: res.studentId,
        admissionNo: res.admissionNo,
        invoiceNo: res.invoiceNo || "INV/2026/001",
        phone: candidate.phone,
      });
      triggerToast(`Officially admitted and enrolled ${candidate.name}!`);
    } else {
      alert(res.error || "Failed to enroll applicant");
    }
  };

  // Create Admission Candidate Form
  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert("Please provide the candidate name and primary contact phone.");
      return;
    }

    if (isDemoMode) {
      const newCandidate: AdmissionCandidateItem = {
        id: `adm-${candidates.length + 101}`,
        name: newName,
        guardianName: newGuardian || "Primary Guardian",
        phone: newPhone,
        email: newEmail || "applicant@student.org",
        program: newProgram,
        archetype,
        appliedDate: "Today • Just now",
        status: "Pending",
        meritScore: newScore,
        numericScore: parseFloat(newScore) || 90.0,
        quotaType: newQuota,
        documentsVerified: false,
        notes: newNotes || "Newly registered applicant dossier.",
        documents: [
          { title: "Academic Scorecard / Certificate", verified: false, type: "Academic" },
          { title: "Statutory Identification Document", verified: false, type: "Identity" },
        ],
      };

      setCandidates([newCandidate, ...candidates]);
      setIsAddModalOpen(false);
      resetForm();
      triggerToast(`Registered new applicant: ${newCandidate.name}`);
      return;
    }

    const res = await createAdmissionCandidateAction({
      name: newName,
      guardianName: newGuardian || "Primary Guardian",
      phone: newPhone,
      email: newEmail,
      program: newProgram,
      meritScore: newScore,
      quotaType: newQuota,
      notes: newNotes,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      resetForm();
      triggerToast(`Registered new applicant: ${newName}`);
      refreshCandidates();
    } else {
      alert(res.error || "Failed to create candidate");
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewGuardian("");
    setNewPhone("");
    setNewEmail("");
    setNewNotes("");
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.program.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedCandidates = sortOrder === "Highest Merit"
    ? [...filteredCandidates].sort((a, b) => b.numericScore - a.numericScore)
    : filteredCandidates;

  // Specific Sub-Tab Filterings
  const isEntranceMeritTab = activeSubTab === "entrance_merit";
  const isDocumentVaultTab = activeSubTab === "document_vault";
  const isRteQuotasTab = activeSubTab === "rte_quotas";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <span>{terms.cohortPlural} Admissions & Enrollment Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {archetypeConfig.name}
            </span>
            {!isDemoMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 text-blue-800 border border-blue-200">
                PostgreSQL Live
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "CBSE/ICSE Admissions, RTE 25% EWS seat lottery, and Birth Certificate DPDPA consent vault."}
            {archetype === "DEGREE_COLLEGE" && "State CAP/CET Merit cutoffs, Higher Secondary scorecards, and Branch allotment."}
            {archetype === "UNIVERSITY" && "Central Entrance Test (CUET), Research Fellowships, and NEP 2020 DigiLocker ABC registration."}
            {archetype === "COACHING_ACADEMY" && "Diagnostic Admission Test (DAT), All-India Rank scholarships, and batch timing allocation."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="py-2.5 px-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{ backgroundColor: theme.primary }}
            className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            <span>New {terms.cohortUnit} Candidate</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Candidates
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            {candidates.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Active Applications</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Admitted & Enrolled
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5 font-sans">
            {candidates.filter((c) => c.status === "Admitted").length}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Students Onboarded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Confirmed / Pending
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5 font-sans">
            {candidates.filter((c) => c.status === "Pending" || c.status === "Confirmed").length}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Awaiting Final Seat Allotment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Statutory Focus
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-blue-800 block mt-1 truncate">
            {archetypeConfig.statutoryFocus[0]}
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">100% Policy Sealed</span>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
          Connecting to institution PostgreSQL database and synchronizing admission records...
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 1: ENTRANCE MERIT LIST VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {isEntranceMeritTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Entrance Merit & Cutoff Ranklist</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated ranking sorted by entrance exam scores, reservation cutoff thresholds, and allotment eligibility.
              </p>
            </div>
            <button
              onClick={() => triggerToast("Generated consolidated merit broadsheet PDF.")}
              className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export Merit List</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {[...sortedCandidates]
              .sort((a, b) => b.numericScore - a.numericScore)
              .map((cand, idx) => (
                <div key={cand.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{cand.name}</span>
                      <span className="text-[11px] text-slate-500">{cand.program} • {terms.guardianLabel}: {cand.guardianName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-slate-900 block font-mono">{cand.meritScore}</span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {cand.quotaType}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAllotmentModalCandidate(cand)}
                      style={{ backgroundColor: theme.primary }}
                      className="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold transition-all cursor-pointer hover:opacity-90"
                    >
                      Allotment Letter
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: DOCUMENT VERIFICATION VAULT
      ══════════════════════════════════════════════════════════════════════ */}
      {isDocumentVaultTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DPDPA 2023 Statutory Document Verification Vault</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify government certificates, caste validity, transfer certificates, and parental consent forms.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AES-256 Cloud Vault Sealed</span>
            </span>
          </div>

          <div className="space-y-4">
            {sortedCandidates.map((cand) => (
              <div key={cand.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                      {cand.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{cand.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {cand.id} • {cand.program}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    cand.documentsVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {cand.documentsVerified ? "100% Verified" : "Verification Incomplete"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {cand.documents.map((doc, docIdx) => (
                    <div
                      key={docIdx}
                      onClick={() => toggleDocumentVerification(cand.id, docIdx)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        doc.verified
                          ? "bg-white border-emerald-300 text-emerald-950"
                          : "bg-white border-amber-300 text-amber-950 hover:border-emerald-400"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-[11px] block truncate">{doc.title}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">{doc.type}</span>
                      </div>
                      <span className="shrink-0">
                        {doc.verified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: RTE 25% & QUOTA ROSTER VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {isRteQuotasTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Statutory Quota Allotments & RTE 25% EWS Roster</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliance tracking under Section 12(1)(c) Right to Education Act, State CAP Quotas, and National Fellowships.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Statutory Waiver Audit Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">RTE 25% / State Quota Seats</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">25 Seats</span>
              <span className="text-[10px] text-emerald-700 font-medium">100% Tuition Fee Exemption</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Institutional Merit Waivers</span>
              <span className="text-2xl font-black text-blue-700 block mt-1">12 Scholars</span>
              <span className="text-[10px] text-blue-600 font-medium">50% to 75% Scholarship</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Govt Grant Reimbursement</span>
              <span className="text-2xl font-black text-emerald-700 block mt-1">₹4,80,000</span>
              <span className="text-[10px] text-slate-500 font-mono">Claim ID: #MH-EDU-2026</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 pt-2">
            {sortedCandidates.map((cand) => (
              <div key={cand.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{cand.name}</span>
                  <span className="text-[11px] text-slate-500">{cand.program} • {cand.quotaType}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">
                    {cand.quotaType.includes("RTE") ? "100% Statutory Waiver" : "General Enrollment"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Status: {cand.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: ALL INQUIRIES & APPLICATIONS TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      {!isEntranceMeritTab && !isDocumentVaultTab && !isRteQuotasTab && (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search candidate by name, phone, or ${terms.cohortUnit}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="All statuses">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Admitted">Admitted (Enrolled)</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "Newest first" | "Highest Merit")}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="Newest first">Newest first</option>
                <option value="Highest Merit">Highest Merit</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-6">Candidate / Guardian</th>
                    <th className="py-3.5 px-6">{terms.cohortUnit} Allocation</th>
                    <th className="py-3.5 px-6">Merit & Quota</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {isLoading
                          ? "Loading admissions records from database..."
                          : "No admission applications match your current search or status filter."}
                      </td>
                    </tr>
                  ) : (
                    sortedCandidates.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 block text-xs">
                            {row.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {terms.guardianLabel}: {row.guardianName} • {row.phone}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-800">
                          <span className="block">{row.program}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{row.appliedDate}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-900 block">{row.meritScore}</span>
                          <span className="text-[10px] text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {row.quotaType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {row.status === "Pending" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                              Pending
                            </span>
                          )}
                          {row.status === "Confirmed" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1]">
                              Confirmed
                            </span>
                          )}
                          {row.status === "Admitted" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Admitted</span>
                            </span>
                          )}
                          {row.status === "Waitlisted" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              Waitlisted
                            </span>
                          )}
                          {row.status === "Rejected" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400">
                            {/* Inspect Eye */}
                            <button
                              onClick={() => setInspectModalCandidate(row)}
                              title="Inspect Admission Dossier"
                              className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Allotment Letter */}
                            <button
                              onClick={() => setAllotmentModalCandidate(row)}
                              title="Generate Allotment Order"
                              className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* 1-Click Enroll Student */}
                            {row.status !== "Admitted" && (
                              <button
                                onClick={() => handleEnrollStudent(row)}
                                title="Complete Admission & Enroll as Student"
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Enroll</span>
                              </button>
                            )}

                            {/* Approve Check */}
                            {row.status === "Pending" && (
                              <button
                                onClick={() => handleConfirm(row.id, row.name)}
                                title="Confirm Admission"
                                className="p-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject Cross */}
                            {row.status !== "Rejected" && row.status !== "Admitted" && (
                              <button
                                onClick={() => handleReject(row.id, row.name)}
                                title="Reject Application"
                                className="p-1.5 rounded-lg hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Trash Archive */}
                            <button
                              onClick={() => handleDelete(row.id, row.name)}
                              title="Archive Record"
                              className="p-1.5 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: INSPECT ADMISSION CANDIDATE DOSSIER
      ══════════════════════════════════════════════════════════════════════ */}
      {inspectModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {inspectModalCandidate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {inspectModalCandidate.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {inspectModalCandidate.id} • {inspectModalCandidate.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectModalCandidate(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{terms.cohortUnit} Allocation</span>
                  <span className="font-bold text-slate-900 text-xs block mt-0.5">{inspectModalCandidate.program}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Merit Score & Rank</span>
                  <span className="font-bold text-slate-900 text-xs block mt-0.5">{inspectModalCandidate.meritScore}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Quota & Governance</span>
                <span className="text-slate-800 block font-semibold">{inspectModalCandidate.quotaType}</span>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                  {inspectModalCandidate.notes || "Standard admission application form verified by admissions registrar."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-emerald-950">
                <span className="flex items-center gap-1.5 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Document Vault Status</span>
                </span>
                <div className="space-y-1 pt-1">
                  {inspectModalCandidate.documents.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span>{d.title}</span>
                      <span className={`font-bold text-[10px] ${d.verified ? "text-emerald-700" : "text-amber-700"}`}>
                        {d.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              {inspectModalCandidate.status !== "Admitted" ? (
                <button
                  type="button"
                  onClick={() => handleEnrollStudent(inspectModalCandidate)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Enroll as Active Student</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enrolled Student</span>
                </span>
              )}

              <div className="flex items-center gap-2">
                {inspectModalCandidate.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleConfirm(inspectModalCandidate.id, inspectModalCandidate.name);
                      setInspectModalCandidate(null);
                    }}
                    style={{ backgroundColor: theme.primary }}
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs transition-all cursor-pointer hover:opacity-90"
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectModalCandidate(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: ADD NEW ADMISSION APPLICATION
      ══════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Register New {terms.cohortUnit} Candidate
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {archetypeConfig.name} • 2026-27 Intake
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Student Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Diya Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {terms.guardianLabel} Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contact Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="diya@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target {terms.cohortUnit}
                  </label>
                  <input
                    type="text"
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Entrance / Merit Score
                  </label>
                  <input
                    type="text"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="e.g. 94.5% or 98.2 Percentile"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Statutory Quota / Category
                </label>
                <select
                  value={newQuota}
                  onChange={(e) => setNewQuota(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="General Merit">General Open Merit</option>
                  <option value="RTE 25% EWS Free Seat">RTE 25% EWS Seat (School)</option>
                  <option value="State CET / CAP Merit">State CET / CAP Allotment (College)</option>
                  <option value="Institutional Scholarship">Merit Scholarship (Coaching/University)</option>
                  <option value="Staff Ward Quota">Staff & Faculty Ward</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Application Notes / Verification Remarks
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. TC submitted, birth certificate verified..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs cursor-pointer hover:opacity-90"
                >
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: PROVISIONAL ALLOTMENT LETTER GENERATOR (PRINTABLE A4)
      ══════════════════════════════════════════════════════════════════════ */}
      {allotmentModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official Provisional Allotment Order</h3>
              </div>
              <button onClick={() => setAllotmentModalCandidate(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="print-allotment-section border border-slate-200 rounded-2xl p-6 bg-white space-y-4 text-xs font-serif text-slate-900">
              <div className="text-center border-b border-slate-900 pb-3">
                <h2 className="text-base font-bold uppercase tracking-wider">{institutionName}</h2>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5">Office of the Registrar & Admissions Board</p>
                <span className="text-xs font-extrabold uppercase tracking-wide bg-slate-100 px-3 py-1 rounded inline-block mt-2 font-sans border border-slate-300">
                  Provisional Admission Allotment Order • 2026-27
                </span>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-700">
                <span>Ref: ADM-ALLOT-{allotmentModalCandidate.id.toUpperCase()}</span>
                <span>Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate Name</span>
                    <strong className="text-slate-900">{allotmentModalCandidate.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{terms.guardianLabel} Name</span>
                    <strong className="text-slate-900">{allotmentModalCandidate.guardianName}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Allotted Program / Section</span>
                    <strong className="text-slate-900">{allotmentModalCandidate.program}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Merit Score & Cutoff</span>
                    <strong className="text-emerald-700">{allotmentModalCandidate.meritScore}</strong>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-600">Category / Quota:</span>
                  <strong className="text-blue-800">{allotmentModalCandidate.quotaType}</strong>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-700">
                This is to certify that the candidate has been provisionally allotted a seat under the applicable institutional regulations.
                Final admission is subject to statutory document verification and clearance of prescribed academic fees within 15 working days.
              </p>

              <div className="pt-8 flex justify-between items-end text-center font-sans text-[10px]">
                <div>
                  <div className="w-28 border-t border-slate-400 pt-1">Candidate / Guardian</div>
                </div>
                <div>
                  <div className="w-28 border-t border-slate-400 pt-1">Admissions In-Charge</div>
                </div>
                <div>
                  <div className="w-28 border-t border-slate-900 pt-1 font-bold">Principal / Dean Seal</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                style={{ backgroundColor: theme.primary }}
                className="py-2.5 px-4 rounded-xl text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
              >
                <Printer className="w-4 h-4" />
                <span>Print Allotment Order (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setAllotmentModalCandidate(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: ENROLLMENT SUCCESS & WELCOME KIT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {enrolledSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Student Enrolled Successfully!
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Synchronized with PostgreSQL `students` & `invoices`
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{enrolledSuccessData.candidateName}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Official Admission No:</span>
                <strong className="text-emerald-700 font-mono text-sm">{enrolledSuccessData.admissionNo}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Initial Tuition Invoice:</span>
                <strong className="text-blue-700 font-mono">{enrolledSuccessData.invoiceNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent WhatsApp Contact:</span>
                <span className="text-slate-900 font-mono">{enrolledSuccessData.phone}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* WhatsApp Welcome Notice Button */}
              <a
                href={`https://wa.me/${enrolledSuccessData.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Dear Parent, Congratulations! Admission confirmed for ${enrolledSuccessData.candidateName} at ${institutionName}. Student Admission No: ${enrolledSuccessData.admissionNo}. Invoice #${enrolledSuccessData.invoiceNo} has been generated. Please check your institutional portal.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Welcome Kit & Allotment Notice</span>
              </a>

              <button
                type="button"
                onClick={() => setEnrolledSuccessData(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close & Return to Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
