"use client";

import React, { useState } from "react";
import {
  Search,
  QrCode,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useDemo } from "@/lib/demo/demoContext";
import {
  DEMO_ROSTER,
  DEMO_ADMISSIONS,
  DEMO_INVOICES,
} from "@/lib/demo/demoMockData";

// ════════════════════════════════════════════════════════════════════════════
// 1. DEMO ADMISSIONS VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoAdmissionsView() {
  const { activeSubTab } = useDemo();
  const candidates = DEMO_ADMISSIONS;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Applications</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">1,420</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">AY 2026-27 Intake</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Documents Verified</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">640</span>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">DigiLocker Synced</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Merit Allotments</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">428</span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">Round 2 Published</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RTE 25% EWS Quota</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">100%</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Statutory Compliant</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Admissions &amp; Enrollment Register</h3>
            <p className="text-xs text-slate-500">Active view: {activeSubTab.replace(/_/g, " ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name or app no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border rounded-xl text-xs border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Verified">Verified</option>
              <option value="In Scrutiny">In Scrutiny</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">App No</th>
                <th className="py-3 px-4">Candidate Legal Name</th>
                <th className="py-3 px-4">Class / Program</th>
                <th className="py-3 px-4">Merit Rank</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">APX-{c.id.slice(-4).toUpperCase()}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">Guardian: {c.guardianName}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.program}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">#{c.meritScore}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-xl font-bold text-[11px] border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. DEMO ACADEMICS VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoAcademicsView() {
  const { theme } = useDemo();
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Cohorts</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">64 Sections</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Capacity: 40/Section</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Syllabus Progress</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">78.4%</span>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">Term 2 Milestone</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Allocation</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">100% Filled</span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">Zero Unassigned Hours</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Lectures</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">420 Slots</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Master Timetable Synced</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Curriculum &amp; Department Workload Matrix</h3>
            <p className="text-xs text-slate-500">Autonomous NEP credit framework and weekly timetable</p>
          </div>
          <button
            type="button"
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs"
          >
            + Add Subject Scheme
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">CSE Core: Distributed Systems</span>
            <p className="text-[11px] text-slate-600">4 Credits (3 Theory + 2 Practical). Faculty: Dr. R. K. Verma</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "82%" }} />
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold block">82% Modules Completed</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">AI &amp; Neural Computation</span>
            <p className="text-[11px] text-slate-600">4 Credits. Lab Slot: Tue &amp; Thu. Faculty: Prof. Ananya Roy</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "75%" }} />
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold block">75% Modules Completed</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">Cloud Architecture &amp; DevOps</span>
            <p className="text-[11px] text-slate-600">3 Credits. Practical Session: Mon &amp; Wed. Faculty: Dr. S. Iyer</p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "90%" }} />
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold block">90% Modules Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. DEMO ATTENDANCE VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoAttendanceView() {
  const [roster, setRoster] = useState([...DEMO_ROSTER]);

  const toggleAttendance = (id: string) => {
    setRoster((prev) =>
      prev.map((st) => (st.id === id ? { ...st, todayCode: st.todayCode === "P" ? "A" : "P" } : st))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Today</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">96.4%</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Biometric Hardware Synced</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent Today</span>
          <span className="text-2xl font-black text-red-600 block mt-1">3.6%</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Automated SMS Dispatched</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Below 75% Risk</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">7 Scholars</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Hall Ticket Gate Warning</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IoT Devices</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">4 Online</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Turnstiles &amp; Facial Pods</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Classroom Roll Call Muster</h3>
            <p className="text-xs text-slate-500">Tap P/A badge to toggle attendance code</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            Today: 08:30 AM Cut-off
          </span>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Monthly %</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-center">Today Roll Call</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.slice(0, 10).map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">#{st.rollNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{st.studentId}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {Math.round((st.monthPresentDays / (st.monthTotalDays || 1)) * 100)}%
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">{st.todaySource}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleAttendance(st.id)}
                      className={`px-3 py-1 rounded-xl font-bold font-mono text-xs transition-transform active:scale-95 cursor-pointer ${
                        st.todayCode === "P"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-red-600 text-white shadow-xs"
                      }`}
                    >
                      {st.todayCode === "P" ? "P • Present" : "A • Absent"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 4. DEMO FEES VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoFeesView() {
  const { theme } = useDemo();
  const [invoices] = useState([...DEMO_INVOICES]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today Collections</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">₹4,85,000</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">UPI &amp; Counter Settled</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Term Realization</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">91.4%</span>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">Semester 4 &amp; 6</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Defaulters Outstanding</span>
          <span className="text-2xl font-black text-amber-700 block mt-1">₹3,40,000</span>
          <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">34 Scholars Flagged</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bank Gateway</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">100% Match</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">NPCI Instant Webhook</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Fee Receipts &amp; Ledger Register</h3>
            <p className="text-xs text-slate-500">Live collection counter with automated receipt generation</p>
          </div>
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Dynamic UPI QR</span>
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Fee Head</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{inv.invoiceNo}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.studentName}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-600">{inv.heads}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-800">{inv.cohort}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <h3 className="font-bold text-slate-900 text-base">Dynamic UPI QR Gateway</h3>
            <p className="text-xs text-slate-500">Scan using any UPI App to reconcile ledger automatically</p>
            <div className="w-44 h-44 bg-slate-900 text-white rounded-2xl mx-auto flex flex-col items-center justify-center p-3 space-y-2">
              <QrCode className="w-24 h-24 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-300">upi://pay?pa=apex@icici</span>
              <span className="text-xs font-bold text-white">₹45,000 Settled</span>
            </div>
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. DEMO EXAMINATIONS VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoExamsView() {
  const { theme } = useDemo();
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NEP SGPA Scale</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">10-Point UGC</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Credit Scheme Configured</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Exams</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">18 Papers</span>
          <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">Semester 6 Finals</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admit Cards</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">3,420 Issued</span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">Barcode Verified</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marks Entry</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">98.2%</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Faculty Signed-Off</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Examination Schedule &amp; Hall Tickets</h3>
            <p className="text-xs text-slate-500">Autonomous semester examination date sheet</p>
          </div>
          <button
            type="button"
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs"
          >
            Generate Broadsheet PDF
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Date &amp; Shift</th>
                <th className="py-3 px-4">Venue Hall</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Admit Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono font-bold text-slate-700">CS-601</td>
                <td className="py-3 px-4 font-bold text-slate-900">Distributed Cloud Architectures</td>
                <td className="py-3 px-4 text-slate-600">12 May 2026 • 09:30 AM</td>
                <td className="py-3 px-4 font-semibold text-slate-800">Exam Hall B (Wing 2)</td>
                <td className="py-3 px-4 font-bold text-emerald-800">120 Scholars</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Released
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono font-bold text-slate-700">CS-602</td>
                <td className="py-3 px-4 font-bold text-slate-900">Neural Network Optimization</td>
                <td className="py-3 px-4 text-slate-600">15 May 2026 • 09:30 AM</td>
                <td className="py-3 px-4 font-semibold text-slate-800">Exam Hall A (Wing 1)</td>
                <td className="py-3 px-4 font-bold text-emerald-800">120 Scholars</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Released
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="py-3 px-4 font-mono font-bold text-slate-700">IT-604</td>
                <td className="py-3 px-4 font-bold text-slate-900">Cyber Forensics &amp; DPDPA Law</td>
                <td className="py-3 px-4 text-slate-600">18 May 2026 • 02:00 PM</td>
                <td className="py-3 px-4 font-semibold text-slate-800">Auditorium Hall 1</td>
                <td className="py-3 px-4 font-bold text-emerald-800">140 Scholars</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Pending Scrutiny
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. DEMO COMMUNICATION VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoCommunicationView() {
  const { theme } = useDemo();
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Business API</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">Active</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Automated Attendance &amp; Fees</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Govt DLT SMS</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">100% Verified</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Template IDs Registered</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Success</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">99.4%</span>
          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">3,812 Pushes Today</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Send Emergency Broadcast</h3>
            <p className="text-xs text-slate-500">Reach parents, faculty, and scholars in under 10 seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Target Cohort</label>
              <select className="w-full border border-slate-200 rounded-xl p-2 text-xs bg-white text-slate-800">
                <option>All Enrolled Scholars (Whole Campus)</option>
                <option>CSE Department (Year 3 &amp; 4)</option>
                <option>Bus Route #4 Commuters</option>
                <option>Fee Defaulters &gt; ₹10,000</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Notice Headline</label>
              <input
                type="text"
                defaultValue="Campus Holiday Declared for Severe Weather Alert"
                className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1">Message Content</label>
              <textarea
                rows={3}
                defaultValue="Dear Parent, as per local administrative advisory, classes for tomorrow stand suspended. Digital labs remain open online."
                className="w-full border border-slate-200 rounded-xl p-2 text-xs text-slate-800 resize-none"
              />
            </div>
            <button
              type="button"
              style={{ backgroundColor: theme.primary }}
              className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">Recent Broadcast Logs</span>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block">Term 2 Examination Hall Tickets Released</span>
                <span className="text-[10px] text-slate-400">Delivered to 3,420 Parents via WhatsApp • 09:15 AM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-800 block">Bus Route #8 Delay Alert (Traffic Congestion)</span>
                <span className="text-[10px] text-slate-400">Delivered to 48 Parents via SMS • 08:12 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. DEMO SETTINGS VIEW
// ════════════════════════════════════════════════════════════════════════════
export function DemoSettingsView() {
  const { institutionName, setInstitutionName } = useDemo();
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Institution Identity &amp; Statutory Profiles</h3>
          <p className="text-xs text-slate-500">Configure public display branding and statutory regulatory codes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Institution Legal Name</label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Affiliation / Regulatory Code</label>
            <input
              type="text"
              defaultValue="AICTE-NAAC-A++ (UGC Autonomous)"
              className="w-full border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Permanent PRN Format</label>
            <input
              type="text"
              defaultValue="APX/{YEAR}/{DEPT}/{SEQ4}"
              className="w-full border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Custom Institutional Domain (CNAME)</label>
            <input
              type="text"
              defaultValue="portal.apex.edu.in"
              className="w-full border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Digital Personal Data Protection Act (DPDPA 2023) Consent Vault Active</span>
          </div>
          <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
            100% Compliant
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 8. DEMO ADDONS VIEW (Library, Transport, Hostel, Placements)
// ════════════════════════════════════════════════════════════════════════════
export function DemoAddonsView({ moduleType }: { moduleType: "library" | "transport" | "hostel" | "placements" }) {
  const configs = {
    library: {
      title: "Library & RFID Catalog Desk",
      kpi1: "38,400 Titles",
      kpi2: "842 On Loan",
      kpi3: "14,500 E-Journals",
      kpi4: "Zero Missing",
      detail: "RFID turnstile gate check-out and DELNET inter-library cataloging active.",
    },
    transport: {
      title: "Transport Fleet & Driver GPS Roster",
      kpi1: "18 Buses Active",
      kpi2: "99.2% On-Time",
      kpi3: "840 Commuters",
      kpi4: "Speed Capped 40km/h",
      detail: "Live satellite telemetry and automated WhatsApp parent ETA alerts on approach.",
    },
    hostel: {
      title: "Hostel Residency & Mess Dietary Registry",
      kpi1: "640 Resident Scholars",
      kpi2: "94% Occupancy",
      kpi3: "FSSAI Grade A+",
      kpi4: "Digital Gate Pass",
      detail: "Biometric curfew scanner and QR dinner redemption active.",
    },
    placements: {
      title: "Campus Placements & Corporate Recruitment",
      kpi1: "₹42 LPA Highest CTC",
      kpi2: "₹8.4 LPA Average",
      kpi3: "128 Recruiter Partners",
      kpi4: "94.8% Placed",
      detail: "Recruitment rounds, slotting algorithm, and automated offer letter release.",
    },
  }[moduleType];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metric 1</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{configs.kpi1}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metric 2</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{configs.kpi2}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metric 3</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{configs.kpi3}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metric 4</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">{configs.kpi4}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">{configs.title}</h3>
          <p className="text-xs text-slate-500">{configs.detail}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">Live Institutional Workflow Ready</span>
          <p className="leading-relaxed">
            All records, hardware telemetries, and student allocations are simulated with 100% realistic dummy data in this demo sandbox.
          </p>
        </div>
      </div>
    </div>
  );
}
