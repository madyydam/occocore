"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Palette,
  Building2,
  Check,
  RotateCcw,
  Sliders,
  PackagePlus,
  Archive,
  ArchiveRestore,
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
  Upload,
  Globe,
  Link2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Stamp,
  Image as ImageIcon,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import {
  useAdmin,
  AdminMainModule,
  ALL_AVAILABLE_MODULES,
} from "@/lib/admin/adminContext";
import { THEME_COLOR_PRESETS } from "@/lib/admin/themeUtils";

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
    enabledModules,
    addModule,
    removeModule,
    resetModules,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<"theme" | "modules" | "identity">("theme");
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

  // Comprehensive Institutional Identity & Branding states
  const [logoUrl, setLogoUrl] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_logo") || "";
      } catch {
        // ignore
      }
    }
    return "";
  });

  const [shortName, setShortName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_short_name") || "Apex Global";
      } catch {
        // ignore
      }
    }
    return "Apex Global";
  });

  const [affiliationCode, setAffiliationCode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_affiliation") || "CBSE/AFF/2026/8921";
      } catch {
        // ignore
      }
    }
    return "CBSE/AFF/2026/8921";
  });

  const [websiteUrl, setWebsiteUrl] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_website") || "https://www.apexacademy.edu.in";
      } catch {
        // ignore
      }
    }
    return "https://www.apexacademy.edu.in";
  });

  const [portalCname, setPortalCname] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_cname") || "portal.apexacademy.edu.in";
      } catch {
        // ignore
      }
    }
    return "portal.apexacademy.edu.in";
  });

  const [admissionsUrl, setAdmissionsUrl] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_admissions_url") || "https://admissions.apexacademy.edu.in";
      } catch {
        // ignore
      }
    }
    return "https://admissions.apexacademy.edu.in";
  });

  const [contactEmail, setContactEmail] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_email") || "admissions@apexacademy.edu.in";
      } catch {
        // ignore
      }
    }
    return "admissions@apexacademy.edu.in";
  });

  const [contactPhone, setContactPhone] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_phone") || "+91 80 2845 9000";
      } catch {
        // ignore
      }
    }
    return "+91 80 2845 9000";
  });

  const [campusAddress, setCampusAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_address") || "Plot 42, Institutional Knowledge Park, Phase 1, Bangalore 560098";
      } catch {
        // ignore
      }
    }
    return "Plot 42, Institutional Knowledge Park, Phase 1, Bangalore 560098";
  });

  const [sealAttached, setSealAttached] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("occo_brand_seal_attached") !== "false";
      } catch {
        // ignore
      }
    }
    return true;
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

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast("Logo size exceeds 2MB limit. Please upload a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        try {
          localStorage.setItem("occo_brand_logo", base64);
        } catch {
          // ignore
        }
        triggerToast("New institution logo uploaded and attached!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndClose = () => {
    try {
      localStorage.setItem("occo_institution_name", institutionName);
      localStorage.setItem("occo_brand_logo", logoUrl);
      localStorage.setItem("occo_brand_short_name", shortName);
      localStorage.setItem("occo_brand_motto", localMotto);
      localStorage.setItem("occo_brand_affiliation", affiliationCode);
      localStorage.setItem("occo_brand_website", websiteUrl);
      localStorage.setItem("occo_brand_cname", portalCname);
      localStorage.setItem("occo_brand_admissions_url", admissionsUrl);
      localStorage.setItem("occo_brand_email", contactEmail);
      localStorage.setItem("occo_brand_phone", contactPhone);
      localStorage.setItem("occo_brand_address", campusAddress);
      localStorage.setItem("occo_brand_seal_attached", String(sealAttached));
    } catch {
      // ignore
    }
    triggerToast("Saved branding, logo attachments & identity configurations!");
    onClose();
  };

  const handleResetDefaults = () => {
    handleApplyColor("#1D4ED8");
    handleNameChange("Apex International Global Academy");
    handleMottoChange("Excellence in Knowledge & Character");
    setLogoUrl("");
    setShortName("Apex Global");
    setAffiliationCode("CBSE/AFF/2026/8921");
    setWebsiteUrl("https://www.apexacademy.edu.in");
    setPortalCname("portal.apexacademy.edu.in");
    setAdmissionsUrl("https://admissions.apexacademy.edu.in");
    setContactEmail("admissions@apexacademy.edu.in");
    setContactPhone("+91 80 2845 9000");
    setCampusAddress("Plot 42, Institutional Knowledge Park, Phase 1, Bangalore 560098");
    setSealAttached(true);
    resetModules();
    triggerToast("Reset to default Royal Blue theme & standard identity.");
  };

  if (!isOpen) return null;

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
                  Theme, Module Manager & Identity
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
                TAB 2: MODULE MANAGER (Adding & Deleting of Modules)
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
                    Enable or archive modules to customize your sidebar. Archived modules preserve all existing data and can be unarchived anytime.
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
                                triggerToast(`Archived ${m.label}. Module moved to archived section.`);
                              }}
                              title={`Archive ${m.label} from active sidebar`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors text-[11px] font-bold shrink-0 cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700" />
                              <span>Archive</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Archived / Available Modules to Restore */}
                {availableToAddList.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Archived &amp; Inactive Modules ({availableToAddList.length})
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
                                triggerToast(`Restored ${m.label} to active portal modules!`);
                              }}
                              style={{ backgroundColor: theme.primary }}
                              className="px-2.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1 shadow-2xs hover:opacity-90 transition-all shrink-0 cursor-pointer"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                              <span>Restore</span>
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
                TAB 3: IDENTITY, BRANDING & LINK ATTACHMENTS
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "identity" && (
              <div className="space-y-6">
                {/* 1. Logo & Visual Brand Attachments */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Logo &amp; Brand Attachments
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">PNG, SVG, JPG (Max 2MB)</span>
                  </div>

                  {/* Logo Preview and Upload Controls */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-1 bg-white shrink-0 overflow-hidden shadow-2xs"
                    >
                      {logoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={logoUrl}
                          alt="Institution Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <GraduationCap className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="logo-file-input"
                          className="px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-2xs hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                          style={{ backgroundColor: theme.primary }}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo</span>
                        </label>
                        <input
                          id="logo-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />

                        {logoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoUrl("");
                              try {
                                localStorage.removeItem("occo_brand_logo");
                              } catch {
                                // ignore
                              }
                              triggerToast("Restored default institution crest.");
                            }}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Appears on top sidebar, official marksheets, dynamic fee receipts, and digital admit cards.
                      </p>
                    </div>
                  </div>

                  {/* Direct Logo Image URL Input */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Or Direct Logo Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      />
                      {logoUrl && (
                        <a
                          href={logoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                          title="Preview URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Web Presence & Link Attachments */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Website &amp; Digital Link Attachments
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      SSL Active
                    </span>
                  </div>

                  {/* Official Website Link */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                      Official Institution Website
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Link2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          placeholder="https://www.apexacademy.edu.in"
                        />
                      </div>
                      <a
                        href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors shrink-0"
                        title="Visit Institution Website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit</span>
                      </a>
                    </div>
                  </div>

                  {/* Custom Domain / White-label CNAME */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                      Custom Portal CNAME (White-label)
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={portalCname}
                        onChange={(e) => setPortalCname(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="portal.apexacademy.edu.in"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Mapped to your DNS CNAME record for seamless white-label domain routing.
                    </p>
                  </div>

                  {/* Public Admissions Inquiry Link */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                      Public Admissions Application Form Link
                    </label>
                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="url"
                        value={admissionsUrl}
                        onChange={(e) => setAdmissionsUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="https://admissions.apexacademy.edu.in"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Shared on digital marketing, student inquiry kiosks, and social flyers.
                    </p>
                  </div>
                </div>

                {/* 3. Core Institutional Profile */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Institutional Identity &amp; Accreditation
                    </span>
                  </div>

                  {/* Display Name & Short Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={institutionName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Apex International Global Academy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Short Name / Code
                      </label>
                      <input
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Apex Global"
                      />
                    </div>
                  </div>

                  {/* Motto & Affiliation Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Institutional Motto
                      </label>
                      <input
                        type="text"
                        value={localMotto}
                        onChange={(e) => handleMottoChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Excellence in Knowledge & Character"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Accreditation / Affiliation Code
                      </label>
                      <input
                        type="text"
                        value={affiliationCode}
                        onChange={(e) => setAffiliationCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="CBSE/AFF/2026/8921"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Official Contacts & Location */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Official Contacts &amp; Location
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Registrar / Administrative Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          placeholder="admissions@apexacademy.edu.in"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                        Emergency Helpline Phone
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          placeholder="+91 80 2845 9000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                      Campus Physical Address
                    </label>
                    <textarea
                      rows={2}
                      value={campusAddress}
                      onChange={(e) => setCampusAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                      placeholder="Plot 42, Institutional Knowledge Park, Phase 1, Bangalore 560098"
                    />
                  </div>
                </div>

                {/* 5. Digital Seal & Official Stamp Attachment */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                      <Stamp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        Digital Seal &amp; Stamp Attachment
                      </span>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Automatically embeds verified institutional stamp and cryptographic QR verification on transcripts &amp; receipts.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSealAttached(!sealAttached);
                      triggerToast(
                        sealAttached
                          ? "Disabled digital seal watermark."
                          : "Enabled digital seal attachment on generated documents."
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      sealAttached
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {sealAttached ? "Attached" : "Disabled"}
                  </button>
                </div>

                {/* Live Synchronization Status Banner */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Live Institutional Identity Synchronization</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    All website attachments, custom logos, domain names, and contact parameters take effect immediately upon saving.
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
              onClick={handleSaveAndClose}
              style={{ backgroundColor: theme.primary }}
              className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-xl text-white font-bold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
            >
              <span>Save &amp; Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
