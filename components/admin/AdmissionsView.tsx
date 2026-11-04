"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";

export interface AdmissionCandidate {
  id: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  program: string;
  archetype: InstitutionalArchetype;
  appliedDate: string;
  status: "Pending" | "Confirmed" | "Waitlisted" | "Rejected";
  meritScore: string;
  numericScore: number;
  quotaType: string;
  documentsVerified: boolean;
  notes: string;
  documents: { title: string; verified: boolean; type: string }[];
}

const SAMPLE_ADMISSIONS: AdmissionCandidate[] = [
  // School
  {
    id: "adm-101",
    name: "Raghvendra Mukhopadhyay",
    guardianName: "Sunil Mukhopadhyay",
    phone: "9845497084",
    email: "ragh.m@family.org",
    program: "Class 11 - Science (PCMB)",
    archetype: "K12_SCHOOL",
    appliedDate: "3 Nov 2026 • 12:00",
    status: "Pending",
    meritScore: "94.2% (Class 10 CBSE)",
    numericScore: 94.2,
    quotaType: "General Merit",
    documentsVerified: true,
    notes: "Applied for Senior Secondary Science stream. Board marksheet and transfer certificate submitted.",
    documents: [
      { title: "Class 10 CBSE Board Marksheet", verified: true, type: "Academic" },
      { title: "Transfer Certificate (TC)", verified: true, type: "Statutory" },
      { title: "Birth Certificate & DPDPA Consent", verified: true, type: "Legal" },
    ],
  },
  {
    id: "adm-102",
    name: "Vikramaditya Roy",
    guardianName: "Anil Roy",
    phone: "9988776655",
    email: "anil.roy@workmail.in",
    program: "Grade 4 - Primary Wing",
    archetype: "K12_SCHOOL",
    appliedDate: "Today • 09:15 AM",
    status: "Confirmed",
    meritScore: "RTE 25% EWS Allotment",
    numericScore: 99.0,
    quotaType: "RTE 25% Free Seat",
    documentsVerified: true,
    notes: "State Education Dept RTE portal allotment #RTE-2026-9014. Zero tuition fee assigned.",
    documents: [
      { title: "State RTE Allotment Letter", verified: true, type: "Govt Quota" },
      { title: "Tehsildar EWS Income Certificate", verified: true, type: "Legal" },
      { title: "Aadhaar Card of Child & Guardian", verified: true, type: "ID Proof" },
    ],
  },
  {
    id: "adm-103",
    name: "Ananya Deshmukh",
    guardianName: "Sanjay Deshmukh",
    phone: "9123456780",
    email: "sanjay.deshmukh@mail.com",
    program: "Class 9 - Section A",
    archetype: "K12_SCHOOL",
    appliedDate: "Yesterday • 02:00 PM",
    status: "Confirmed",
    meritScore: "91.5% in Class 8",
    numericScore: 91.5,
    quotaType: "General Merit",
    documentsVerified: true,
    notes: "Direct transfer from ICSE Board school. Equivalence verified.",
    documents: [
      { title: "Class 8 Progress Report", verified: true, type: "Academic" },
      { title: "Medical Fitness Certificate", verified: true, type: "Health" },
    ],
  },
  // College
  {
    id: "adm-201",
    name: "Aaditya Singhania",
    guardianName: "Rajesh Singhania",
    phone: "9820123456",
    email: "aaditya.singh@campus.in",
    program: "B.Tech Computer Science & AI (Sem I)",
    archetype: "DEGREE_COLLEGE",
    appliedDate: "2 Nov 2026 • 03:30 PM",
    status: "Confirmed",
    meritScore: "98.4 Percentile (MHT-CET / JEE)",
    numericScore: 98.4,
    quotaType: "State CAP Merit Quota",
    documentsVerified: true,
    notes: "Round 1 CAP allotment. First semester tuition fee paid via Dynamic UPI QR.",
    documents: [
      { title: "MHT-CET / JEE Scorecard", verified: true, type: "Entrance" },
      { title: "Higher Secondary (12th) Marksheet", verified: true, type: "Academic" },
      { title: "State Domicile & Nationality Certificate", verified: true, type: "Statutory" },
    ],
  },
  {
    id: "adm-202",
    name: "Meera Krishnan",
    guardianName: "S. Krishnan",
    phone: "9444123890",
    email: "meera.k@gmail.com",
    program: "B.Sc Biotechnology & Genetics (Sem I)",
    archetype: "DEGREE_COLLEGE",
    appliedDate: "Yesterday • 11:20 AM",
    status: "Pending",
    meritScore: "91.8% in Higher Secondary",
    numericScore: 91.8,
    quotaType: "Institutional Merit",
    documentsVerified: false,
    notes: "Lab safety undertaking pending verification. Migration certificate submitted.",
    documents: [
      { title: "12th Science Marksheet (PCB)", verified: true, type: "Academic" },
      { title: "Lab Safety & Biosafety Declaration", verified: false, type: "Compliance" },
      { title: "Migration Certificate", verified: true, type: "Statutory" },
    ],
  },
  // University
  {
    id: "adm-301",
    name: "Dr. Siddharth Sen",
    guardianName: "Self-Sponsored",
    phone: "9811443322",
    email: "s.sen@research.ac.in",
    program: "Ph.D. in Distributed Systems & AI",
    archetype: "UNIVERSITY",
    appliedDate: "1 Nov 2026 • 05:00 PM",
    status: "Pending",
    meritScore: "UGC-NET JRF (AIR 42)",
    numericScore: 99.2,
    quotaType: "National Research Fellowship",
    documentsVerified: true,
    notes: "Research synopsis approved by Departmental Doctoral Committee. Guide assigned.",
    documents: [
      { title: "UGC-NET JRF Award Letter", verified: true, type: "Fellowship" },
      { title: "Postgraduate Degree (M.Tech) Transcript", verified: true, type: "Academic" },
      { title: "APAAR / DigiLocker National ID", verified: true, type: "Govt ID" },
    ],
  },
  {
    id: "adm-302",
    name: "Tanya Senapati",
    guardianName: "Prof. K. Senapati",
    phone: "9711223344",
    email: "tanya.s@uni.ac.in",
    program: "School of Legal Studies (LL.M)",
    archetype: "UNIVERSITY",
    appliedDate: "Today • 11:00 AM",
    status: "Confirmed",
    meritScore: "CUET-PG Score 284/300",
    numericScore: 94.6,
    quotaType: "Central CUET Quota",
    documentsVerified: true,
    notes: "NEP 2020 Digilocker Academic Bank of Credits (ABC) ID linked: 8941-2094-1192.",
    documents: [
      { title: "CUET-PG Official Rank Card", verified: true, type: "Entrance" },
      { title: "B.A. LL.B Degree Certificate", verified: true, type: "Academic" },
      { title: "DigiLocker ABC Verification Token", verified: true, type: "NEP 2020" },
    ],
  },
  // Coaching
  {
    id: "adm-401",
    name: "Harshwardhan Patil",
    guardianName: "Mahesh Patil",
    phone: "9766554433",
    email: "harsh.patil@testprep.in",
    program: "Rankers Super-30 (JEE Advanced 2027)",
    archetype: "COACHING_ACADEMY",
    appliedDate: "Today • 10:00 AM",
    status: "Confirmed",
    meritScore: "Score 96/100 (DAT AIR 4)",
    numericScore: 96.0,
    quotaType: "75% Scholarship Waiver",
    documentsVerified: true,
    notes: "Rank 4 in Diagnostic Admission Test. Assigned to Morning Batch A1.",
    documents: [
      { title: "DAT Test Hall Ticket & Score Record", verified: true, type: "Diagnostic" },
      { title: "Class 10 School Marksheet", verified: true, type: "Academic" },
      { title: "Guardian Post-Dated Cheque / Mandate", verified: true, type: "Fee Agreement" },
    ],
  },
  {
    id: "adm-402",
    name: "Roshni Deshpande",
    guardianName: "Dr. S. Deshpande",
    phone: "9977881122",
    email: "roshni.d@testprep.in",
    program: "Champions Intensive (NEET 2026)",
    archetype: "COACHING_ACADEMY",
    appliedDate: "Yesterday • 05:00 PM",
    status: "Pending",
    meritScore: "Score 88/100 (DAT Tier 2)",
    numericScore: 88.0,
    quotaType: "50% Scholarship Waiver",
    documentsVerified: false,
    notes: "Awaiting parent consultation and batch timing confirmation.",
    documents: [
      { title: "Diagnostic Admission Test OMR Sheet", verified: true, type: "Diagnostic" },
      { title: "Parent Undertaking for Attendance", verified: false, type: "Policy" },
    ],
  },
];

