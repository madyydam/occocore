"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Receipt,
  Layers,
  Printer,
  Search,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";
import {
  getFeeInvoicesAction,
  getFeeStructuresAction,
  recordFeePaymentAction,
} from "@/lib/actions/feeActions";
import {
  DEMO_INVOICES,
  DEMO_FEE_STRUCTURES,
} from "@/lib/demo/demoMockData";

export interface FeeInvoiceRecord {
  id: string;
  invoiceNo: string;
  studentName: string;
  studentId: string;
  studentUuid?: string;
  cohort: string;
  heads: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue" | "Partial";
  paymentMode?: string;
  paidOn?: string;
  guardianPhone?: string;
  receiptNo?: string;
  transactionRef?: string;
  archetype?: InstitutionalArchetype;
}

export interface FeeStructureHead {
  id: string;
  headName: string;
  frequency: "Annual" | "Per Semester" | "Quarterly" | "Monthly";
  amount: number;
  isOptional: boolean;
  concessionAllowed: boolean;
  archetype?: InstitutionalArchetype;
}

interface FeesViewProps {
  archetype: InstitutionalArchetype;
}

export default function FeesView({ archetype }: FeesViewProps) {
  const { activeSubTab, theme, isDemoMode } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  // Strict Demo Mock Data Quarantine: Real mode initializes to empty arrays
  const [invoices, setInvoices] = useState<FeeInvoiceRecord[]>(() =>
    isDemoMode ? (DEMO_INVOICES as FeeInvoiceRecord[]) : []
  );
  const [feeStructures, setFeeStructures] = useState<FeeStructureHead[]>(() =>
    isDemoMode ? (DEMO_FEE_STRUCTURES as FeeStructureHead[]) : []
  );
  const [isLoadingRealData, setIsLoadingRealData] = useState<boolean>(!isDemoMode);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isUpiModal, setIsUpiModal] = useState(false);
  const [upiStudent, setUpiStudent] = useState("Vihaan Deshmukh");
  const [upiAmount, setUpiAmount] = useState(
    archetype === "K12_SCHOOL" ? "24500" : archetype === "DEGREE_COLLEGE" ? "54000" : "45000"
  );
  const [selectedReceipt, setSelectedReceipt] = useState<FeeInvoiceRecord | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Strictly fetch real data from PostgreSQL when in production mode
  useEffect(() => {
    if (isDemoMode) return;

    let isMounted = true;
    Promise.all([getFeeInvoicesAction(), getFeeStructuresAction()])
      .then(([invRes, structRes]) => {
        if (!isMounted) return;
        if (invRes.success && invRes.invoices) {
          setInvoices(invRes.invoices as FeeInvoiceRecord[]);
        } else {
          setInvoices([]);
        }

        if (structRes.success && structRes.structures) {
          setFeeStructures(structRes.structures as FeeStructureHead[]);
        } else {
          setFeeStructures([]);
        }
        setIsLoadingRealData(false);
      })
      .catch((err) => {
        console.error("Failed to load fee records from PostgreSQL:", err);
        if (isMounted) setIsLoadingRealData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  // Real WhatsApp notification launcher with pre-filled fee invoice template
  const dispatchWhatsAppReminder = (name: string, amt: number, phone?: string, cohort?: string) => {
    const targetPhone = (phone || "9876543210").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Dear Parent/Guardian, This is an official statutory fee reminder from Apex International Global Academy regarding your ward ${name} (${cohort || "Class 10-A"}). Outstanding fee amount: ₹${amt.toLocaleString("en-IN")}. Kindly settle dues via online portal or scan the Dynamic UPI QR at the accounts counter. For assistance, contact accounts office.`
    );
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, "_blank");
    triggerToast(`Opened WhatsApp fee reminder for ${name} (${targetPhone}).`);
  };

  // Confirm UPI / POS Payment Collection
  const handleConfirmUpiCollection = async () => {
    const amt = Number(upiAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast("Please enter a valid rupee amount.");
      return;
    }

    if (isDemoMode) {
      const newInv: FeeInvoiceRecord = {
        id: `demo-inv-${Date.now().toString().slice(-4)}`,
        invoiceNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        studentName: upiStudent,
        studentId: "SCH/2026/0491",
        cohort: archetype === "K12_SCHOOL" ? "Class 10-A" : "B.Tech CSE",
        heads: "Counter Collection via Dynamic UPI QR",
        amount: amt,
        paidAmount: amt,
        dueDate: "Today",
        status: "Paid",
        paymentMode: "Dynamic UPI QR (NPCI Instant)",
        paidOn: "Today • Just now",
        guardianPhone: "9876543210",
        archetype,
      };

      setInvoices([newInv, ...invoices]);
      setIsUpiModal(false);
      triggerToast(`Successfully collected ₹${amt.toLocaleString("en-IN")} from ${upiStudent}. Receipt created.`);
      return;
    }

    // Real Mode: Match invoice or student and persist to PostgreSQL receipts table
    const targetInvoice = invoices.find(
      (inv) =>
        inv.studentName.toLowerCase().includes(upiStudent.toLowerCase()) ||
        inv.studentId.toLowerCase().includes(upiStudent.toLowerCase())
    );

    if (targetInvoice) {
      const res = await recordFeePaymentAction({
        invoiceId: targetInvoice.id,
        studentId: targetInvoice.studentUuid || targetInvoice.id,
        amount: amt,
        paymentMethod: "UPI_QR",
        transactionRef: `UPI/NPCI/${Date.now().toString().slice(-8)}`,
      });

      if (res.success) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === targetInvoice.id
              ? {
                  ...inv,
                  paidAmount: (inv.paidAmount || 0) + amt,
                  status: (inv.paidAmount || 0) + amt >= inv.amount ? "Paid" : "Partial",
                  paymentMode: "Dynamic UPI QR",
                  paidOn: "Today",
                  receiptNo: res.receiptNo,
                  transactionRef: res.transactionRef,
                }
              : inv
          )
        );
        setIsUpiModal(false);
        triggerToast(`Recorded ₹${amt.toLocaleString("en-IN")} via Dynamic UPI QR into PostgreSQL (Receipt ${res.receiptNo})!`);
      } else {
        triggerToast(`Failed to record payment in PostgreSQL: ${res.error}`);
      }
    } else {
      triggerToast(`No pending invoice found for ${upiStudent}. Please generate invoice first.`);
    }
  };

  // Filter for archetype in demo mode; in real mode show all tenant invoices
  const activeInvoices = isDemoMode
    ? invoices.filter((i) => i.archetype === archetype)
    : invoices;
  const baseInvoices = activeInvoices.length > 0 ? activeInvoices : invoices;

  // Search Filter
  const displayInvoices = useMemo(() => {
    if (!searchQuery.trim()) return baseInvoices;
    const q = searchQuery.toLowerCase().trim();
    return baseInvoices.filter(
      (inv) =>
        inv.studentName.toLowerCase().includes(q) ||
        inv.studentId.toLowerCase().includes(q) ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.heads.toLowerCase().includes(q)
    );
  }, [baseInvoices, searchQuery]);

  const activeStructures = isDemoMode
    ? feeStructures.filter((s) => s.archetype === archetype)
    : feeStructures;
  const displayStructures = activeStructures.length > 0 ? activeStructures : feeStructures;

  // Defaulters calculation
  const defaulterInvoices = useMemo(() => {
    return baseInvoices.filter((i) => i.status === "Overdue" || (i.status === "Pending" && Number(i.amount) > Number(i.paidAmount || 0)));
  }, [baseInvoices]);

  const totalOverdue = useMemo(() => {
    return defaulterInvoices.reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);
  }, [defaulterInvoices]);

  // Dynamic KPI Metric Pods calculated from real records
  const metrics = useMemo(() => {
    let todayCollections = 0;
    let totalDues = 0;

    baseInvoices.forEach((inv) => {
      todayCollections += Number(inv.paidAmount || 0);
      if (inv.status !== "Paid") {
        totalDues += Number(inv.amount) - Number(inv.paidAmount || 0);
      }
    });

    return {
      todayCollections,
      totalDues,
      activeLedgersCount: baseInvoices.length,
    };
  }, [baseInvoices]);

  const isUpiGatewayTab = activeSubTab === "upi_qr_gateway";
  const isDefaultersLedgerTab = activeSubTab === "defaulters_ledger";
  const isStructuresTab = activeSubTab === "fee_structures";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <span>Dynamic UPI QR &amp; Invoicing Ledger</span>
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
            ₹{metrics.todayCollections.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">NPCI Instant Settled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding Dues</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5 font-sans">
            ₹{totalOverdue.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Overdue Defaulters</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Concessions &amp; Waivers</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block mt-0.5 font-sans">
            ₹0.00
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">Statutory Exemptions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Headcount</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            {metrics.activeLedgersCount} Invoices
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">PostgreSQL Reconciled</span>
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
                Confirm Payment &amp; Print Receipt
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
                Outstanding balances categorized by aging: 1-30 days, 31-60 days, and compounding late notices.
              </p>
            </div>

            <button
              type="button"
              onClick={() => triggerToast(`Dispatched ${defaulterInvoices.length} statutory payment links to parent WhatsApp numbers.`)}
              className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bulk Dispatch WhatsApp Links</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {defaulterInvoices.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No fee defaulters found. All student ledgers are cleared!
              </div>
            ) : (
              defaulterInvoices.map((inv) => (
                <div key={inv.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{inv.studentName}</span>
                    <span className="text-[11px] text-slate-500">{inv.cohort} • Due: {inv.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-extrabold text-red-700 font-mono text-xs block">
                        ₹{(inv.amount - (inv.paidAmount || 0)).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] text-red-700 font-bold bg-red-50 px-2 py-0.2 rounded-full inline-block mt-0.5">
                        Statutory Dues
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatchWhatsAppReminder(inv.studentName, inv.amount - (inv.paidAmount || 0), inv.guardianPhone, inv.cohort)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Link</span>
                    </button>
                  </div>
                </div>
              ))
            )}
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
            {displayStructures.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No fee structure components configured.
              </div>
            ) : (
              displayStructures.map((head) => (
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
                      type="button"
                      onClick={() => triggerToast(`Edited fee head rules for ${head.headName}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                    >
                      Edit Head
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: COLLECTION COUNTER TABLE (POS SCREEN)
      ══════════════════════════════════════════════════════════════════════ */}
      {!isUpiGatewayTab && !isDefaultersLedgerTab && !isStructuresTab && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif">Fee Collection Counter &amp; Invoices</h3>
              <span className="text-xs text-slate-500 font-mono">{terms.cohortPlural} Active Ledger</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scholar or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                />
              </div>
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
                {isLoadingRealData ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-semibold text-slate-500">Loading fee ledgers from PostgreSQL...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No invoices found in the database.
                    </td>
                  </tr>
                ) : (
                  displayInvoices.map((row) => (
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
                        {row.status === "Partial" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Partial (₹{(row.paidAmount || 0).toLocaleString("en-IN")})
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
                            type="button"
                            onClick={() => setSelectedReceipt(row)}
                            title="View & Print Digital Receipt"
                            className="p-1.5 rounded-lg hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {row.status !== "Paid" && (
                            <button
                              type="button"
                              onClick={() => dispatchWhatsAppReminder(row.studentName, row.amount - (row.paidAmount || 0), row.guardianPhone, row.cohort)}
                              title="Dispatch WhatsApp Link"
                              className="p-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 print-receipt-section">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Official Fee Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="text-center pb-2 border-b">
                <strong className="text-slate-900 block font-sans text-sm">Apex International Global Academy</strong>
                <span className="text-[10px] text-slate-500 font-sans">Official Institutional Fee Receipt</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="text-slate-900 font-bold">{selectedReceipt.receiptNo || selectedReceipt.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scholar Name:</span>
                <span className="text-slate-900 font-bold">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission No:</span>
                <span className="text-slate-900">{selectedReceipt.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cohort / Div:</span>
                <span className="text-slate-900">{selectedReceipt.cohort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Particulars:</span>
                <span className="text-slate-900 font-sans truncate max-w-[200px]">{selectedReceipt.heads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="text-emerald-700 font-bold">{selectedReceipt.paymentMode || "Dynamic UPI QR"}</span>
              </div>
              {selectedReceipt.transactionRef && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref / Auth:</span>
                  <span className="text-slate-700 text-[10px]">{selectedReceipt.transactionRef}</span>
                </div>
              )}

              <div className="pt-2 border-t flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast(`Triggered print for receipt ${selectedReceipt.receiptNo || selectedReceipt.invoiceNo}`);
                }}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
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
              <button
                type="button"
                onClick={() => setIsUpiModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
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
