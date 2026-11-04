"use client";

import React, { useState } from "react";
import {
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  FileText,
  Receipt,
  Layers,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";

interface FeeInvoiceRecord {
  id: string;
  invoiceNo: string;
  studentName: string;
  studentId: string;
  cohort: string;
  heads: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentMode?: string;
  paidOn?: string;
  archetype: InstitutionalArchetype;
}

interface FeeStructureHead {
  id: string;
  headName: string;
  frequency: "Annual" | "Per Semester" | "Quarterly" | "Monthly";
  amount: number;
  isOptional: boolean;
  concessionAllowed: boolean;
  archetype: InstitutionalArchetype;
}

const SAMPLE_INVOICES: FeeInvoiceRecord[] = [
  // School
  { id: "inv-1", invoiceNo: "INV-2026-891", studentName: "Aarav Sharma", studentId: "APX-0491", cohort: "Class 10-A", heads: "Q3 Tuition + Smart Lab + Bus", amount: 24500, dueDate: "10 Nov 2026", status: "Paid", paymentMode: "Dynamic UPI QR (GPay)", paidOn: "Today • 10:45 AM", archetype: "K12_SCHOOL" },
  { id: "inv-2", invoiceNo: "INV-2026-892", studentName: "Rohan Varma", studentId: "APX-0493", cohort: "Class 10-A", heads: "Q3 Tuition + Transport", amount: 22000, dueDate: "25 Oct 2026", status: "Overdue", archetype: "K12_SCHOOL" },
  { id: "inv-3", invoiceNo: "INV-2026-893", studentName: "Vikramaditya Roy", studentId: "APX-0499", cohort: "Grade 4", heads: "RTE 25% EWS 100% Exemption", amount: 0, dueDate: "31 Mar 2027", status: "Paid", paymentMode: "State Govt Grant #MH-914", paidOn: "1 Oct 2026", archetype: "K12_SCHOOL" },
  // College
  { id: "inv-201", invoiceNo: "COL-2026-401", studentName: "Aaditya Singhania", studentId: "PRN-2026-014", cohort: "B.Tech CSE (Sem IV)", heads: "Sem IV Tuition + Uni Exam Fee", amount: 54000, dueDate: "15 Nov 2026", status: "Paid", paymentMode: "NetBanking HDFC", paidOn: "Yesterday", archetype: "DEGREE_COLLEGE" },
  { id: "inv-202", invoiceNo: "COL-2026-402", studentName: "Meera Krishnan", studentId: "PRN-2026-088", cohort: "B.Sc Biotech (Sem II)", heads: "Semester Tuition + Lab Safety", amount: 48500, dueDate: "30 Oct 2026", status: "Overdue", archetype: "DEGREE_COLLEGE" },
  // University
  { id: "inv-301", invoiceNo: "UNI-2026-101", studentName: "Dr. Siddharth Sen", studentId: "UNI-9812", cohort: "Ph.D. Computing", heads: "Doctoral Research Bench Fee", amount: 32000, dueDate: "30 Nov 2026", status: "Pending", archetype: "UNIVERSITY" },
  // Coaching
  { id: "inv-401", invoiceNo: "CCH-2026-701", studentName: "Harshwardhan Patil", studentId: "ASP-881", cohort: "Rankers JEE 2027", heads: "Installment 2 + All-India Test Series (18% GST)", amount: 45000, dueDate: "5 Nov 2026", status: "Pending", archetype: "COACHING_ACADEMY" },
  { id: "inv-402", invoiceNo: "CCH-2026-702", studentName: "Roshni Deshpande", studentId: "ASP-884", cohort: "Champions NEET", heads: "Installment 1 Tuition", amount: 38000, dueDate: "20 Oct 2026", status: "Overdue", archetype: "COACHING_ACADEMY" },
];

const SAMPLE_FEE_STRUCTURES: FeeStructureHead[] = [
  // School
  { id: "fh-1", headName: "Tuition Fee (Q3)", frequency: "Quarterly", amount: 18000, isOptional: false, concessionAllowed: true, archetype: "K12_SCHOOL" },
  { id: "fh-2", headName: "Smart STEM & Computer Lab", frequency: "Quarterly", amount: 2500, isOptional: false, concessionAllowed: false, archetype: "K12_SCHOOL" },
  { id: "fh-3", headName: "AC School Bus (Route Slab 2)", frequency: "Quarterly", amount: 4000, isOptional: true, concessionAllowed: false, archetype: "K12_SCHOOL" },
  // College
  { id: "fh-201", headName: "Semester Tuition & Instruction", frequency: "Per Semester", amount: 45000, isOptional: false, concessionAllowed: true, archetype: "DEGREE_COLLEGE" },
  { id: "fh-202", headName: "University Examination & Registration", frequency: "Per Semester", amount: 4000, isOptional: false, concessionAllowed: false, archetype: "DEGREE_COLLEGE" },
  { id: "fh-203", headName: "Advanced Computing Lab Deposit", frequency: "Annual", amount: 5000, isOptional: false, concessionAllowed: false, archetype: "DEGREE_COLLEGE" },
  // University
  { id: "fh-301", headName: "Doctoral Bench & Research Infrastructure", frequency: "Annual", amount: 28000, isOptional: false, concessionAllowed: true, archetype: "UNIVERSITY" },
  { id: "fh-302", headName: "Hostel & Mess Amenities", frequency: "Per Semester", amount: 36000, isOptional: true, concessionAllowed: false, archetype: "UNIVERSITY" },
  // Coaching
  { id: "fh-401", headName: "JEE Advanced Classroom Instruction", frequency: "Quarterly", amount: 35000, isOptional: false, concessionAllowed: true, archetype: "COACHING_ACADEMY" },
  { id: "fh-402", headName: "All-India Computer Based Test Series (CBT)", frequency: "Annual", amount: 10000, isOptional: false, concessionAllowed: false, archetype: "COACHING_ACADEMY" },
];

interface FeesViewProps {
  archetype: InstitutionalArchetype;
}

export default function FeesView({ archetype }: FeesViewProps) {
  const { activeSubTab, theme } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [invoices, setInvoices] = useState<FeeInvoiceRecord[]>(SAMPLE_INVOICES);
  const [feeStructures] = useState<FeeStructureHead[]>(SAMPLE_FEE_STRUCTURES);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isUpiModal, setIsUpiModal] = useState(false);
  const [upiStudent, setUpiStudent] = useState("Aarav Sharma");
  const [upiAmount, setUpiAmount] = useState(
    archetype === "K12_SCHOOL" ? "24500" : archetype === "DEGREE_COLLEGE" ? "54000" : "45000"
  );
  const [selectedReceipt, setSelectedReceipt] = useState<FeeInvoiceRecord | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const dispatchWhatsAppReminder = (name: string, amt: number) => {
    triggerToast(`Sent WhatsApp fee payment link for ₹${amt.toLocaleString("en-IN")} to ${name}'s guardian.`);
  };

  const handleConfirmUpiCollection = () => {
    const newInv: FeeInvoiceRecord = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      invoiceNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: upiStudent,
      studentId: "APX-0491",
      cohort: archetype === "K12_SCHOOL" ? "Class 10-A" : "B.Tech CSE",
      heads: "Counter Collection via Dynamic UPI QR",
      amount: Number(upiAmount),
      dueDate: "Today",
      status: "Paid",
      paymentMode: "Dynamic UPI QR (NPCI Instant)",
      paidOn: "Today • Just now",
      archetype,
    };

    setInvoices([newInv, ...invoices]);
    setIsUpiModal(false);
    triggerToast(`Successfully collected ₹${Number(upiAmount).toLocaleString("en-IN")} from ${upiStudent}. Receipt created.`);
  };

  // Filter for archetype
  const activeInvoices = invoices.filter((i) => i.archetype === archetype);
  const displayInvoices = activeInvoices.length > 0 ? activeInvoices : invoices.slice(0, 4);

  const activeStructures = feeStructures.filter((s) => s.archetype === archetype);
  const displayStructures = activeStructures.length > 0 ? activeStructures : feeStructures.slice(0, 3);

  // Defaulters
  const defaulterInvoices = displayInvoices.filter((i) => i.status === "Overdue");
  const totalOverdue = defaulterInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  const isUpiGatewayTab = activeSubTab === "upi_qr_gateway";
  const isDefaultersLedgerTab = activeSubTab === "defaulters_ledger";
  const isStructuresTab = activeSubTab === "fee_structures";

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <span>Dynamic UPI QR & Invoicing Ledger</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {archetypeConfig.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "Quarterly tuition, transport bus slabs, RTE 25% waivers, and WhatsApp dynamic payment links."}
            {archetype === "DEGREE_COLLEGE" && "Semester tuition heads, university exam fees, laboratory caution deposits, and MahaDBT tracking."}
            {archetype === "UNIVERSITY" && "Multi-semester academic fees, doctoral bench grants, hostel mess charges, and research ledger."}
            {archetype === "COACHING_ACADEMY" && "JEE/NEET tuition packages, CBT mock test material fee, and post-dated cheque installments."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUpiModal(true)}
          style={{ backgroundColor: theme.primary }}
          className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 hover:opacity-90"
        >
          <QrCode className="w-4 h-4 text-emerald-300" />
          <span>Generate Dynamic UPI QR</span>
        </button>
      </div>

      {/* KPI Metric Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today&apos;s Collections</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5 font-sans">
            ₹78,500
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">NPCI Instant Settled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding Dues</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5 font-sans">
            ₹{totalOverdue > 0 ? totalOverdue.toLocaleString("en-IN") : "70,500"}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Overdue &gt; 30 Days</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RTE / Concessions</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block mt-0.5 font-sans">
            ₹1,24,000
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">Statutory Waivers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Headcount</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            {displayInvoices.length} Ledgers
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Reconciled in 0ms</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: DYNAMIC UPI QR GATEWAY
      ══════════════════════════════════════════════════════════════════════ */}
      {isUpiGatewayTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>NPCI BharatPe Dynamic UPI QR Terminal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates dynamic intent QR strings for 0-fee zero-chargeback instant counter collections.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              Auto-Settlement Webhook Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-44 h-44 bg-white p-3 rounded-2xl border-2 border-dashed border-emerald-600/70 shadow-xs flex items-center justify-center">
                <div
                  style={{ backgroundColor: theme.sidebarBg }}
                  className="w-full h-full rounded-xl flex flex-col items-center justify-center text-white text-[9px] font-mono p-2"
                >
                  <QrCode className="w-20 h-20 text-emerald-400" />
                  <span className="mt-1">upi://pay?pa=inst@bank</span>
                  <span className="text-emerald-300 font-bold text-xs">₹{upiAmount}</span>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Scan via Google Pay / PhonePe / Paytm / BHIM
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Intent: upi://pay?pa=apex.academy@hdfcbank&amp;am={upiAmount}&amp;tr=REC-2026
              </span>
            </div>

            <div className="lg:col-span-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Scholar Name</label>
                <input
                  type="text"
                  value={upiStudent}
                  onChange={(e) => setUpiStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rupee Amount (INR ₹)</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                <span className="font-bold block">Instant Reconciliation Pipeline</span>
                <p>When scanned by parent, NPCI webhooks immediately transition the ledger to &apos;PAID&apos; and send automated WhatsApp receipt.</p>
              </div>

              <button
                type="button"
                onClick={handleConfirmUpiCollection}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                Simulate Payment &amp; Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: DEFAULTERS LEDGER & AGING REPORT
      ══════════════════════════════════════════════════════════════════════ */}
      {isDefaultersLedgerTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Overdue Defaulters Ledger &amp; Aging Slabs</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outstanding balances categorized by aging: 1-30 days, 31-60 days, and statutory compounding late fines.
              </p>
            </div>

            <button
              onClick={() => triggerToast(`Dispatched ${defaulterInvoices.length} automated payment links to defaulter WhatsApp numbers.`)}
              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bulk Dispatch WhatsApp Links</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {defaulterInvoices.map((inv) => (
              <div key={inv.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{inv.studentName}</span>
                  <span className="text-[11px] text-slate-500">{inv.cohort} • Due: {inv.dueDate}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-red-700 font-mono text-xs block">
                      ₹{inv.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] text-red-700 font-bold bg-red-50 px-2 py-0.2 rounded-full inline-block mt-0.5">
                      +₹500 Late Fine Applied
                    </span>
                  </div>

                  <button
                    onClick={() => dispatchWhatsAppReminder(inv.studentName, inv.amount)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 4: FEE HEADS & CONCESSIONS CONFIGURATION
      ══════════════════════════════════════════════════════════════════════ */}
      {isStructuresTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Statutory Fee Heads, Slabs &amp; Concessions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure institutional fee components, sibling discount rules, staff concessions, and RTE waivers.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
              Concession Rules Enabled
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {displayStructures.map((head) => (
              <div key={head.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{head.headName}</span>
                  <span className="text-[11px] text-slate-500">{head.frequency} • {head.isOptional ? "Optional Amenity" : "Mandatory"}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-mono text-xs block">
                      ₹{head.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full inline-block mt-0.5">
                      {head.concessionAllowed ? "Concession Eligible" : "Fixed Head"}
                    </span>
                  </div>

                  <button
                    onClick={() => triggerToast(`Edited fee head rules for ${head.headName}`)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                  >
                    Edit Head
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: COLLECTION COUNTER TABLE (POS SCREEN)
      ══════════════════════════════════════════════════════════════════════ */}
      {(!isUpiGatewayTab && !isDefaultersLedgerTab && !isStructuresTab) && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif">Fee Collection Counter &amp; Invoices</h3>
              <span className="text-xs text-slate-500 font-mono">{terms.cohortPlural} Active Ledger</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search scholar name or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Invoice / Scholar</th>
                  <th className="py-3.5 px-4">Fee Heads</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayInvoices.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>
                        <span className="block font-bold text-slate-900 text-xs">{row.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{row.invoiceNo} • {row.studentId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {row.heads}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {row.dueDate}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{row.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      {row.status === "Paid" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                          Paid
                        </span>
                      )}
                      {row.status === "Pending" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                          Pending
                        </span>
                      )}
                      {row.status === "Overdue" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          onClick={() => setSelectedReceipt(row)}
                          title="View Digital Receipt"
                          className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {row.status !== "Paid" && (
                          <button
                            onClick={() => dispatchWhatsAppReminder(row.studentName, row.amount)}
                            title="Dispatch WhatsApp Link"
                            className="p-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          RECEIPT MODAL (80mm & A4 PRINTABLE PREVIEW)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Official Fee Receipt</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="text-center pb-2 border-b">
                <strong className="text-slate-900 block font-sans text-sm">Apex Educational Trust</strong>
                <span className="text-[10px] text-slate-500 font-sans">Official GST &amp; Statutory Receipt</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="text-slate-900 font-bold">{selectedReceipt.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scholar Name:</span>
                <span className="text-slate-900 font-bold">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cohort / Div:</span>
                <span className="text-slate-900">{selectedReceipt.cohort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="text-emerald-700 font-bold">{selectedReceipt.paymentMode || "Dynamic UPI QR"}</span>
              </div>

              <div className="pt-2 border-t flex justify-between font-bold text-sm text-slate-900">
                <span>Total Received:</span>
                <span className="text-emerald-700">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed official receipt for ${selectedReceipt.invoiceNo}`);
                  setSelectedReceipt(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Receipt (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DYNAMIC UPI MODAL (TRIGGERED FROM HEADER / BUTTON)
      ══════════════════════════════════════════════════════════════════════ */}
      {isUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-800" />
                <h3 className="font-bold text-slate-900 text-sm">Dynamic UPI QR Counter</h3>
              </div>
              <button onClick={() => setIsUpiModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Legal Name</label>
                <input
                  type="text"
                  value={upiStudent}
                  onChange={(e) => setUpiStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fee Amount (INR ₹)</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-center">
                <div className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-dashed border-emerald-600/60 shadow-xs flex items-center justify-center">
                  <div
                    style={{ backgroundColor: theme.sidebarBg }}
                    className="w-full h-full rounded-lg flex flex-col items-center justify-center text-white text-[9px] font-mono p-1"
                  >
                    <QrCode className="w-16 h-16 text-emerald-400" />
                    <span>upi://pay?pa=inst@bank</span>
                    <span className="text-emerald-300 font-bold">₹{upiAmount}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Scan via GPay / PhonePe / BHIM • Auto-Verifies in 3s
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleConfirmUpiCollection}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                Confirm Payment &amp; Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
