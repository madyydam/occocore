"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  AdminProvider,
  useAdmin,
  AdminMainModule,
  MODULE_SUBTABS,
} from "@/lib/admin/adminContext";
import CustomizeThemeDrawer from "@/components/admin/CustomizeThemeDrawer";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeModule,
    setActiveModule,
    activeSubTab,
    setActiveSubTab,
    institutionName,
    adminRole,
    theme,
    enabledModules,
    isDemoMode,
    setIsDemoMode,
  } = useAdmin();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Synchronize activeModule if user navigates directly to /admin/roles
  const isRolesRoute = pathname === "/admin/roles";
  const effectiveModule: AdminMainModule = isRolesRoute ? "roles" : activeModule;

  const subTabs = MODULE_SUBTABS[effectiveModule] || [];

  const allNavDefinitions = [
    { id: "dashboard" as AdminMainModule, label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { id: "admissions" as AdminMainModule, label: "Admissions", icon: UserPlus, href: "/admin" },
    { id: "academics" as AdminMainModule, label: "Academics", icon: BookOpen, href: "/admin" },
    { id: "attendance" as AdminMainModule, label: "Attendance", icon: ClipboardCheck, href: "/admin" },
    { id: "fees" as AdminMainModule, label: "Fee Ledgers", icon: CreditCard, href: "/admin" },
    { id: "exams" as AdminMainModule, label: "Examinations", icon: Award, href: "/admin" },
    { id: "communication" as AdminMainModule, label: "Communication", icon: MessageSquare, href: "/admin" },
    { id: "roles" as AdminMainModule, label: "Security & Roles", icon: Shield, href: "/admin/roles" },
    { id: "settings" as AdminMainModule, label: "Settings", icon: Settings, href: "/admin" },
    { id: "library" as AdminMainModule, label: "Library & RFID", icon: BookMarked, href: "/admin" },
    { id: "transport" as AdminMainModule, label: "Transport & GPS", icon: Bus, href: "/admin" },
    { id: "hostel" as AdminMainModule, label: "Hostel & Mess", icon: BedDouble, href: "/admin" },
    { id: "placements" as AdminMainModule, label: "Placements", icon: Briefcase, href: "/admin" },
  ];

  // Dynamically filter sidebar based on enabled/added modules in customization manager
  const mainNavItems = allNavDefinitions.filter((item) => enabledModules.includes(item.id));
  const currentModuleItem = allNavDefinitions.find((m) => m.id === effectiveModule);
  const currentModuleLabel = currentModuleItem?.label || "Dashboard";

  // Drill-down sub-module navigation for demo mode only
  // In demo mode, selecting any non-dashboard module transforms the sidebar into only that module's sub-tabs
  const isDemoDrilldown = isDemoMode && effectiveModule !== "dashboard";
  const activeDrillItem = isDemoDrilldown ? currentModuleItem : null;
  const activeDrillSubTabs = isDemoDrilldown ? subTabs : [];

  const handleNavClick = (item: (typeof allNavDefinitions)[0]) => {
    setActiveModule(item.id);
    setMobileSidebarOpen(false);
  };

  const handleBackToAllModules = () => {
    setActiveModule("dashboard");
    if (pathname === "/admin/roles") {
      router.push(isDemoMode ? "/admin?mode=demo" : "/admin");
    }
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
          {/* Sidebar Header: College Logo, Institute Name BIG & Logged-in Role SMALL */}
          <div
            className="px-5 py-5 border-b flex items-start justify-between gap-3"
            style={{ borderColor: theme.sidebarBorder }}
          >
            <Link
              href="/admin"
              onClick={() => {
                setActiveModule("dashboard");
              }}
              className="flex items-start gap-3 group min-w-0 flex-1"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 shrink-0 border border-white/20"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-white text-xs tracking-tight leading-snug group-hover:opacity-90 transition-opacity line-clamp-2">
                  {institutionName}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  <span
                    className="text-[10px] font-medium tracking-wide uppercase truncate"
                    style={{ color: theme.primaryLight }}
                  >
                    {adminRole}
                  </span>
                </div>
              </div>
            </Link>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items: Sub-modules drill-down in Demo Mode vs All Modules in Standard */}
          {isDemoDrilldown && activeDrillItem ? (
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
                  <activeDrillItem.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {activeDrillItem.label}
                  </span>
                  <span className="text-[10px] block truncate" style={{ color: theme.primaryLight }}>
                    Sub-Modules Selection
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
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                <span>Active Modules</span>
                <span className="text-[9px] font-mono opacity-75">{mainNavItems.length}</span>
              </div>

              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveModule === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleNavClick(item)}
                    style={
                      isActive
                        ? {
                            backgroundColor: theme.sidebarActive,
                            borderColor: theme.sidebarActiveBorder,
                            color: "#ffffff",
                          }
                        : {}
                    }
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "text-white shadow-xs border font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0 transition-colors"
                      style={{ color: isActive ? theme.primaryLight : "rgb(148, 163, 184)" }}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.primary }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Sidebar Footer: Only "OCCO Core" Branding */}
        <div
          className="p-3.5 border-t flex items-center justify-between"
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

          <Link
            href="/auth/login"
            title="Log out of Institution Portal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </Link>
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
        {/* Top Header Bar (Ultra Clean: Left Title/Breadcrumb, Right Actions) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xs">
          {/* Left: Mobile Hamburger Toggle + Active Module Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-extrabold shadow-2xs shrink-0"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {currentModuleLabel}
              </h1>
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                {isDemoMode ? "Demo" : "Live"}
              </span>
            </div>
          </div>

          {/* Right: Clean Header with Customize Button, Admin Profile & Log out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Customize Portal Button / Icon */}
            <button
              type="button"
              onClick={() => setIsCustomizeOpen(true)}
              title="Customize Portal Appearance, Model Archetype & Modules"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:border-slate-300 group"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-45"
                style={{ backgroundColor: theme.primary }}
              >
                <Sliders className="w-3 h-3 text-white" />
              </div>
              <span className="hidden sm:inline">Customize</span>
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <div
                className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
                style={{ backgroundColor: theme.primary }}
              >
                IO
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {adminRole}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none">
                  Institutional Governance
                </span>
              </div>
            </div>

            {/* Log out CTA button just as icon */}
            <Link
              href="/auth/login"
              title="Log out"
              aria-label="Log out"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-red-700 transition-colors shadow-2xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Demo Mode Alert Banner */}
        {isDemoMode && (
          <div className="bg-amber-500 text-amber-950 px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-600 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-950 animate-ping" />
              <span>
                <strong>Demo Sandbox Active:</strong> You are exploring with sample college mock data. Changes in this session are not saved to the real PostgreSQL database.
              </span>
            </div>
            <Link
              href="/admin?mode=real"
              onClick={() => {
                setIsDemoMode(false);
              }}
              className="px-2.5 py-1 rounded bg-amber-950 hover:bg-black text-amber-100 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ml-4 inline-block"
            >
              Switch to Real DB Mode
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SUB-MODULE SECONDARY NAVIGATION STRIP (BELOW MAIN HEADER)
        ══════════════════════════════════════════════════════════════════════ */}
        {subTabs.length > 1 && (
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pr-1 shrink-0 hidden sm:inline">
              Sections:
            </span>
            {subTabs.map((tab) => {
              const isSelected = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                          color: "#ffffff",
                        }
                      : {}
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={
                        isSelected
                          ? { backgroundColor: "rgba(255, 255, 255, 0.25)", color: "#ffffff" }
                          : {}
                      }
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? "text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Slide-Over Customization Drawer */}
      <CustomizeThemeDrawer
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
