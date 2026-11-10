"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Award,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sliders,
  BookMarked,
  Bus,
  BedDouble,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import {
  DemoProvider,
  useDemo,
  DemoMainModule,
  DEMO_MODULE_SUBTABS,
  DEMO_ROLES,
} from "@/lib/demo/demoContext";
import DemoCustomizeThemeDrawer from "@/components/demo/DemoCustomizeThemeDrawer";

function DemoLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    activeModule,
    setActiveModule,
    activeSubTab,
    setActiveSubTab,
    institutionName,
    currentDemoRole,
    theme,
    enabledModules,
  } = useDemo();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const activeRoleDef = DEMO_ROLES[currentDemoRole] || DEMO_ROLES.college_admin;

  const allNavDefinitions = [
    { id: "dashboard" as DemoMainModule, label: "Dashboard", icon: LayoutDashboard },
    { id: "admissions" as DemoMainModule, label: "Admissions", icon: UserPlus },
    { id: "academics" as DemoMainModule, label: "Academics", icon: BookOpen },
    { id: "attendance" as DemoMainModule, label: "Attendance", icon: ClipboardCheck },
    { id: "fees" as DemoMainModule, label: "Fee Ledgers", icon: CreditCard },
    { id: "exams" as DemoMainModule, label: "Examinations", icon: Award },
    { id: "communication" as DemoMainModule, label: "Communication", icon: MessageSquare },
    { id: "roles" as DemoMainModule, label: "Security & Roles", icon: Shield },
    { id: "settings" as DemoMainModule, label: "Settings", icon: Settings },
    { id: "library" as DemoMainModule, label: "Library & RFID", icon: BookMarked },
    { id: "transport" as DemoMainModule, label: "Transport & GPS", icon: Bus },
    { id: "hostel" as DemoMainModule, label: "Hostel & Mess", icon: BedDouble },
    { id: "placements" as DemoMainModule, label: "Placements", icon: Briefcase },
  ];

  const mainNavItems = allNavDefinitions.filter((item) => enabledModules.includes(item.id));
  const currentModuleItem = allNavDefinitions.find((m) => m.id === activeModule);
  const currentModuleLabel = currentModuleItem?.label || "Dashboard";

  // Drilldown mode: When in demo mode and user has chosen a module other than dashboard
  const isDrilldown = activeModule !== "dashboard";
  const activeDrillSubTabs = DEMO_MODULE_SUBTABS[activeModule] || [];

  const handleNavClick = (modId: DemoMainModule) => {
    setActiveModule(modId);
    setMobileSidebarOpen(false);
  };

  const handleBackToAllModules = () => {
    setActiveModule("dashboard");
    setActiveSubTab("overview");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 font-sans flex flex-col antialiased">
      {/* ══════════════════════════════════════════════════════════════════════
          1. LEFT DARK SIDEBAR (Fixed Desktop, Slide-over Mobile, Real-Time Themed)
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 text-white flex flex-col justify-between transition-colors duration-300 ease-in-out border-r shadow-xl md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarBorder }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Header: College Logo & Institute Name */}
          <div
            className="px-5 py-5 border-b flex items-center justify-between gap-3"
            style={{ borderColor: theme.sidebarBorder }}
          >
            <div
              onClick={() => setActiveModule("dashboard")}
              className="flex items-center gap-3 group min-w-0 flex-1 cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 shrink-0 border border-white/20"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-white text-xs sm:text-sm tracking-tight leading-snug group-hover:opacity-90 transition-opacity line-clamp-2">
                  {institutionName}
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items: Sub-modules drill-down vs All Modules */}
          {isDrilldown && currentModuleItem ? (
            <nav className="px-3 py-2 space-y-2 flex-1">
              {/* Back to All Modules Button at Top of Sidebar */}
              <button
                type="button"
                onClick={handleBackToAllModules}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Back to All Modules</span>
              </button>

              {/* Active Selected Module Card in Sidebar */}
              <div
                className="px-3 py-2.5 rounded-xl border flex items-center gap-2.5 shadow-xs"
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderColor: theme.sidebarBorder,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  <currentModuleItem.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {currentModuleItem.label}
                  </span>
                  <span className="text-[10px] block truncate" style={{ color: theme.primaryLight }}>
                    Sub-Modules
                  </span>
                </div>
              </div>

              {/* Sub-modules list */}
              <div className="space-y-1 pt-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Sub-Sections</span>
                  <span className="text-[9px] font-mono text-slate-400">{activeDrillSubTabs.length}</span>
                </div>

                {activeDrillSubTabs.map((subTab) => {
                  const isSubActive = activeSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(subTab.id);
                        setMobileSidebarOpen(false);
                      }}
                      style={
                        isSubActive
                          ? {
                              backgroundColor: theme.sidebarActive,
                              borderColor: theme.sidebarActiveBorder,
                              color: "#ffffff",
                            }
                          : {}
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSubActive
                          ? "text-white shadow-xs border font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSubActive ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                        <span className="truncate text-left">{subTab.label}</span>
                      </div>
                      {subTab.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5"
                          style={{
                            backgroundColor: isSubActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                            color: isSubActive ? "#ffffff" : theme.primaryLight,
                          }}
                        >
                          {subTab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          ) : (
            <nav className="px-3 py-2 space-y-1.5 flex-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    style={
                      isActive
                        ? {
                            backgroundColor: theme.sidebarActive,
                            borderColor: theme.sidebarActiveBorder,
                            color: "#ffffff",
                          }
                        : {}
                    }
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                      isActive
                        ? "text-white shadow-xs border font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0 transition-colors"
                      style={{ color: isActive ? theme.primaryLight : "rgb(148, 163, 184)" }}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Sidebar Footer: Strictly "OCCO Core" Branding */}
        <div
          className="p-3.5 border-t flex items-center justify-start"
          style={{ backgroundColor: "rgba(0,0,0,0.3)", borderColor: theme.sidebarBorder }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 bg-[#091D17] flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/brand/occo-logo.jpg"
                alt="OCCO"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-white text-xs tracking-tight block">
                OCCO Core
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. TOP HEADER & MAIN CONTENT WRAPPER (Shifted on Desktop: md:pl-64)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xs">
          {/* Left: Mobile Hamburger Toggle + Active Module Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="font-bold text-slate-900 text-sm sm:text-base font-serif leading-none">
                {currentModuleLabel}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Theme Customizer Trigger */}
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Customize Theme</span>
            </button>

            {/* Active Simulated Role Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-2xs shrink-0"
                style={{ backgroundColor: theme.primary }}
              >
                {activeRoleDef.initials}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <span className="text-xs font-bold text-slate-800 block leading-tight truncate">
                  {activeRoleDef.label}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none truncate">
                  {activeRoleDef.department}
                </span>
              </div>
            </div>

            {/* Exit Demo CTA button */}
            <Link
              href="/"
              title="Exit Demo Sandbox"
              className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-red-700 transition-colors text-xs font-bold shadow-2xs cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Slide-Over Customization Drawer */}
      <DemoCustomizeThemeDrawer
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <DemoLayoutInner>{children}</DemoLayoutInner>
    </DemoProvider>
  );
}

