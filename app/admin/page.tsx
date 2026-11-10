"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Eye,
  ShieldCheck,
  CreditCard,
  QrCode,
  Wifi,
  X,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/adminContext";
import { ARCHETYPES } from "@/lib/terminology";
import { DEMO_ACTIVITIES } from "@/lib/demo/demoMockData";
import {
  getDashboardOverviewStatsAction,
  getRecentDashboardActivitiesAction,
  ActivityFeedItem,
  DashboardMetricStats,
} from "@/lib/actions/dashboardActions";

// Sub-Module Views
import AdmissionsView from "@/components/admin/AdmissionsView";
import AcademicsView from "@/components/admin/AcademicsView";
import AttendanceView from "@/components/admin/AttendanceView";
import FeesView from "@/components/admin/FeesView";
import ExamsView from "@/components/admin/ExamsView";
import CommunicationView from "@/components/admin/CommunicationView";
import SettingsView from "@/components/admin/SettingsView";
import AddonModulesView from "@/components/admin/AddonModulesView";

export default function AdminDashboardPage() {
  const {
    activeModule,
    setActiveModule,
    activeSubTab,
    currentArchetype,
    institutionName,
    adminName,
    theme,
    isDemoMode,
  } = useAdmin();

  const archetypeConfig = ARCHETYPES[currentArchetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  // Search & Filter States
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>("all");
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [dbStats, setDbStats] = useState<DashboardMetricStats | null>(null);

  // Sync real database metrics & activities when not in demo mode
  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;
    getDashboardOverviewStatsAction("apexacademy")
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setDbStats(res.data);
        }
      })
      .catch((err) => console.warn("Failed to load dashboard stats from DB:", err));

    getRecentDashboardActivitiesAction("apexacademy")
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setActivities(res.data);
        }
      })
      .catch((err) => console.warn("Failed to load dashboard activities from DB:", err));

    return () => {
      isMounted = false;
    };
  }, [isDemoMode]);

  // Modal States
  const [viewItemModal, setViewItemModal] = useState<ActivityFeedItem | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState(
    currentArchetype === "K12_SCHOOL" ? "24500" : currentArchetype === "DEGREE_COLLEGE" ? "54000" : "45000"
  );
  const [upiStudentName, setUpiStudentName] = useState("Aarav Sharma");
  const [toastMessage, setToastMessage] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const rawActivities = isDemoMode ? DEMO_ACTIVITIES : activities;

  // Actions on activity items
  const handleConfirmItem = (id: string, name: string) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Confirmed" } : item))
    );
    triggerToast(`Approved & Confirmed entry for ${name}`);
  };

  const handleRejectItem = (id: string, name: string) => {
    setActivities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
    );
    triggerToast(`Flagged & Rejected entry for ${name}`);
  };

  // Filtered Activities
  const filteredActivities = rawActivities.filter((item) => {
    return activityCategoryFilter === "all" || item.category === activityCategoryFilter;
  });

  // Archetype-adapted metrics
  const metricValues = {
    K12_SCHOOL: { admissions: "12", pending: "3", attendance: "96.8%", collections: "₹4.85L" },
    DEGREE_COLLEGE: { admissions: "48", pending: "7", attendance: "92.4%", collections: "₹18.4L" },
    UNIVERSITY: { admissions: "142", pending: "14", attendance: "94.1%", collections: "₹54.2L" },
    COACHING_ACADEMY: { admissions: "64", pending: "18", attendance: "98.5%", collections: "₹12.6L" },
  }[currentArchetype];

  const activeMetrics = (!isDemoMode && dbStats) ? dbStats : metricValues;


  // ══════════════════════════════════════════════════════════════════════════
  // DYNAMIC MODULE ROUTING (SIDEBAR / TOP HEADER)
  // ══════════════════════════════════════════════════════════════════════════
  if (activeModule === "admissions") {
    return <AdmissionsView archetype={currentArchetype} />;
  }
  if (activeModule === "academics") {
    return <AcademicsView archetype={currentArchetype} />;
  }
  if (activeModule === "attendance") {
    return <AttendanceView archetype={currentArchetype} />;
  }
  if (activeModule === "fees") {
    return <FeesView archetype={currentArchetype} />;
  }
  if (activeModule === "exams") {
    return <ExamsView archetype={currentArchetype} />;
  }
  if (activeModule === "communication") {
    return <CommunicationView archetype={currentArchetype} />;
  }
  if (activeModule === "settings") {
    return <SettingsView archetype={currentArchetype} />;
  }
  if (activeModule === "library") {
    return <AddonModulesView moduleType="library" archetype={currentArchetype} />;
  }
  if (activeModule === "transport") {
    return <AddonModulesView moduleType="transport" archetype={currentArchetype} />;
  }
  if (activeModule === "hostel") {
    return <AddonModulesView moduleType="hostel" archetype={currentArchetype} />;
  }
  if (activeModule === "placements") {
    return <AddonModulesView moduleType="placements" archetype={currentArchetype} />;
  }

  // Dashboard Sub-Tab Fallbacks
  if (activeSubTab === "admissions_feed") {
    return <AdmissionsView archetype={currentArchetype} />;
  }
  if (activeSubTab === "fees_feed") {
    return <FeesView archetype={currentArchetype} />;
  }
  if (activeSubTab === "attendance_feed") {
    return <AttendanceView archetype={currentArchetype} />;
  }
  if (activeSubTab === "statutory_shield") {
    return <SettingsView archetype={currentArchetype} />;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEFAULT: EXECUTIVE OVERVIEW DASHBOARD VIEW (IMAGE 1 STYLE)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
            Welcome back, {adminName || "Administrator"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening at {institutionName} today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border"
            style={{
              backgroundColor: theme.primaryLight,
              color: theme.primaryText,
              borderColor: theme.primaryLight,
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>{terms.leaderTitle} Console Active</span>
          </span>
        </div>
      </div>

      {/* 2. KPI Metric Cards Row (Image 1 Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Admissions */}
        <div
          onClick={() => setActiveModule("admissions")}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-[#1B5E20]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight font-sans">
              {activeMetrics.admissions}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Today&apos;s {terms.cohortPlural} Admissions
            </span>
          </div>
        </div>

        {/* Card 2: Pending Inquiries / Verifications */}
        <div
          onClick={() => setActiveModule("admissions")}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#00695C]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight font-sans">
              {activeMetrics.pending}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Pending Scrutiny
            </span>
          </div>
        </div>

        {/* Card 3: Daily Roll Call Attendance */}
        <div
          onClick={() => setActiveModule("attendance")}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#E8EAF6] text-[#283593] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#283593]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight font-sans">
              {activeMetrics.attendance}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Daily Roll Call Present
            </span>
          </div>
        </div>

        {/* Card 4: Fee Collections Today */}
        <div
          onClick={() => setActiveModule("fees")}
          className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-[#92400E]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-tight font-sans">
              {activeMetrics.collections}
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Today&apos;s UPI Collections
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational 2-Column Split (Image 1 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Recent Activity with View all */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Recent Activity
            </h2>
            <button
              onClick={() => setActiveModule("admissions")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer hover:underline"
            >
              View all
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActivityCategoryFilter("all")}
              style={
                activityCategoryFilter === "all"
                  ? { backgroundColor: theme.primary, color: "#ffffff" }
                  : {}
              }
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                activityCategoryFilter === "all"
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActivityCategoryFilter("admissions")}
              style={
                activityCategoryFilter === "admissions"
                  ? { backgroundColor: theme.primary, color: "#ffffff" }
                  : {}
              }
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                activityCategoryFilter === "admissions"
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Admissions
            </button>
            <button
              onClick={() => setActivityCategoryFilter("fees")}
              style={
                activityCategoryFilter === "fees"
                  ? { backgroundColor: theme.primary, color: "#ffffff" }
                  : {}
              }
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                activityCategoryFilter === "fees"
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Fees
            </button>
            <button
              onClick={() => setActivityCategoryFilter("attendance")}
              style={
                activityCategoryFilter === "attendance"
                  ? { backgroundColor: theme.primary, color: "#ffffff" }
                  : {}
              }
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                activityCategoryFilter === "attendance"
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Roll Call
            </button>
          </div>

          {/* Activity List Rows */}
          <div className="divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No recent activity records found. Activities will automatically log here in real-time as admissions, fee receipts, and exam results are recorded.
              </div>
            ) : (
              filteredActivities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-900 block text-xs truncate">
                    {act.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {act.program}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {act.status === "Pending" && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                      Pending
                    </span>
                  )}
                  {act.status === "Confirmed" && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1]">
                      Confirmed
                    </span>
                  )}
                  {act.status === "Collected" && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                      Collected
                    </span>
                  )}
                  {act.status === "Rejected" && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
                      Rejected
                    </span>
                  )}

                  <button
                    onClick={() => setViewItemModal(act)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Inspect dossier"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions (Image 1 Style) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif pb-2 border-b border-slate-100">
              Quick Actions
            </h2>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setActiveModule("admissions")}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer hover:opacity-90"
              >
                <Calendar className="w-4 h-4" />
                <span>Manage {terms.cohortPlural} Admissions</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUpiModalOpen(true)}
                style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarBorder }}
                className="w-full py-3.5 px-4 rounded-2xl border text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer hover:opacity-90"
              >
                <QrCode className="w-4 h-4" style={{ color: theme.primary }} />
                <span>Collect Fee (Dynamic UPI QR)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule("attendance")}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Users className="w-4 h-4" style={{ color: theme.primary }} />
                <span>Launch Classroom Roll Call</span>
              </button>

              <Link
                href="/admin/roles"
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" style={{ color: theme.primary }} />
                <span>Roles & 4-Digit PIN Console</span>
              </Link>
            </div>
          </div>

          {/* Operational Gateways Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <span>Operational Health</span>
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.primaryText,
                  borderColor: theme.primaryLight,
                }}
              >
                100% Operational
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>Database Connectivity</span>
                <span className="font-bold text-emerald-700 font-mono">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Security</span>
                <span className="font-bold text-slate-700">Multi-Factor Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Institutional Model</span>
                <span className="font-bold text-slate-900">{archetypeConfig.badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSPECT ACTIVITY MODAL */}
      {viewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  {viewItemModal.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{viewItemModal.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Phone: {viewItemModal.phone}</p>
                </div>
              </div>

              <button
                onClick={() => setViewItemModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Program / Module Context
                </span>
                <span className="font-bold text-slate-800 text-xs block">{viewItemModal.program}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operational Details & Compliance Note
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">{viewItemModal.details}</p>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Record Status:</span>
                <span className="font-bold text-slate-900">{viewItemModal.status}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleRejectItem(viewItemModal.id, viewItemModal.name);
                  setViewItemModal(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  handleConfirmItem(viewItemModal.id, viewItemModal.name);
                  setViewItemModal(null);
                }}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                Approve & Confirm
              </button>
              <button
                type="button"
                onClick={() => setViewItemModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC UPI QR MODAL */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dynamic UPI QR Collection Counter</h3>
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    NPCI Instant Ledger Reconciliation
                  </span>
                </div>
              </div>
              <button onClick={() => setIsUpiModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Legal Name</label>
                <input
                  type="text"
                  value={upiStudentName}
                  onChange={(e) => setUpiStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fee Amount (INR ₹)</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-center">
                <div className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-dashed border-emerald-600/60 shadow-xs flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white text-[9px] font-mono p-1">
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
                onClick={() => {
                  triggerToast(`Received ₹${upiAmount} from ${upiStudentName}. Digital Invoice #INV-2026-891 created.`);
                  setIsUpiModalOpen(false);
                }}
                style={{ backgroundColor: theme.primary }}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                Confirm Payment & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
