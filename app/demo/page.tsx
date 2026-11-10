"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  CreditCard,
  QrCode,
  X,
  Eye,
  Wifi,
  ShieldCheck,
} from "lucide-react";
import { useDemo, DEMO_ROLES } from "@/lib/demo/demoContext";
import { ARCHETYPES } from "@/lib/terminology";
import { DEMO_ACTIVITIES } from "@/lib/demo/demoMockData";
import { ActivityFeedItem } from "@/lib/actions/dashboardActions";

// Dedicated Demo Sub-Views
import DemoRolesView from "@/components/demo/DemoRolesView";
import {
  DemoAdmissionsView,
  DemoAcademicsView,
  DemoAttendanceView,
  DemoFeesView,
  DemoExamsView,
  DemoCommunicationView,
  DemoSettingsView,
  DemoAddonsView,
} from "@/components/demo/DemoModuleViews";

export default function DemoDashboardPage() {
  const {
    activeModule,
    setActiveModule,
    theme,
    currentDemoRole,
    institutionName,
    currentArchetype,
  } = useDemo();

  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>("all");
  const [activities, setActivities] = useState<ActivityFeedItem[]>([...DEMO_ACTIVITIES]);
  const [viewItemModal, setViewItemModal] = useState<ActivityFeedItem | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState("54000");
  const [upiStudentName, setUpiStudentName] = useState("Aarav Sharma");
  const [toastMessage, setToastMessage] = useState<string>("");

  const activeRoleDef = DEMO_ROLES[currentDemoRole] || DEMO_ROLES.college_admin;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

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

  const filteredActivities = activities.filter((item) => {
    return activityCategoryFilter === "all" || item.category === activityCategoryFilter;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // DYNAMIC MODULE ROUTING (SIDEBAR / DIRECT DRILL-DOWN)
  // ══════════════════════════════════════════════════════════════════════════
  if (activeModule === "admissions") {
    return <DemoAdmissionsView />;
  }
  if (activeModule === "academics") {
    return <DemoAcademicsView />;
  }
  if (activeModule === "attendance") {
    return <DemoAttendanceView />;
  }
  if (activeModule === "fees") {
    return <DemoFeesView />;
  }
  if (activeModule === "exams") {
    return <DemoExamsView />;
  }
  if (activeModule === "communication") {
    return <DemoCommunicationView />;
  }
  if (activeModule === "roles") {
    return <DemoRolesView />;
  }
  if (activeModule === "settings") {
    return <DemoSettingsView />;
  }
  if (activeModule === "library") {
    return <DemoAddonsView moduleType="library" />;
  }
  if (activeModule === "transport") {
    return <DemoAddonsView moduleType="transport" />;
  }
  if (activeModule === "hostel") {
    return <DemoAddonsView moduleType="hostel" />;
  }
  if (activeModule === "placements") {
    return <DemoAddonsView moduleType="placements" />;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEFAULT: EXECUTIVE OVERVIEW DASHBOARD VIEW (AUTHENTIC ORIGINAL STYLE)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
            Welcome back, {activeRoleDef.shortTitle}
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
            <span>{activeRoleDef.department} Console Active</span>
          </span>
        </div>
      </div>

      {/* 2. KPI Metric Cards Row */}
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
              48
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Today&apos;s Admissions
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
              7
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
              96.4%
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
              ₹4.85L
            </span>
            <span className="text-xs font-semibold text-slate-500 block">
              Today&apos;s UPI Collections
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational 2-Column Split */}
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
            {["all", "admissions", "fees", "attendance"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActivityCategoryFilter(cat)}
                style={
                  activityCategoryFilter === cat
                    ? { backgroundColor: theme.primary, color: "#ffffff" }
                    : {}
                }
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                  activityCategoryFilter === cat
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Activity List Rows */}
          <div className="divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No recent activity records found.
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
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        act.status === "Confirmed" || act.status === "Collected"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : act.status === "Rejected"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {act.status}
                    </span>

                    {act.status === "Pending" && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmItem(act.id, act.name)}
                          className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 cursor-pointer"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectItem(act.id, act.name)}
                          className="p-1 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
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
              ))
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions & Operational Gateways */}
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
                <span>Manage Admissions</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUpiModalOpen(true)}
                style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarBorder }}
                className="w-full py-3.5 px-4 rounded-2xl border text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-98 cursor-pointer hover:opacity-90"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Collect Fee (Dynamic UPI QR)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule("attendance")}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Launch Classroom Roll Call</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule("roles")}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Roles &amp; 4-Digit PIN Console</span>
              </button>
            </div>
          </div>

          {/* Operational Health Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operational Health</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                100% Operational
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>Database Connectivity</span>
                <span className="font-bold text-emerald-700 font-mono">Sandbox Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Security</span>
                <span className="font-bold text-slate-700">Multi-Factor Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Institutional Model</span>
                <span className="font-bold text-slate-900">
                  {ARCHETYPES[currentArchetype]?.name || "Degree College"} ({ARCHETYPES[currentArchetype]?.badge || "Autonomous"})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSPECT ACTIVITY DOSSIER MODAL */}
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
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
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
                  Operational Details &amp; Compliance Note
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{viewItemModal.details}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recorded Timestamp
                  </span>
                  <span className="font-mono text-slate-700 text-xs">{viewItemModal.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-right">
                    Current Audit State
                  </span>
                  <span className="font-bold text-emerald-700 text-xs block text-right">
                    {viewItemModal.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewItemModal(null)}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC UPI MODAL */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Dynamic UPI Counter POS</h3>
              <button onClick={() => setIsUpiModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-left">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scholar Name</label>
                <input
                  type="text"
                  value={upiStudentName}
                  onChange={(e) => setUpiStudentName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount (INR ₹)</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="w-40 h-40 bg-slate-900 text-white rounded-2xl mx-auto flex flex-col items-center justify-center p-3 space-y-2">
              <QrCode className="w-20 h-20 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-300">upi://pay?pa=apex@icici</span>
              <span className="text-xs font-bold text-white">₹{upiAmount}</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Instant NPCI settlement for <strong>{upiStudentName}</strong>
            </p>

            <button
              onClick={() => {
                triggerToast(`Payment of ₹${upiAmount} confirmed for ${upiStudentName}. Digital receipt generated.`);
                setIsUpiModalOpen(false);
              }}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Confirm Settlement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
