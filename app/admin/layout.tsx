"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import {
  AdminProvider,
  useAdmin,
  AdminMainModule,
  MODULE_SUBTABS,
} from "@/lib/admin/adminContext";
import { ARCHETYPES } from "@/lib/terminology";
import CustomizeThemeDrawer from "@/components/admin/CustomizeThemeDrawer";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    activeModule,
    setActiveModule,
    activeSubTab,
    setActiveSubTab,
    currentArchetype,
    institutionName,
    adminName,
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

  const handleNavClick = (item: (typeof allNavDefinitions)[0]) => {
    setActiveModule(item.id);
    setMobileSidebarOpen(false);
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
          {/* Sidebar Header: Logo & Branding */}
          <div
            className="px-6 py-6 border-b flex items-center justify-between"
            style={{ borderColor: theme.sidebarBorder }}
          >
            <Link
              href="/admin"
              onClick={() => setActiveModule("dashboard")}
              className="flex items-center gap-3 group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                  OCCO Core
                </span>
                <span
                  className="text-[10px] font-medium tracking-wide mt-1 uppercase"
                  style={{ color: theme.primaryLight }}
                >
                  Owner Admin Portal
                </span>
              </div>
            </Link>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Institutional Context Chip */}
          <div
            className="px-5 py-3 mx-3 my-3 rounded-xl border flex items-center gap-2.5 transition-colors"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", borderColor: theme.sidebarBorder }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-slate-200 block truncate">
                {institutionName}
              </span>
              <span
                className="text-[9px] font-medium block truncate"
                style={{ color: theme.primaryLight }}
              >
                {ARCHETYPES[currentArchetype]?.badge || "CBSE / NEP 2020"}
              </span>
            </div>
          </div>

          {/* Navigation Items (Main Modules Only - Filtered by Module Manager) */}
          <nav className="px-3 py-2 space-y-1.5 flex-1">
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
        </div>

        {/* Sidebar Footer: Super Admin Profile */}
        <div
          className="p-3 border-t"
          style={{ backgroundColor: "rgba(0,0,0,0.3)", borderColor: theme.sidebarBorder }}
        >
          <div
            className="p-2.5 rounded-xl border flex items-center justify-between gap-3"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", borderColor: theme.sidebarBorder }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0"
                style={{
                  backgroundColor: theme.sidebarActive,
                  borderColor: theme.sidebarActiveBorder,
                  color: "#ffffff",
                }}
              >
                SA
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-white block truncate leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] block truncate" style={{ color: theme.primaryLight }}>
                  {adminRole}
                </span>
              </div>
            </div>

            <Link
              href="/auth/login"
              title="Log out of Super Admin Portal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
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
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                Console /
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {currentModuleLabel}
              </h1>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                Live
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
                SA
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Log out CTA button matching reference */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-red-700 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Link>
          </div>
        </header>

        {/* Demo Mode Alert Banner */}
        {isDemoMode && (
          <div className="bg-amber-500 text-amber-950 px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-600 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-950 animate-ping" />
              <span>
                <strong>Demo Sandbox Active:</strong> You are exploring with mock data without authentication. Changes in this session are not saved to the PostgreSQL database.
              </span>
            </div>
            <Link
              href="/admin"
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
        {subTabs.length > 0 && (
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
