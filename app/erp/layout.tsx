"use client";

import React, { useState, Suspense } from "react";
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
} from "@/lib/admin/adminContext";
import CustomizeThemeDrawer from "@/components/admin/CustomizeThemeDrawer";

function ErpLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    activeModule,
    setActiveModule,
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

  // Synchronize activeModule if user navigates directly to /erp/roles
  const isRolesRoute = pathname?.includes("/roles");
  const effectiveModule: AdminMainModule = isRolesRoute ? "roles" : activeModule;

  const allNavDefinitions = [
    { id: "dashboard" as AdminMainModule, label: "Dashboard", icon: LayoutDashboard, href: "/erp" },
    { id: "admissions" as AdminMainModule, label: "Admissions", icon: UserPlus, href: "/erp" },
    { id: "academics" as AdminMainModule, label: "Academics", icon: BookOpen, href: "/erp" },
    { id: "attendance" as AdminMainModule, label: "Attendance", icon: ClipboardCheck, href: "/erp" },
    { id: "fees" as AdminMainModule, label: "Fee Ledgers", icon: CreditCard, href: "/erp" },
    { id: "exams" as AdminMainModule, label: "Examinations", icon: Award, href: "/erp" },
    { id: "communication" as AdminMainModule, label: "Communication", icon: MessageSquare, href: "/erp" },
    { id: "roles" as AdminMainModule, label: "Security & Roles", icon: Shield, href: "/erp/roles" },
    { id: "settings" as AdminMainModule, label: "Settings", icon: Settings, href: "/erp" },
    { id: "library" as AdminMainModule, label: "Library & RFID", icon: BookMarked, href: "/erp" },
    { id: "transport" as AdminMainModule, label: "Transport & GPS", icon: Bus, href: "/erp" },
    { id: "hostel" as AdminMainModule, label: "Hostel & Mess", icon: BedDouble, href: "/erp" },
    { id: "placements" as AdminMainModule, label: "Placements", icon: Briefcase, href: "/erp" },
  ];

  const mainNavItems = allNavDefinitions.filter((item) => enabledModules.includes(item.id));
  const currentModuleItem = allNavDefinitions.find((m) => m.id === effectiveModule);
  const currentModuleLabel = currentModuleItem?.label || "Dashboard";

  const handleNavClick = (item: (typeof allNavDefinitions)[0]) => {
    setActiveModule(item.id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 font-sans flex flex-col antialiased">
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 text-white flex flex-col justify-between transition-colors duration-300 ease-in-out border-r shadow-xl md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarBorder }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div
            className="px-6 py-6 border-b flex items-center justify-between"
            style={{ borderColor: theme.sidebarBorder }}
          >
            <Link href="/erp" className="flex items-center space-x-3 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
                style={{ backgroundColor: theme.primary }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                  Core
                </span>
                <span
                  className="text-[10px] font-medium tracking-wide mt-1 uppercase"
                  style={{ color: theme.primaryLight }}
                >
                  Institution ERP
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Campus Identity Pill */}
          <div className="px-4 py-3 border-b" style={{ borderColor: theme.sidebarBorder }}>
            <div className="px-3 py-2 rounded-xl bg-black/20 border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-mono tracking-wider block" style={{ color: theme.primaryLight }}>
                Active Institution
              </span>
              <span className="text-xs font-bold text-white block truncate">
                {institutionName}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveModule === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "text-white shadow-sm font-bold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: theme.sidebarActive,
                          borderLeft: `4px solid ${theme.primaryLight}`,
                        }
                      : {}
                  }
                >
                  <Icon
                    className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: isActive ? "#ffffff" : theme.primaryLight }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t" style={{ borderColor: theme.sidebarBorder }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-xs"
                style={{
                  backgroundColor: theme.sidebarActive,
                  borderColor: theme.sidebarActiveBorder,
                  color: "#ffffff",
                }}
              >
                AD
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
              title="Log out of ERP"
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

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xs">
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
                ERP /
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {currentModuleLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCustomizeOpen(true)}
              title="Customize Portal Appearance & Modules"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer hover:border-slate-300 group"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-45"
                style={{ backgroundColor: theme.primary }}
              >
                <Sliders className="w-3 h-3 text-white" />
              </div>
              <span className="hidden sm:inline">Customize Theme</span>
            </button>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <div
                className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
                style={{ backgroundColor: theme.primary }}
              >
                AD
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none">
                  Admin
                </span>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-red-700 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <CustomizeThemeDrawer
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />
    </div>
  );
}

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F4F7F6]" />}>
        <ErpLayoutInner>{children}</ErpLayoutInner>
      </Suspense>
    </AdminProvider>
  );
}

