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
  LogOut,
  ChevronRight,
  X,
  FileCheck2,
  CalendarDays,
} from "lucide-react";
import {
  getStudentDashboardAction,
  submitStudentLeaveAction,
  payStudentInvoiceUpiAction,
  StudentDashboardPayload,
  StudentInvoiceItem,
  StudentReceiptItem,
} from "@/lib/actions/studentPortalActions";

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "attendance" | "academics" | "fees" | "exams" | "notices"
  >("overview");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentDashboardPayload | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [toastMessage, setToastMessage] = useState("");

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Pay UPI Modal State
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<StudentInvoiceItem | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Receipt Modal State
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<StudentReceiptItem | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleOpenLeaveModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
    setIsLeaveModalOpen(true);
  };

  const refreshDashboard = async (targetId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getStudentDashboardAction(targetId);
      if (res.success && res.data) {
        setData(res.data);
        setSelectedStudentId(res.data.student.id);
      } else {
        setError(res.error || "Failed to load student portal data.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student portal data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getStudentDashboardAction()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data);
          setSelectedStudentId(res.data.student.id);
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

  const handleSwitchStudent = (id: string) => {
    setSelectedStudentId(id);
    refreshDashboard(id);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.student.id) return;

    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (endDate < startDate) {
      alert("Leave end date cannot be earlier than start date.");
      return;
    }
    if (leaveReason.trim().length < 5) {
      alert("Please provide a valid leave reason (at least 5 characters).");
      return;
    }

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
      triggerToast("Leave application submitted successfully. Recorded in official muster.");
      refreshDashboard(data.student.id);
    } else {
      alert(res.error || "Failed to submit leave application.");
    }
  };

  const handleInstantSettleUpi = async () => {
    if (!data?.student.id || !selectedInvoiceForPay) return;

    setIsProcessingPayment(true);
    const res = await payStudentInvoiceUpiAction({
      studentId: data.student.id,
      invoiceId: selectedInvoiceForPay.id,
      amount: selectedInvoiceForPay.remainingAmount,
    });
    setIsProcessingPayment(false);

    if (res.success) {
      setSelectedInvoiceForPay(null);
      triggerToast(`UPI Payment settled successfully! Official Receipt ${res.receiptNo} generated.`);
      refreshDashboard(data.student.id);
    } else {
      alert(res.error || "Failed to settle payment.");
    }
  };

  if (isLoading && !data) {
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

  const { student, attendance, fees, exams, notices, todaySchedule, availableStudents } = data;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
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

          {/* Student Dossier Badge & Interactive Profile Switcher */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
            {/* Student Switcher Dropdown */}
            {availableStudents && availableStudents.length > 1 && (
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">
                  Student:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSwitchStudent(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                  title="Switch between active institutional students"
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll {s.rollNo ?? "N/A"} • {s.className})
                    </option>
                  ))}
                </select>
              </div>
            )}

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

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
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
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "fees"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fees &amp; UPI Pay</span>
              {fees.hasOutstanding && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
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
              📢 Circulars ({notices.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: TODAY OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Outstanding Fee Alert Banner if dues exist */}
            {fees.hasOutstanding && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Tuition &amp; Term Fee Dues Pending</h3>
                    <p className="text-xs text-amber-800">
                      You have an outstanding institutional balance of{" "}
                      <strong>₹{fees.totalDue.toLocaleString("en-IN")}</strong>. Settle via dynamic UPI QR code.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("fees")}
                  className="py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Review &amp; Pay Dues</span>
                </button>
              </div>
            )}

            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Attendance</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      attendance.isSafe ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {attendance.isSafe ? "Safe (≥75%)" : "Shortfall"}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {attendance.percentage}%
                </div>
                <div className="text-[11px] text-slate-500">
                  {attendance.presentCount} of {attendance.totalCount} active session days
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Fee Ledger</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      fees.hasOutstanding ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {fees.hasOutstanding ? "Dues Pending" : "Settled"}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{fees.totalDue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Paid: ₹{fees.totalPaid.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Assessment</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
                    {exams.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {exams.percentage}
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Score: {exams.totalScore}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Leave Desk</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800">
                    {attendance.leaveRequests.length} Filed
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {attendance.leaveRequests.filter((l) => l.status === "Approved").length} Days
                </div>
                <div className="text-[11px] text-slate-500">
                  Approved Condonation Days
                </div>
              </div>
            </div>

            {/* National Student Digital ID Card (NEP 2020 / MoE APAAR standard) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-serif text-xl font-black flex items-center justify-center shadow-md">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {student.firstName} {student.lastName}
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      Roll #{student.rollNo ?? "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {student.className} • {student.sectionName} • Category: {student.category} • Blood Group: {student.bloodGroup}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 font-mono pt-0.5">
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      APAAR ID: {student.apaarId}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      PRN: {student.prn}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenLeaveModal}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <CalendarDays className="w-4 h-4 text-emerald-700" />
                  <span>Apply Leave</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("academics")}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View Timetable</span>
                </button>
              </div>
            </div>

            {/* Split Schedule & Notice Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1: Today's Schedule */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Today&apos;s Class Schedule</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {todaySchedule.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No periods scheduled for today.
                    </div>
                  ) : (
                    todaySchedule.map((slot) => (
                      <div
                        key={slot.period}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-xs">
                            P{slot.period}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{slot.subject}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{slot.code} • {slot.faculty}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-slate-600 block">{slot.time}</span>
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
                    <span>Official Circulars</span>
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
                      No official circulars broadcast today.
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
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
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
                <span className="px-2.5 py-1 bg-white rounded-lg border">Absent: {Math.max(0, attendance.totalCount - Math.floor(attendance.presentCount))}</span>
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
                      <th className="py-2.5 px-4">Session</th>
                      <th className="py-2.5 px-4">Status Code</th>
                      <th className="py-2.5 px-4">Source</th>
                      <th className="py-2.5 px-4">Remarks &amp; Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No attendance records logged for this student yet.
                        </td>
                      </tr>
                    ) : (
                      attendance.recentLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.date}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{log.session}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.code === "P" ? "bg-emerald-100 text-emerald-800" :
                              log.code === "L" ? "bg-amber-100 text-amber-800" :
                              log.code === "LC" ? "bg-teal-100 text-teal-800" :
                              log.code === "HD" ? "bg-purple-100 text-purple-800" :
                              log.code === "OD" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {log.code === "P" && "Present (P)"}
                              {log.code === "L" && "Late Arrival (L)"}
                              {log.code === "LC" && "Medical Cleared (LC)"}
                              {log.code === "HD" && "Half Day (HD)"}
                              {log.code === "OD" && "On Duty (OD)"}
                              {log.code === "A" && "Absent (A)"}
                              {!["P", "L", "LC", "HD", "OD", "A"].includes(log.code) && log.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{log.source}</td>
                          <td className="py-3 px-4 text-slate-600">{log.reason}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real Leave Applications History */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                  <span>My Leave Applications &amp; Status</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {attendance.leaveRequests.length} Application{attendance.leaveRequests.length === 1 ? "" : "s"} Filed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4">Leave Type</th>
                      <th className="py-2.5 px-4">Duration &amp; Dates</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4">Applied On</th>
                      <th className="py-2.5 px-4 text-right">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No leave applications filed for this academic term.
                        </td>
                      </tr>
                    ) : (
                      attendance.leaveRequests.map((lr) => (
                        <tr key={lr.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{lr.type}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">
                            {lr.startDate} → {lr.endDate} ({lr.daysCount} Day{lr.daysCount === 1 ? "" : "s"})
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={lr.reason}>
                            {lr.reason}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{lr.appliedOn}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              lr.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                              lr.status === "Rejected" ? "bg-red-100 text-red-800" :
                              "bg-amber-100 text-amber-800"
                            }`}>
                              {lr.status}
                            </span>
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
            TAB 3: ACADEMICS & TIMETABLE
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "academics" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Curriculum &amp; Weekly Timetable</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class: <strong>{student.className}</strong> • Section: <strong>{student.sectionName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                  Room 204
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                  {todaySchedule.length} Periods Scheduled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedule.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  No courses or schedule entries configured for this class cohort.
                </div>
              ) : (
                todaySchedule.map((slot) => (
                  <div
                    key={slot.period}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] border border-emerald-200">
                        Period {slot.period}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{slot.time}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{slot.subject}</h4>
                      <span className="text-[11px] text-slate-500 font-mono block">Code: {slot.code}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>Faculty: {slot.faculty}</span>
                      <strong className="text-slate-900">{slot.room}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: FEES & UPI PAYMENTS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "fees" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Institutional Fee Ledgers &amp; UPI Checkout</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant settlement via UPI QR, bank transfer receipts, and official tax documentation.
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
                      <th className="py-2.5 px-4">Paid / Balance Due</th>
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
                            <span className="text-red-700 font-bold">₹{inv.remainingAmount.toLocaleString("en-IN")}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{inv.dueDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                              inv.status === "Partial" ? "bg-blue-100 text-blue-800" :
                              inv.status === "Overdue" ? "bg-red-100 text-red-800" :
                              "bg-amber-100 text-amber-800"
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
                                  const matched = fees.receipts.find((r) => r.invoiceId === inv.id) || fees.receipts[0];
                                  if (matched) setSelectedReceiptForView(matched);
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

            {/* Official Receipts History */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs">Payment Receipts History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4">Receipt No</th>
                      <th className="py-2.5 px-4">Amount Paid</th>
                      <th className="py-2.5 px-4">Payment Method</th>
                      <th className="py-2.5 px-4">Txn Reference</th>
                      <th className="py-2.5 px-4">Date &amp; Time</th>
                      <th className="py-2.5 px-4 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fees.receipts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No payment receipts on file for this student yet.
                        </td>
                      </tr>
                    ) : (
                      fees.receipts.map((rcp) => (
                        <tr key={rcp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800">{rcp.receiptNo}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ₹{rcp.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[10px]">
                              {rcp.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{rcp.transactionRef}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{rcp.paidAt}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptForView(rcp)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Print</span>
                            </button>
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

              {exams.isPublished && (
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    triggerToast("Triggered official progress card printing.");
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Card</span>
                </button>
              )}
            </div>

            {!exams.isPublished ? (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm font-serif">Assessment in Progress • Marksheet Awaiting Publication</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Evaluations for {exams.examTitle} are currently being compiled and moderated by the examination board.
                  Once approved by the Academic Dean, your subject-wise scores, letter grades, and statutory Holistic Progress Card (HPC) will be published here.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-900 text-xs font-mono font-bold">
                  <span>Hall Ticket: {exams.hallTicketSeatNo}</span>
                  <span>•</span>
                  <span>Evaluation Status: In Progress</span>
                </div>
              </div>
            ) : (
              /* Official A4 Report Card Container */
              <div className="border border-slate-300 rounded-2xl p-6 sm:p-8 bg-white space-y-6 text-slate-900 shadow-sm print:border-none print:shadow-none print:p-0">
                {/* School Header */}
                <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                  <span className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">
                    Central Board of Secondary Education • Affiliation Code: 1130842
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-slate-900">
                    {student.tenantName}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Holistic Progress Card (HPC) • Academic Session 2026-27
                  </p>
                </div>

                {/* Student & Examination Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Student Name</span>
                    <strong className="text-slate-900 font-serif">{student.firstName} {student.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Admission / Roll No</span>
                    <strong className="font-mono text-slate-900">{student.admissionNo} • #{student.rollNo ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Class &amp; Section</span>
                    <strong className="text-slate-900">{student.cohort}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Seat Number</span>
                    <strong className="font-mono text-blue-700">{exams.hallTicketSeatNo}</strong>
                  </div>
                </div>

                {/* Scholastic Subject Scores Table */}
                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">
                    Part 1: Scholastic Subject Performance
                  </h4>
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold">
                        <th className="py-2.5 px-3 border-r border-slate-300">Code</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Subject Description</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-right">Max Marks</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-right">Marks Obtained</th>
                        <th className="py-2.5 px-3 text-right">CBSE Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {exams.subjects.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">{s.code}</td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">{s.name}</td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono">{s.maxScore}</td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">{s.score}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-800">{s.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-900 text-xs">
                        <td colSpan={2} className="py-2.5 px-3 border-r border-slate-300 uppercase">
                          Aggregate Total &amp; Cumulative Percentage
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-right font-mono">500</td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-right font-mono font-black text-slate-900">
                          {exams.totalScore}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-800 font-black">
                          {exams.percentage} ({exams.grade})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* NEP Co-Scholastic & Life Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <span className="font-bold block text-slate-700">Work Education / CS</span>
                    <span className="text-[11px] text-slate-500 block">Digital Literacy &amp; Problem Solving</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">Grade: A1</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <span className="font-bold block text-slate-700">Art / Music Education</span>
                    <span className="text-[11px] text-slate-500 block">Creative Expression &amp; Aesthetics</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">Grade: A2</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                    <span className="font-bold block text-slate-700">Health &amp; Physical Education</span>
                    <span className="text-[11px] text-slate-500 block">Physical Fitness &amp; Team Sports</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">Grade: A1</span>
                  </div>
                </div>

                {/* Principal Signature & Verification Seal */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-12 h-12 text-slate-800" />
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">Official Academic Transcript</span>
                      <span className="text-[10px] text-slate-400 block font-mono">ID: {student.admissionNo}</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-1">
                    <div className="w-36 h-0.5 bg-slate-400 mx-auto sm:ml-auto mb-1" />
                    <span className="font-bold text-slate-900 block font-serif">Controller of Examinations</span>
                    <span className="text-[10px] text-slate-500 block">Principal Seal &amp; Institutional Authority</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: NOTICES & CIRCULARS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-700" />
                  <span>Institutional Circulars &amp; Direct Broadcasts</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official notices, statutory holiday schedules, and event circulars from Administration.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-mono font-bold border border-blue-200">
                {notices.length} Notice{notices.length === 1 ? "" : "s"} Published
              </span>
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No official circulars have been published by the administration today. All statutory holidays and urgent circulars will appear here.
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-400 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          {n.channel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {n.message}
                    </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm font-serif">Apply for Student Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 bg-white cursor-pointer"
                >
                  <option value="Medical Leave">Medical Leave (Doctor Rest / Illness)</option>
                  <option value="Casual / Personal Leave">Casual / Domestic Urgency</option>
                  <option value="On-Duty (Sports / External Competition)">On-Duty (Sports / External Competition)</option>
                  <option value="Bereavement Leave">Bereavement Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Detailed Reason</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Provide clinical or domestic details for institutional approval..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 resize-none text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isSubmittingLeave ? "Submitting to DB..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: INSTANT DYNAMIC UPI QR PAYMENT & SETTLEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-left">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Instant Fee Settlement</h3>
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
                ₹{selectedInvoiceForPay.remainingAmount.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Total: ₹{selectedInvoiceForPay.amount.toLocaleString("en-IN")} • Already Paid: ₹{selectedInvoiceForPay.paidAmount.toLocaleString("en-IN")}
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

            {/* UPI Deep-link & Instant Settlement Simulation */}
            <div className="space-y-2 pt-1">
              {selectedInvoiceForPay.upiLink && (
                <a
                  href={selectedInvoiceForPay.upiLink}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Open UPI App to Pay</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleInstantSettleUpi}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirm &amp; Settle in PostgreSQL</span>
                  </>
                )}
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
                <strong className="text-emerald-700 font-mono text-sm">
                  ₹{selectedReceiptForView.amount.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-mono text-slate-700 font-bold">{selectedReceiptForView.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-600">{selectedReceiptForView.transactionRef}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">Settled On:</span>
                <span className="font-mono text-slate-600">{selectedReceiptForView.paidAt}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Remarks:</span>
                <span className="text-slate-700 italic">{selectedReceiptForView.notes}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Digitally signed &amp; tax deductible.</span>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  triggerToast("Receipt sent to system printer.");
                }}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white py-3.5 px-4 sm:px-6 text-center text-[11px] text-slate-500 font-sans">
        {student.tenantName} • Student Portal
      </footer>
    </div>
  );
}
