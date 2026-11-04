"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Palette,
  Building2,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  School,
  GraduationCap,
  Landmark,
  Zap,
  PackagePlus,
  Trash2,
  Plus,
  Layers,
  LayoutDashboard,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Award,
  MessageSquare,
  Shield,
  Settings,
  BookMarked,
  Bus,
  BedDouble,
  Briefcase,
} from "lucide-react";
import {
  useAdmin,
  AdminMainModule,
  ALL_AVAILABLE_MODULES,
} from "@/lib/admin/adminContext";
import { THEME_COLOR_PRESETS } from "@/lib/admin/themeUtils";
import { InstitutionalArchetype } from "@/lib/terminology";

interface CustomizeThemeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping helper
const MODULE_ICONS: Record<AdminMainModule, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  dashboard: LayoutDashboard,
  admissions: UserPlus,
  academics: BookOpen,
  attendance: ClipboardCheck,
  fees: CreditCard,
  exams: Award,
  communication: MessageSquare,
  roles: Shield,
  settings: Settings,
  library: BookMarked,
  transport: Bus,
  hostel: BedDouble,
  placements: Briefcase,
};

export default function CustomizeThemeDrawer({ isOpen, onClose }: CustomizeThemeDrawerProps) {
  const {
    brandColor,
    setBrandColor,
    theme,
    institutionName,
    setInstitutionName,
    currentArchetype,
    setCurrentArchetype,
    enabledModules,
    addModule,
    removeModule,
    resetModules,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"theme" | "archetype" | "modules" | "identity">("theme");
  const [localMotto, setLocalMotto] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("occo_brand_motto");
        if (saved) return saved;
      } catch {
        // ignore SSR
      }
    }
    return "Excellence in Knowledge & Character";
  });
  const [toastMsg, setToastMsg] = useState("");

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleApplyColor = (hex: string) => {
    setBrandColor(hex);
    triggerToast("Theme palette updated in real time!");
  };

  const handleNameChange = (newName: string) => {
    setInstitutionName(newName);
    try {
      localStorage.setItem("occo_institution_name", newName);
    } catch {
      // ignore
    }
  };

  const handleMottoChange = (newMotto: string) => {
    setLocalMotto(newMotto);
    try {
      localStorage.setItem("occo_brand_motto", newMotto);
    } catch {
      // ignore
    }
  };

  const handleResetDefaults = () => {
    handleApplyColor("#1D4ED8");
    handleNameChange("Apex International Global Academy");
    handleMottoChange("Excellence in Knowledge & Character");
    setCurrentArchetype("K12_SCHOOL");
    resetModules();
    triggerToast("Reset to default Royal Blue theme, School model & standard modules.");
  };

  if (!isOpen) return null;

  const archetypeOptions: {
    id: InstitutionalArchetype;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    desc: string;
  }[] = [
    {
      id: "K12_SCHOOL",
      label: "K-12 School",
      sub: "CBSE / ICSE / IB World School",
      icon: School,
      desc: "Roll call, parent WhatsApp broadcasts, RTE 25% quota, CCE progress cards.",
    },
    {
      id: "DEGREE_COLLEGE",
      label: "Degree College",
      sub: "UGC Affiliated / Autonomous",
      icon: GraduationCap,
      desc: "Semester credits, 75% attendance condonation, semester hall tickets.",
    },
    {
      id: "UNIVERSITY",
      label: "Autonomous University",
      sub: "Deemed / State Multi-Campus",
      icon: Landmark,
      desc: "NEP 2020 CBCS major/minor, faculty workload, multi-campus governance.",
    },
    {
      id: "COACHING_ACADEMY",
      label: "Coaching Academy",
      sub: "Competitive Test-Prep",
      icon: Zap,
      desc: "Batches, mock tests, target exam rankers, dynamic UPI fee installments.",
    },
  ];

  const activeModulesList = ALL_AVAILABLE_MODULES.filter((m) => enabledModules.includes(m.id));
  const availableToAddList = ALL_AVAILABLE_MODULES.filter((m) => !enabledModules.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Drawer Header */}
          <div
            className="p-5 border-b flex items-center justify-between text-white"
            style={{ backgroundColor: theme.sidebarBg }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: theme.primary }}
              >
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight">
                  Customize Portal
                </h2>
                <p className="text-[11px] font-medium" style={{ color: theme.primaryLight }}>
                  Theme, Model Archetype & Module Manager
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close customize drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast alert inside drawer */}
          {toastMsg && (
            <div
              className="px-4 py-2 text-xs font-bold text-center text-white transition-all animate-in slide-in-from-top-1"
              style={{ backgroundColor: theme.primary }}
            >
              {toastMsg}
            </div>
          )}

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1.5 gap-1 text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "theme"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("archetype")}
              className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "archetype"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Model</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("modules")}
              className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "modules"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Modules</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[9px] font-bold"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                {enabledModules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("identity")}
              className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "identity"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span>Identity</span>
            </button>
          </div>

          {/* Drawer Body Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-800">
            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: THEME & BRAND COLOR
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                {/* Real-time Miniature Preview */}
                <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Live Portal Appearance Preview</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                    >
                      Active
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs flex h-24">
                    {/* Mini Sidebar */}
                    <div
                      className="w-24 p-2 flex flex-col justify-between"
                      style={{ backgroundColor: theme.sidebarBg }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] text-white font-bold"
                          style={{ backgroundColor: theme.primary }}
                        >
                          O
                        </div>
                        <span className="text-[9px] font-bold text-white truncate">OCCO Core</span>
                      </div>

                      <div
                        className="px-2 py-1 rounded-md text-[8px] font-bold text-white flex items-center gap-1 border"
                        style={{
                          backgroundColor: theme.sidebarActive,
                          borderColor: theme.sidebarActiveBorder,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <span>Dashboard</span>
                      </div>

                      <span className="text-[7px]" style={{ color: theme.primaryLight }}>
                        Owner Portal
                      </span>
                    </div>

                    {/* Mini Main Content */}
                    <div className="flex-1 bg-white p-2.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-900 truncate">
                          {institutionName}
                        </span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="px-2.5 py-1 rounded-lg text-white font-bold text-[9px] shadow-2xs"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Primary Action
                        </div>
                        <div
                          className="px-2 py-0.5 rounded-md text-[8px] font-bold"
                          style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                        >
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curated Presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Curated Color Themes
                  </label>
                  <p className="text-xs text-slate-500">
                    Selecting a palette automatically computes matching sidebar shades, active link glows, and action buttons.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    {THEME_COLOR_PRESETS.map((preset) => {
                      const isSelected = brandColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => handleApplyColor(preset.hex)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-50 border-slate-800 ring-2 ring-slate-800 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-6 h-6 rounded-lg shadow-2xs flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: preset.hex }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                                {preset.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {preset.hex}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Custom Hex Color
                  </label>
                  <p className="text-xs text-slate-500">
                    Use your exact institutional brand color code.
                  </p>

                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      title="Open color wheel"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          handleApplyColor(e.target.value);
                        } else {
                          setBrandColor(e.target.value);
                        }
                      }}
                      placeholder="#1D4ED8"
                      className="w-full bg-transparent font-mono font-bold text-xs text-slate-800 focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyColor(brandColor)}
                      className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs shrink-0 cursor-pointer"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: MODEL ARCHETYPE SWITCHER (Moved here from header)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "archetype" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                    Select Institutional Model Archetype
                  </label>
                  <p className="text-xs text-slate-500">
                    Switches portal terminology, statutory mandates, grading scales, and report formats across all portals.
                  </p>
                </div>

                <div className="space-y-3">
                  {archetypeOptions.map((opt) => {
                    const isSelected = currentArchetype === opt.id;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setCurrentArchetype(opt.id);
                          triggerToast(`Switched model to ${opt.label}!`);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-50 border-slate-800 ring-2 ring-slate-800 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: isSelected ? theme.primary : "#64748B" }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {opt.sub}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 pl-9.5 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3: MODULE MANAGER (Adding & Deleting of Modules)
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Active Portal Modules ({enabledModules.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        resetModules();
                        triggerToast("Restored standard 9 core modules.");
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Standard</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Add or delete modules to tailor your sidebar navigation. Changes take effect instantly.
                  </p>
                </div>

                {/* Section A: Currently Active Modules */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Enabled in Sidebar
                  </span>

                  <div className="space-y-2">
                    {activeModulesList.map((m) => {
                      const Icon = MODULE_ICONS[m.id] || LayoutDashboard;
                      const isLocked = m.isCore; // Dashboard is locked as default

                      return (
                        <div
                          key={m.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900 truncate">
                                  {m.label}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold shrink-0">
                                  {m.category}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {m.description}
                              </span>
                            </div>
                          </div>

                          {isLocked ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0 border border-slate-200/60">
                              Core Locked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                removeModule(m.id);
                                triggerToast(`Removed ${m.label} from active modules.`);
                              }}
                              title={`Delete / Remove ${m.label} from portal`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Available Modules to Add */}
                {availableToAddList.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Available Add-on Modules ({availableToAddList.length})
                    </span>

                    <div className="space-y-2">
                      {availableToAddList.map((m) => {
                        const Icon = MODULE_ICONS[m.id] || PackagePlus;

                        return (
                          <div
                            key={m.id}
                            className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between gap-3 hover:bg-white hover:border-slate-400 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs text-slate-900 truncate">
                                    {m.label}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold shrink-0">
                                    {m.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {m.description}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                addModule(m.id);
                                triggerToast(`Added ${m.label} to active portal modules!`);
                              }}
                              style={{ backgroundColor: theme.primary }}
                              className="px-2.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 shadow-2xs hover:opacity-90 transition-all shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 4: IDENTITY & BRANDING
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "identity" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                    Institution Display Name
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Reflected across the sidebar, fee receipts, and digital admit cards.
                  </p>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="e.g. Apex International Global Academy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                    Institutional Motto / Tagline
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Displayed on student portal login and official transcripts.
                  </p>
                  <input
                    type="text"
                    value={localMotto}
                    onChange={(e) => handleMottoChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="e.g. Excellence in Knowledge and Virtue"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Regulatory Compliance</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Theme modifications and institutional profiles are securely saved to your administrative local vault and comply with DPDPA 2023 guidelines.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Sticky Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: theme.primary }}
              className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-xl text-white font-bold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
            >
              <span>Save & Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
