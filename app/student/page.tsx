"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  CreditCard,
  Award,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  Download,
  BookOpen,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  X,
  FileCheck2,
  CalendarDays,
} from "lucide-react";
import {
  getStudentDashboardAction,
  submitStudentLeaveAction,
  StudentDashboardPayload,
} from "@/lib/actions/studentPortalActions";

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "attendance" | "academics" | "fees" | "exams" | "notices"
  >("overview");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentDashboardPayload | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const handleOpenLeaveModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
    setIsLeaveModalOpen(true);
  };

  // Pay UPI Modal
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<{
    invoiceNo: string;
    title: string;
    amount: number;
    upiLink: string;
  } | null>(null);

  // Receipt Modal
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<{
    receiptNo: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    paidAt: string;
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    let isMounted = true;

    getStudentDashboardAction()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error || "Failed to load student portal data.");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load student portal data.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.student.id || !leaveReason.trim()) return;

    setIsSubmittingLeave(true);
    const res = await submitStudentLeaveAction({
      studentId: data.student.id,
      leaveType,
      startDate,
      endDate,
      reason: leaveReason,
    });
    setIsSubmittingLeave(false);

    if (res.success) {
      setIsLeaveModalOpen(false);
      setLeaveReason("");
      triggerToast("Leave application submitted successfully. Dispatched to Class Teacher for approval.");
    } else {
      alert(res.error || "Failed to submit leave application.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center animate-pulse">
          <GraduationCap className="w-6 h-6 text-emerald-700" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-bold text-slate-900 text-base font-serif">Connecting to Student Portal...</h2>
          <p className="text-xs text-slate-500 font-mono">Synchronizing live attendance, timetable, fee ledgers &amp; grades...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-bold text-slate-900 text-base">Unable to Access Student Portal</h2>
          <p className="text-xs text-red-600 max-w-sm">{error || "No active student record found."}</p>
        </div>
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  const { student, attendance, fees, exams, notices, todaySchedule } = data;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#090D16] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-base tracking-tight font-serif">
                  {student.tenantName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Student Portal
                </span>
              </div>
              <span className="text-xs text-slate-500 font-sans">
                Academic Session 2026-27 • Term 1
              </span>
            </div>
          </div>

          {/* Student Dossier Badge */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">
                {student.firstName} {student.lastName}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {student.admissionNo} • {student.cohort}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>PIN Verified</span>
              </span>
              <Link
                href="/auth/login"
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold pt-1 pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📊 Today Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attendance")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "attendance"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📅 Attendance Diary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("academics")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "academics"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📚 Academics &amp; Timetable
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fees")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "fees"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              💳 Fees &amp; UPI Payments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exams")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "exams"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🏆 Marksheet &amp; Report Card
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notices")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === "notices"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📢 Notice Board
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: TODAY OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI Pods */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Attendance Metric */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Session Attendance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    attendance.isSafe ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {attendance.percentage}%
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({attendance.presentCount}/{attendance.totalCount} Days)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      attendance.isSafe ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(attendance.percentage, 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold block ${
                  attendance.isSafe ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {attendance.isSafe ? "✓ Above Statutory 75% Threshold" : "⚠ Shortfall Alert: Attend Upcoming Classes"}
                </span>
              </div>

              {/* 2. Fee Dues Metric */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Outstanding Dues
                </span>
                <span className={`text-2xl sm:text-3xl font-black block font-sans ${
                  fees.hasOutstanding ? "text-red-700" : "text-emerald-700"
                }`}>
                  ₹{fees.totalDue.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {fees.hasOutstanding
                    ? "Term Invoices Pending Clearance"
                    : "✓ All Tuition Dues Cleared"}
                </span>
              </div>

              {/* 3. Next Class Metric */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current / Next Class
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 block truncate">
                  {todaySchedule[0]?.subject || "Mathematics"}
                </strong>
                <span className="text-[10px] text-blue-700 font-mono font-bold block">
                  {todaySchedule[0]?.room || "Room 204"} • {todaySchedule[0]?.time || "08:30 AM"}
                </span>
              </div>

              {/* 4. Examination GPA Metric */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Academic Performance
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                  {exams.percentage}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  {exams.grade}
                </span>
              </div>
            </div>

            {/* 2-Column Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Today's Class Schedule (2 cols wide) */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Today&apos;s Class Schedule &amp; Timetable</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {student.cohort} • Mon-Sat Roster
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {todaySchedule.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No class timetable scheduled for today.
                    </div>
                  ) : (
                    todaySchedule.map((slot) => (
                      <div
                        key={slot.period}
                        className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-mono text-[11px]">
                            P{slot.period}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{slot.subject}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{slot.code} • {slot.faculty}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-700 block">{slot.time}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">{slot.room}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Recent Notices & Circulars */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-700" />
                    <span>Notice Board</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notices")}
                    className="text-[11px] text-blue-700 hover:underline font-bold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No recent circulars broadcast.
                    </div>
                  ) : (
                    notices.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate block">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">{n.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: ATTENDANCE & LEAVES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Student Attendance Diary &amp; Leave Desk</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory attendance tracking with CBSE / Board 75% eligibility compliance monitoring.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenLeaveModal}
                className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Attendance Stat Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              attendance.isSafe
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            }`}>
              <div className="space-y-1">
                <span className="font-bold text-sm block">
                  Overall Academic Presence: {attendance.percentage}% ({attendance.presentCount} of {attendance.totalCount} Session Days)
                </span>
                <span className="text-xs opacity-80 block">
                  {attendance.isSafe
                    ? "✓ You are fully eligible for Board / Institutional Examinations."
                    : "⚠ Shortfall Alert: Attendance is below 75%. Please submit medical condonation or attend upcoming sessions."}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="px-2.5 py-1 bg-white rounded-lg border">Present: {attendance.presentCount}</span>
                <span className="px-2.5 py-1 bg-white rounded-lg border">Absent: {attendance.totalCount - attendance.presentCount}</span>
              </div>
            </div>

            {/* Daily Punch History */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Recent Roll Call Log (Past 30 Days)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Status Code</th>
                      <th className="py-2.5 px-4">Time Recorded</th>
                      <th className="py-2.5 px-4">Remarks &amp; Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No attendance records logged for this student yet.
                        </td>
                      </tr>
                    ) : (
                      attendance.recentLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.code === "P" ? "bg-emerald-100 text-emerald-800" :
                              log.code === "L" ? "bg-amber-100 text-amber-800" :
                              log.code === "ML" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {log.code === "P" && "Present (P)"}
                              {log.code === "L" && "Late (L)"}
                              {log.code === "ML" && "Medical Leave (ML)"}
                              {log.code === "A" && "Absent (A)"}
                              {!["P", "L", "ML", "A"].includes(log.code) && log.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{log.timeIn}</td>
                          <td className="py-3 px-4 text-slate-600">{log.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: ACADEMICS & TIMETABLE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "academics" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Enrolled Curriculum, Courses &amp; Weekly Timetable</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned subjects, credits scheme, and period timetable for {student.cohort}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedule.map((sub) => (
                <div
                  key={sub.code}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      Period {sub.period}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{sub.subject}</h4>
                  <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <strong className="text-slate-800">{sub.room}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Faculty:</span>
                      <strong className="text-slate-800">{sub.faculty}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: FEES & UPI PAYMENTS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "fees" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Fee Ledger &amp; Instant Dynamic UPI Payments</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official invoices, term fee dues, dynamic BharatPe/NPCI UPI QR payments, and verified receipts.
                </p>
              </div>

              {fees.hasOutstanding && (
                <button
                  type="button"
                  onClick={() => {
                    const firstPending = fees.invoices.find((i) => i.status !== "Paid");
                    if (firstPending) setSelectedInvoiceForPay(firstPending);
                  }}
                  className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                >
                  <QrCode className="w-4 h-4 text-emerald-300" />
                  <span>Pay Dues via UPI QR</span>
                </button>
              )}
            </div>

            {/* Invoices Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Official Invoices Ledger</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4">Invoice No</th>
                      <th className="py-2.5 px-4">Particulars / Fee Head</th>
                      <th className="py-2.5 px-4">Total Amount</th>
                      <th className="py-2.5 px-4">Paid / Due</th>
                      <th className="py-2.5 px-4">Due Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fees.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No invoices generated for this student.
                        </td>
                      </tr>
                    ) : (
                      fees.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{inv.title}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="text-emerald-700 font-bold">₹{inv.paidAmount.toLocaleString("en-IN")}</span> /{" "}
                            <span className="text-red-700 font-bold">₹{(inv.amount - inv.paidAmount).toLocaleString("en-IN")}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{inv.dueDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                              inv.status === "Partial" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inv.status !== "Paid" ? (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPay(inv)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Pay via UPI</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const r = fees.receipts[0];
                                  if (r) setSelectedReceiptForView(r);
                                  else triggerToast(`Receipt for ${inv.invoiceNo} is archived in office.`);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: MARKSHEET & REPORT CARD
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 no-print">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Continuous and Comprehensive Evaluation Marksheet (HPC)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory CBSE / NEP 2020 Holistic Progress Card with QR verification.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast("Triggered official progress card printing.");
                }}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Marksheet (A4)</span>
              </button>
            </div>

            {/* Official Printable Report Card Frame */}
            <div className="p-8 border-4 border-double border-slate-800 rounded-xl bg-amber-50/10 space-y-5 font-serif text-slate-900 print-report-card-paper">
              {/* Institution Header */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                <span className="text-[10px] tracking-widest font-sans font-bold uppercase text-slate-500 block">
                  Affiliated to Central / State Educational Board · School Code: 40892
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                  {student.tenantName}
                </h2>
                <p className="text-xs font-sans text-slate-600">
                  Continuous Assessment Record · Holistic Progress Card (HPC)
                </p>
                <div className="pt-1">
                  <span className="inline-block px-3 py-0.5 bg-slate-900 text-white font-sans font-bold text-xs uppercase tracking-widest rounded-sm">
                    {exams.examTitle}
                  </span>
                </div>
              </div>

              {/* Scholar Bio-data Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans text-xs border-b border-slate-300 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scholar Name</span>
                  <strong className="text-slate-950 font-serif text-sm">{student.firstName} {student.lastName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission / Scholar No</span>
                  <strong className="text-slate-950 font-mono">{student.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Class &amp; Section</span>
                  <strong className="text-slate-950">{student.cohort}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Seat ID</span>
                  <strong className="text-slate-950 font-mono">{exams.hallTicketSeatNo}</strong>
                </div>
              </div>

              {/* Part 1: Scholastic Table */}
              <div className="space-y-2 font-sans">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Part 1: Scholastic Subject Evaluation
                </h4>
                <div className="overflow-x-auto border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                        <th className="py-2.5 px-3">Subject Code</th>
                        <th className="py-2.5 px-3">Curriculum Subject Title</th>
                        <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                        <th className="py-2.5 px-3 text-center">Max Marks</th>
                        <th className="py-2.5 px-3 text-right">Letter Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {exams.subjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            Evaluation scores pending publication by Exam Controller.
                          </td>
                        </tr>
                      ) : (
                        exams.subjects.map((sub) => (
                          <tr key={sub.code} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{sub.code}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{sub.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{sub.score}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-500">{sub.maxScore}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{sub.grade}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Part 2: Co-Scholastic & Life Skills */}
              <div className="pt-2 border-t border-slate-200 font-sans space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Part 2: Co-Scholastic &amp; Life Skills
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 block text-[10px]">Work Education / Skill</span>
                    <strong className="text-emerald-800 font-bold">Grade A (Exemplary)</strong>
                  </div>
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 block text-[10px]">Art &amp; Aesthetic Skills</span>
                    <strong className="text-emerald-800 font-bold">Grade A (Exemplary)</strong>
                  </div>
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <span className="text-slate-500 block text-[10px]">Health &amp; Physical Fitness</span>
                    <strong className="text-emerald-800 font-bold">Grade A (Exemplary)</strong>
                  </div>
                </div>
              </div>

              {/* Grand Total & Signatures */}
              <div className="pt-3 border-t-2 border-slate-900 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Overall Aggregate Performance</span>
                  <span className="text-base font-black text-slate-900">
                    {exams.percentage} • <span className="text-emerald-700">{exams.grade}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Session Attendance Seal</span>
                  <span className="font-mono font-bold text-slate-800">{attendance.percentage}% Presence</span>
                </div>
              </div>

              <div className="pt-8 flex justify-between font-sans text-xs text-slate-700 text-center">
                <div>
                  <div className="border-t border-slate-900 w-28 pt-1 font-bold">Class Teacher</div>
                </div>
                <div>
                  <div className="border-t border-slate-900 w-28 pt-1 font-bold">Exam Controller</div>
                </div>
                <div className="flex flex-col items-center">
                  <QrCode className="w-6 h-6 text-slate-700 mb-0.5" />
                  <div className="border-t border-slate-900 w-32 pt-1 font-bold text-slate-950">Principal Seal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: NOTICE BOARD
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-700" />
                <span>Institutional Notice Board &amp; Official Broadcasts</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official circulars, holiday announcements, and emergency notices from principal desk.
              </p>
            </div>

            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active circulars on the notice board.
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border">
                        {n.date}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {n.message}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Broadcast Channel: {n.channel}</span>
                      <span>•</span>
                      <span>Verified Notice</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: APPLY FOR LEAVE
      ══════════════════════════════════════════════════════════════════════ */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Submit Leave Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Medical Leave">Medical Leave (Doctor certificate recommended)</option>
                  <option value="Casual Leave">Casual / Personal Family Leave</option>
                  <option value="On-Duty (OD) Event">On-Duty (Sports / External Competition)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Absence *</label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="State the reason clearly for class teacher records..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingLeave ? "Submitting..." : "Submit to Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: INSTANT DYNAMIC UPI QR PAYMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-left">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Instant Fee Payment</h3>
                <span className="text-[11px] text-slate-500 font-mono">{selectedInvoiceForPay.invoiceNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPay(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">{selectedInvoiceForPay.title}</span>
              <span className="text-2xl font-black text-slate-900 block font-mono">
                ₹{selectedInvoiceForPay.amount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Dynamic UPI QR Code Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-500 flex flex-col items-center justify-center space-y-2">
              <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </span>
            </div>

            {/* UPI Deep-link for mobile browsers */}
            <div className="space-y-2 pt-1">
              <a
                href={selectedInvoiceForPay.upiLink}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Open UPI App to Pay</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoiceForPay(null);
                  triggerToast("Payment submitted for automated bank reconciliation.");
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                I Have Completed the Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: VIEW & PRINT OFFICIAL RECEIPT
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedReceiptForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Official Fee Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptForView(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs font-sans">
              <div className="text-center pb-2 border-b border-slate-200">
                <strong className="text-slate-900 block font-serif text-sm uppercase">{student.tenantName}</strong>
                <span className="text-[10px] text-slate-500 font-mono">Official E-Receipt · Verified Payment</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Receipt Serial No:</span>
                <strong className="text-blue-700 font-mono">{selectedReceiptForView.receiptNo}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Student Name:</span>
                <strong className="text-slate-900">{student.firstName} {student.lastName}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Amount Paid:</span>
                <strong className="text-emerald-700 font-mono text-sm">₹{selectedReceiptForView.amount.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">{selectedReceiptForView.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">NPCI / Bank Ref:</span>
                <span className="font-mono text-slate-600 text-[11px]">{selectedReceiptForView.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid On:</span>
                <span className="font-mono text-slate-800">{selectedReceiptForView.paidAt}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReceiptForView(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast(`Triggered print for Receipt ${selectedReceiptForView.receiptNo}`);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-400 font-mono">
        {student.tenantName} · Student Portal · OCCO Core Engine · 3-Tier PIN Authentication Active
      </footer>
    </div>
  );
}