interface AdmissionsViewProps {
  archetype: InstitutionalArchetype;
}

export default function AdmissionsView({ archetype }: AdmissionsViewProps) {
  const { activeSubTab, theme } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [candidates, setCandidates] = useState<AdmissionCandidate[]>(SAMPLE_ADMISSIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState<"Newest first" | "Highest Merit">("Newest first");
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [inspectModalCandidate, setInspectModalCandidate] = useState<AdmissionCandidate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allotmentModalCandidate, setAllotmentModalCandidate] = useState<AdmissionCandidate | null>(null);

  // New Admission Form State
  const [newName, setNewName] = useState("");
  const [newGuardian, setNewGuardian] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newProgram, setNewProgram] = useState(
    archetype === "K12_SCHOOL"
      ? "Class 10 - Section A"
      : archetype === "DEGREE_COLLEGE"
      ? "B.Tech Computer Science"
      : archetype === "UNIVERSITY"
      ? "School of Computing & AI"
      : "Rankers Batch JEE 2027"
  );
  const [newScore, setNewScore] = useState("92.5%");
  const [newQuota, setNewQuota] = useState("General Merit");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleConfirm = (id: string, name: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Confirmed" } : c))
    );
    triggerToast(`Approved and confirmed admission for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c))
    );
    triggerToast(`Application flagged and rejected for ${name}`);
  };

  const handleDelete = (id: string, name: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    triggerToast(`Archived application dossier for ${name}`);
  };

  const toggleDocumentVerification = (candidateId: string, docIndex: number) => {
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
  };

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert("Please provide the candidate name and primary contact phone.");
      return;
    }

    const newCandidate: AdmissionCandidate = {
      id: `adm-${Date.now().toString().slice(-4)}`,
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
      notes: "Newly submitted applicant through Owner Admin Portal.",
      documents: [
        { title: "Academic Scorecard / Certificate", verified: false, type: "Academic" },
        { title: "Statutory Identification Document", verified: false, type: "Identity" },
      ],
    };

    setCandidates([newCandidate, ...candidates]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewGuardian("");
    setNewPhone("");
    setNewEmail("");
    triggerToast(`Registered new applicant: ${newCandidate.name}`);
  };

  // Filter candidates: archetype match priority
  let filteredCandidates = candidates.filter((item) => {
    const matchesArchetype = item.archetype === archetype;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.program.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All statuses" || item.status === statusFilter;

    return matchesArchetype && matchesSearch && matchesStatus;
  });

  // Fallback if archetype has few items
  if (filteredCandidates.length === 0 && searchQuery === "" && statusFilter === "All statuses") {
    filteredCandidates = candidates.slice(0, 4);
  }

  // Sorting
  if (sortOrder === "Highest Merit") {
    filteredCandidates.sort((a, b) => b.numericScore - a.numericScore);
  }

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
            <span>{terms.cohortPlural} Admissions & Enrollment Registry</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {archetypeConfig.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "CBSE/ICSE Admissions, RTE 25% EWS seat lottery, and Birth Certificate DPDPA consent vault."}
            {archetype === "DEGREE_COLLEGE" && "State CAP/CET Merit cutoffs, Higher Secondary scorecards, and Branch allotment."}
            {archetype === "UNIVERSITY" && "Central Entrance Test (CUET), Research Fellowships, and NEP 2020 DigiLocker ABC registration."}
            {archetype === "COACHING_ACADEMY" && "Diagnostic Admission Test (DAT), All-India Rank scholarships, and batch timing allocation."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          style={{ backgroundColor: theme.primary }}
          className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>New {terms.cohortUnit} Admission</span>
        </button>
      </div>

      {/* KPI Metric Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total {terms.cohortPlural} Inquiries
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            {filteredCandidates.length + 14}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Active Academic Intake</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Confirmed Enrolled
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5 font-sans">
            {filteredCandidates.filter((c) => c.status === "Confirmed").length || 3}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Seat Confirmed & Verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Scrutiny
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5 font-sans">
            {filteredCandidates.filter((c) => c.status === "Pending").length || 2}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Document Audit Required</span>
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
            {[...filteredCandidates]
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
                Verify government certificates, caste validity, transfer certificates, and Section 9 parental consent forms.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AES-256 Cloud Vault Sealed</span>
            </span>
          </div>

          <div className="space-y-4">
            {filteredCandidates.map((cand) => (
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
            {filteredCandidates.map((cand) => (
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
          DEFAULT SUB-TAB: ALL INQUIRIES & APPLICATIONS TABLE (IMAGE 2 STYLE)
      ══════════════════════════════════════════════════════════════════════ */}
      {(!isEntranceMeritTab && !isDocumentVaultTab && !isRteQuotasTab) && (
        <>
          {/* Filter and Search Bar (Exact Style from Image 2) */}
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

          {/* White Card Table (Exact Style from Image 2) */}
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
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No admission applications match your current search or status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((row) => (
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
                          <span className="text-[10px] text-blue-700 font-medium bg-blue-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
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
                          {row.status === "Rejected" && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 text-slate-400">
                            {/* Inspect Eye */}
                            <button
                              onClick={() => setInspectModalCandidate(row)}
                              title="Inspect Admission Dossier"
                              className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Approve Check */}
                            <button
                              onClick={() => handleConfirm(row.id, row.name)}
                              title="Confirm Admission"
                              className="p-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            {/* Reject Cross */}
                            <button
                              onClick={() => handleReject(row.id, row.name)}
                              title="Reject Application"
                              className="p-1.5 rounded-lg hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>

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
                  {inspectModalCandidate.notes}
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

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleConfirm(inspectModalCandidate.id, inspectModalCandidate.name);
                  setInspectModalCandidate(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs transition-all cursor-pointer hover:opacity-90"
              >
                Approve & Confirm
              </button>
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
                    placeholder="98XXXXXXXX"
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
          MODAL 3: PROVISIONAL ALLOTMENT LETTER GENERATOR
      ══════════════════════════════════════════════════════════════════════ */}
      {allotmentModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Provisional Allotment Letter</h3>
              </div>
              <button onClick={() => setAllotmentModalCandidate(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Applicant:</span>
                <strong className="text-slate-900">{allotmentModalCandidate.name}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Allotted Program:</span>
                <strong className="text-slate-900">{allotmentModalCandidate.program}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Merit Score:</span>
                <strong className="text-emerald-700">{allotmentModalCandidate.meritScore}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quota Category:</span>
                <strong className="text-blue-700">{allotmentModalCandidate.quotaType}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed Provisional Allotment Order for ${allotmentModalCandidate.name}`);
                  setAllotmentModalCandidate(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                <span>Issue & Print Allotment PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
