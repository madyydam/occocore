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
  BookOpen,
  ClipboardCheck,
  Award,
  MessageSquare,
  Shield,
  Settings,
  Library,
  Bus,
  BedDouble,
  Briefcase,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  useDemo,
  DEMO_ROLES,
  DemoRoleKey,
  DEMO_AVAILABLE_MODULES,
  DEMO_MODULE_SUBTABS,
} from "@/lib/demo/demoContext";
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

const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  admissions: Users,
  academics: BookOpen,
  attendance: ClipboardCheck,
  fees: CreditCard,
  exams: Award,
  communication: MessageSquare,
  roles: Shield,
  settings: Settings,
  library: Library,
  transport: Bus,
  hostel: BedDouble,
  placements: Briefcase,
};

const DEMO_ROLE_KEYS: DemoRoleKey[] = [
  "super_admin",
  "college_admin",
  "principal",
  "hod",
  "faculty",
  "admission_officer",
  "accountant",
  "hr_manager",
  "librarian",
  "student",
  "parent",
];

export default function DemoDashboardPage() {
  const {
    activeModule,
    setActiveModule,
    theme,
    currentDemoRole,
    setCurrentDemoRole,
  } = useDemo();

  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>("all");
  const [activities, setActivities] = useState<ActivityFeedItem[]>([...DEMO_ACTIVITIES]);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState("54000");
  const [upiStudentName, setUpiStudentName] = useState("Aarav Sharma");
  const [toastMessage, setToastMessage] = useState<string>("");

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
  // DEFAULT: EXECUTIVE OVERVIEW DASHBOARD VIEW
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

      {/* ══════════════════════════════════════════════════════════════════════
          DEMO MODE: 11 ROLES SWITCHER & ACTIVE PERSONA METRICS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: theme.primary }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Institutional Roles &amp; Persona Simulation
              </h2>
              <p className="text-[11px] text-slate-500">
                Switch between 11 roles to preview tailored dashboards, permissions, and departmental live KPIs.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider shrink-0 w-fit">
            Client Demo Sandbox
          </span>
        </div>

        {/* 11 Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {DEMO_ROLE_KEYS.map((rk) => {
            const roleDef = DEMO_ROLES[rk];
            const isCurrent = currentDemoRole === rk;
            return (
              <button
                key={rk}
                type="button"
                onClick={() => setCurrentDemoRole(rk)}
                style={
                  isCurrent
                    ? { backgroundColor: theme.primary, color: "#ffffff", borderColor: theme.primary }
                    : {}
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border flex items-center gap-1.5 ${
                  isCurrent
                    ? "text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80"
                }`}
              >
                <span>{roleDef.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Role Context Banner & 4 Role-Tailored KPIs */}
        {DEMO_ROLES[currentDemoRole] && (
          <div
            className="p-4 rounded-2xl border transition-all"
            style={{
              backgroundColor: "rgba(21, 62, 53, 0.04)",
              borderColor: "rgba(21, 62, 53, 0.15)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-emerald-900/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {DEMO_ROLES[currentDemoRole].shortTitle}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${DEMO_ROLES[currentDemoRole].badge}`}>
                    {DEMO_ROLES[currentDemoRole].department}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {DEMO_ROLES[currentDemoRole].permissionsDescription}
                </p>
              </div>
            </div>

            {/* 4 Dynamic Role-Tailored KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {DEMO_ROLES[currentDemoRole].sampleStats.map((st, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {st.label}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    {st.value}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 block mt-0.5">
                    {st.hint}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          INTERACTIVE MODULE-BASED NAVIGATION CARDS (ALL 12 MAIN MODULES)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              College ERP Modules
            </h2>
            <p className="text-xs text-slate-500">
              Select any module below to open its dedicated workflow and sub-module navigation.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {DEMO_AVAILABLE_MODULES.filter((m) => m.id !== "dashboard").length} Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEMO_AVAILABLE_MODULES.filter((m) => m.id !== "dashboard").map((mod) => {
            const Icon = MODULE_ICON_MAP[mod.id] || BookOpen;
            const subCount = DEMO_MODULE_SUBTABS[mod.id]?.length || 0;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors">
                      {mod.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-950 transition-colors">
                      {mod.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {subCount} Sub-Sections
                  </span>
                  <span
                    className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: theme.primary }}
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          QUICK KPI STATS & RECENT OPERATIONAL LOG
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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

      {/* 2-Column Split: Activity Log + Quick Counter Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Live Institutional Activity Log
            </h2>
            <button
              onClick={() => setActiveModule("admissions")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer hover:underline"
            >
              View all
            </button>
          </div>

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
                {cat}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filteredActivities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {act.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 text-xs block truncate leading-tight">
                      {act.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate leading-tight mt-0.5">
                      {act.details || act.program}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Dynamic UPI Collection */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Quick POS Counter</h3>
            <p className="text-xs text-slate-500">Collect fee receipts instantly</p>
          </div>

          <div className="space-y-3 text-xs">
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

            <button
              type="button"
              onClick={() => setIsUpiModalOpen(true)}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch UPI QR Counter</span>
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC UPI MODAL */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Dynamic UPI Counter POS</h3>
              <button onClick={() => setIsUpiModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
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
