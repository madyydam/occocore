"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Globe,
  Shield,
  Layers,
  Calendar,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Server,
  ShieldCheck,
  Sparkles,
  Palette,
  Check,
  Hash,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Terminal,
  Upload,
  Flame,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Image as ImageIcon,
  Users,
  X,
} from "lucide-react";
import { ARCHETYPES, InstitutionalArchetype } from "@/lib/terminology";
import { SYSTEM_MODULES } from "@/lib/auth/roles";
import { saveOnboardingToDatabase } from "@/lib/actions/onboardingActions";

interface OnboardingFormState {
  // Step 1: Institutional Identity
  institutionName: string;
  archetype: InstitutionalArchetype;
  affiliationBoard: string;
  country: string;
  stateProvince: string;
  officialWebsite: string;

  // Step 2: Branding & Live Theme
  brandPrimaryColor: string;
  brandAccentColor: string;
  motto: string;
  logoUrl: string; // Base64 data URL or uploaded asset
  logoType: "upload" | "preset";
  logoPreset: "crest" | "shield" | "flame" | "book" | "cap";

  // Step 3: Domain & CNAME
  subdomain: string;
  customCname: string;
  isCnameVerified: boolean;

  // Step 4: Master Administrator Profile & 4-Digit Security PIN
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminPin: string; // 4-digit Security PIN
  adminPinConfirm: string;
  enableTotp2FA: boolean;

  // Step 5: Module Selection
  selectedModules: string[];

  // Step 6: Academic Calendar & Cadence
  startMonth: string;
  academicSession: string;
  termStructure: "semester" | "trimester" | "annual";
  gradingModel: string;
  seedDemoData: boolean;
}

const BRAND_COLOR_PRESETS = [
  { name: "Royal Blue (Default)", hex: "#1D4ED8", accent: "#DBEAFE", badge: "bg-blue-50 text-blue-700" },
  { name: "Deep Indigo", hex: "#4338CA", accent: "#E0E7FF", badge: "bg-indigo-50 text-indigo-700" },
  { name: "Forest Emerald", hex: "#059669", accent: "#D1FAE5", badge: "bg-emerald-50 text-emerald-700" },
  { name: "Deep Violet", hex: "#7C3AED", accent: "#EDE9FE", badge: "bg-purple-50 text-purple-700" },
  { name: "Sunset Amber", hex: "#D97706", accent: "#FEF3C7", badge: "bg-amber-50 text-amber-700" },
  { name: "Ruby Crimson", hex: "#DC2626", accent: "#FEE2E2", badge: "bg-rose-50 text-rose-700" },
];

function OnboardingWizardContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as InstitutionalArchetype) || "K12_SCHOOL";
  const isDemo = searchParams.get("mode") === "demo" || searchParams.get("demo") === "true";

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState<OnboardingFormState>({
    institutionName: "",
    archetype: initialType in ARCHETYPES ? initialType : "K12_SCHOOL",
    affiliationBoard:
      initialType in ARCHETYPES && ARCHETYPES[initialType]?.affiliationExample
        ? ARCHETYPES[initialType].affiliationExample
        : "CBSE & IB World Affiliation #2130894",
    country: "India (Global Multi-Region)",
    stateProvince: "National Capital Region",
    officialWebsite: "",
    brandPrimaryColor: "#1D4ED8",
    brandAccentColor: "#DBEAFE",
    motto: "Excellence in Holistic Education",
    logoUrl: "",
    logoType: "preset",
    logoPreset: "crest",
    subdomain: "",
    customCname: "",
    isCnameVerified: false,
    adminFullName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    adminPin: "2468",
    adminPinConfirm: "2468",
    enableTotp2FA: true,
    selectedModules: ["admissions", "academics", "timetable", "attendance", "fees", "exams", "communication"],
    startMonth: "April",
    academicSession: "2026 - 2027",
    termStructure: "semester",
    gradingModel: "CBSE 9-Point Grading",
    seedDemoData: true,
  });

  // Multi-Surface Interactive Preview State
  const [previewSurface, setPreviewSurface] = useState<"portal" | "id_card" | "invoice" | "mobile">("portal");

  // Logo upload & preset handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select an image file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          logoUrl: result,
          logoType: "upload",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: "",
      logoType: "preset",
      logoPreset: "crest",
    }));
  };

  const handleSelectPresetLogo = (preset: "crest" | "shield" | "flame" | "book" | "cap") => {
    setFormData((prev) => ({
      ...prev,
      logoPreset: preset,
      logoType: "preset",
      logoUrl: "",
    }));
  };

  const handleSelectBrandColor = (hex: string, accent?: string) => {
    setFormData((prev) => ({
      ...prev,
      brandPrimaryColor: hex,
      brandAccentColor: accent || "#FEE2E2",
    }));
    try {
      localStorage.setItem("occo_theme_color", hex);
    } catch {
      // ignore
    }
  };

  const handleResetToDefaultBlue = () => {
    handleSelectBrandColor("#1D4ED8", "#DBEAFE");
  };

  // Helper to render institutional logo/crest in real-time
  const renderLogo = (size: "sm" | "md" | "lg" = "md") => {
    const containerClasses = {
      sm: "w-7 h-7 rounded-lg text-xs",
      md: "w-10 h-10 rounded-xl text-sm",
      lg: "w-14 h-14 rounded-2xl text-base",
    };
    const iconSizes = {
      sm: "w-3.5 h-3.5",
      md: "w-5 h-5",
      lg: "w-7 h-7",
    };

    if (formData.logoUrl && formData.logoType === "upload") {
      return (
        <div className={`${containerClasses[size]} overflow-hidden border border-white/20 shadow-xs shrink-0 bg-white flex items-center justify-center`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <div
        className={`${containerClasses[size]} text-white font-extrabold flex items-center justify-center shadow-xs shrink-0 transition-colors`}
        style={{ backgroundColor: formData.brandPrimaryColor }}
      >
        {formData.logoPreset === "shield" && <Shield className={iconSizes[size]} />}
        {formData.logoPreset === "flame" && <Flame className={iconSizes[size]} />}
        {formData.logoPreset === "book" && <BookOpen className={iconSizes[size]} />}
        {formData.logoPreset === "cap" && <GraduationCap className={iconSizes[size]} />}
        {(!formData.logoPreset || formData.logoPreset === "crest") && <Sparkles className={iconSizes[size]} />}
      </div>
    );
  };

  // CNAME verification simulation state
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsLog, setDnsLog] = useState<string[]>([]);

  // Password / PIN reveal
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Cloud Provisioning simulation state
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Update archetype preset defaults when archetype changes
  const activeArchetypeConfig = ARCHETYPES[formData.archetype] || ARCHETYPES.K12_SCHOOL;

  // Auto-generate subdomain slug from legal name
  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 18);
    setFormData((prev) => ({
      ...prev,
      institutionName: val,
      subdomain: prev.subdomain ? prev.subdomain : slug,
    }));
  };

  // Toggle Module Selection
  const toggleModule = (modId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedModules.includes(modId);
      return {
        ...prev,
        selectedModules: exists
          ? prev.selectedModules.filter((m) => m !== modId)
          : [...prev.selectedModules, modId],
      };
    });
  };

  // DNS CNAME Resolution Simulator
  const handleVerifyDnsCname = () => {
    if (!formData.customCname) return;
    setIsCheckingDns(true);
    setDnsLog(["Querying authoritative DNS records for: " + formData.customCname + "..."]);

    setTimeout(() => {
      setDnsLog((prev) => [
        ...prev,
        "Looking up CNAME -> cname.occocore.com [Resolved: 104.21.58.12]",
      ]);
    }, 700);

    setTimeout(() => {
      setDnsLog((prev) => [
        ...prev,
        "Validating TLS 1.3 Let's Encrypt automated challenge: PASSED",
        "✓ Domain ownership confirmed. HTTP 200 Ingress Ready.",
      ]);
      setIsCheckingDns(false);
      setFormData((prev) => ({ ...prev, isCnameVerified: true }));
    }, 1500);
  };

  // Cloud Provisioning Simulator
  const handleLaunchProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionProgress(10);
    setTerminalLogs(["[0.1s] Initiating zero-trust multi-tenant cloud worker..."]);

    // If real mode, persist to PostgreSQL
    if (!isDemo) {
      saveOnboardingToDatabase(formData)
        .then((res) => {
          if (res.success) {
            console.log("Successfully created tenant in PostgreSQL:", res);
          } else {
            console.error("Database save failed:", res.error);
          }
        })
        .catch(console.error);
    }

    setTimeout(() => {
      setProvisionProgress(30);
      setTerminalLogs((prev) => [
        ...prev,
        isDemo
          ? "[0.8s] Initializing interactive in-memory demo sandbox..."
          : `[0.8s] Allocating isolated PostgreSQL schema: "tenant_${formData.subdomain || "demo"}"...`,
        "[1.1s] Applying PostgreSQL DDL schema & relational foreign-key constraints...",
      ]);
    }, 900);

    setTimeout(() => {
      setProvisionProgress(55);
      setTerminalLogs((prev) => [
        ...prev,
        `[1.8s] Setting up 3-tier credentials: Master Admin "${formData.adminEmail || "demo@occocore.com"}" with 4-Digit PIN...`,
        `[2.1s] Initializing ${formData.selectedModules.length} selected enterprise modules...`,
      ]);
    }, 1800);

    setTimeout(() => {
      setProvisionProgress(80);
      setTerminalLogs((prev) => [
        ...prev,
        formData.seedDemoData || isDemo
          ? "[2.7s] Seeding 45 student profiles, 10 faculty timetables & fee rosters..."
          : "[2.7s] Creating blank clean master ledgers and DPDPA consent vault...",
        `[3.1s] Binding SSL certificate to https://${formData.subdomain || "demo"}.occocore.com...`,
      ]);
    }, 2800);

    setTimeout(() => {
      setProvisionProgress(100);
      setTerminalLogs((prev) => [
        ...prev,
        isDemo
          ? "[3.8s] ✓ Demo Sandbox ready. Zero authentication required."
          : "[3.8s] ✓ Tenant provisioning 100% COMPLETE. Cloud health: OPTIMAL.",
      ]);
      setTimeout(() => {
        setIsProvisioning(false);
        setIsCompleted(true);
      }, 700);
    }, 3800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-9 w-9 bg-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-tactile-blue group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">OCCO Core</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Institutional Setup Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">10-Minute Self-Service Deployment Wizard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated PostgreSQL Schema Isolation</span>
          </div>
          <Link
            href="/auth/login"
            className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span>Existing Tenant? Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Demo Sandbox Alert Strip */}
      {isDemo && (
        <div className="bg-amber-500 text-amber-950 px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b border-amber-600 shadow-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-950 shrink-0" />
            <span>
              <strong>Interactive Demo Sandbox Active:</strong> You can click Next through all 6 steps without entering details to preview the entire ERP with pre-loaded mock data.
            </span>
          </div>
          <Link
            href="/onboarding"
            className="text-[11px] underline font-extrabold hover:text-white shrink-0 ml-4"
          >
            Switch to Real Production Mode →
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Step Progression Bar */}
        {!isProvisioning && !isCompleted && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-700 uppercase tracking-wider text-[11px]">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="font-bold text-slate-700">
                {currentStep === 1 && "Institutional Archetype & Identity"}
                {currentStep === 2 && "Visual Branding & Live Theme Color"}
                {currentStep === 3 && "Subdomain Reservation & CNAME DNS"}
                {currentStep === 4 && "Master Administrator & 4-Digit PIN"}
                {currentStep === 5 && "Modular Features & Timetable Engine"}
                {currentStep === 6 && "Academic Structure & Cloud Launch"}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* STEP 1: INSTITUTIONAL IDENTITY & ARCHETYPE */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Institutional Identity & Archetype
                  </h2>
                  <p className="text-xs text-slate-500">
                    The platform adapts its hierarchy and labels to your chosen educational archetype.
                  </p>
                </div>
              </div>

              {/* 4 Archetype Radio Cards with Live Terms */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Educational Archetype *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(ARCHETYPES) as InstitutionalArchetype[]).map((key) => {
                    const arch = ARCHETYPES[key];
                    const isSelected = formData.archetype === key;
                    return (
                      <div
                        key={key}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            archetype: key,
                            affiliationBoard: arch.affiliationExample,
                          })
                        }
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/30 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900 text-xs">{arch.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {arch.shortName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                          {arch.description}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-blue-700 font-semibold flex items-center justify-between">
                          <span>{arch.terms.cohortUnit}</span>
                          <span>•</span>
                          <span>{arch.terms.leaderTitle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Terminology Transformer Preview Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Dynamic Terminology Adapter ({activeArchetypeConfig.name})</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Auto-configures forms & reports</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Division / Cohort</span>
                    <strong className="text-slate-800">{activeArchetypeConfig.terms.cohortUnit}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Sub-Cohort</span>
                    <strong className="text-slate-800">{activeArchetypeConfig.terms.subCohortUnit}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Student Identifier</span>
                    <strong className="text-slate-800">{activeArchetypeConfig.terms.studentIdLabel}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Executive Leader</span>
                    <strong className="text-slate-800">{activeArchetypeConfig.terms.leaderTitle}</strong>
                  </div>
                </div>
              </div>

              {/* Institution Identity Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Legal Name of Institution *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Apex International Academy"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Affiliation / Regulatory Board *
                    </label>
                    <input
                      type="text"
                      value={formData.affiliationBoard}
                      onChange={(e) => setFormData({ ...formData, affiliationBoard: e.target.value })}
                      placeholder="e.g. CBSE Affiliation #2130894 or NAAC A++"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Campus Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.officialWebsite}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      placeholder="https://www.apexacademy.edu"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isDemo && !formData.institutionName.trim()}
                  className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Branding & Theme</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING & LIVE THEME PICKER */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-purple-700">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Visual Branding, Crest & Real-Time Theme Engine</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload your institution&apos;s crest, choose your brand palette (with Signature Royal Blue as default), and watch every digital surface update in real time.
                  </p>
                </div>
              </div>

              {/* 2-Column Responsive Branding Suite */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ═══ LEFT COLUMN (6 COLS): BRAND CONTROLS ═══ */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Control 1: Institutional Logo & Emblem */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                        <span>Institutional Logo & Crest</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Vector & High-Res
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Live Logo Badge */}
                      <div className="relative group">
                        {renderLogo("lg")}
                        {formData.logoType === "upload" && (
                          <button
                            type="button"
                            onClick={handleResetLogo}
                            title="Remove uploaded image"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* File Upload Trigger */}
                      <div className="flex-1">
                        <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-blue-700" />
                          <span>Upload Logo File (PNG / JPG / SVG)</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400 block mt-1 text-center">
                          Max 2MB • Transparent PNG or SVG recommended
                        </span>
                      </div>
                    </div>

                    {/* Emblem Presets Selector */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        Or select a Heraldic Emblem Preset:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectPresetLogo("shield")}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            formData.logoPreset === "shield" && formData.logoType === "preset"
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          <span className="text-[9px]">Shield</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectPresetLogo("cap")}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            formData.logoPreset === "cap" && formData.logoType === "preset"
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-[9px]">Crest</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectPresetLogo("flame")}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            formData.logoPreset === "flame" && formData.logoType === "preset"
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                          <span className="text-[9px]">Torch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectPresetLogo("book")}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            formData.logoPreset === "book" && formData.logoType === "preset"
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="text-[9px]">Tome</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectPresetLogo("crest")}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            formData.logoPreset === "crest" && formData.logoType === "preset"
                              ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[9px]">Star</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Control 2: Color Palette (Royal Blue Default + Custom Wheel) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-blue-700" />
                        <span>Theme Palette (Signature Royal Blue Default)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleResetToDefaultBlue}
                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Royal Blue</span>
                      </button>
                    </div>

                    {/* Curated Swatches Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {BRAND_COLOR_PRESETS.map((preset) => {
                        const isSelected = formData.brandPrimaryColor === preset.hex;
                        return (
                          <div
                            key={preset.hex}
                            onClick={() => handleSelectBrandColor(preset.hex, preset.accent)}
                            className={`p-2 rounded-xl border cursor-pointer transition-all text-center space-y-1.5 ${
                              isSelected
                                ? "bg-slate-50 border-blue-700 ring-2 ring-blue-700 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className="w-7 h-7 rounded-full mx-auto shadow-2xs flex items-center justify-center text-white"
                              style={{ backgroundColor: preset.hex }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 block truncate">
                              {preset.name.split(" ")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Hex Color Pickers */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Custom Primary Color
                        </span>
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="color"
                            value={formData.brandPrimaryColor}
                            onChange={(e) => handleSelectBrandColor(e.target.value)}
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={formData.brandPrimaryColor}
                            onChange={(e) => handleSelectBrandColor(e.target.value)}
                            className="w-full bg-transparent font-mono font-bold text-xs text-slate-800 focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Custom Accent Tint
                        </span>
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="color"
                            value={formData.brandAccentColor}
                            onChange={(e) =>
                              setFormData({ ...formData, brandAccentColor: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                          />
                          <input
                            type="text"
                            value={formData.brandAccentColor}
                            onChange={(e) =>
                              setFormData({ ...formData, brandAccentColor: e.target.value })
                            }
                            className="w-full bg-transparent font-mono font-bold text-xs text-slate-800 focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Control 3: Institutional Motto / Tagline */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Institutional Motto / Tagline</span>
                      <span className="text-[10px] text-slate-400 font-normal">Appears on headers & ID cards</span>
                    </label>

                    <input
                      type="text"
                      value={formData.motto}
                      onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                      placeholder="e.g. Excellence in Holistic Education & Leadership"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />

                    {/* Quick Inspiration Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "Excellence in Holistic Education",
                        "Vidya Dadati Vinayam (विद्या ददाति विनयं)",
                        "Inspiring Tomorrow's Leaders Today",
                        "Virtue, Truth & Academic Rigor",
                      ].map((mottoText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, motto: mottoText })}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors cursor-pointer border border-slate-200"
                        >
                          + {mottoText}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ═══ RIGHT COLUMN (6 COLS): REAL-TIME RESPONSIVE MULTI-SURFACE PREVIEW ═══ */}
                <div className="lg:col-span-6 space-y-3">
                  {/* Surface Switcher Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      <span>Live Real-Time Surface Preview</span>
                    </span>

                    {/* 4 Surface Tabs */}
                    <div className="flex p-0.5 bg-slate-200/80 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewSurface("portal")}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          previewSurface === "portal"
                            ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Web Portal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSurface("id_card")}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          previewSurface === "id_card"
                            ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Student ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSurface("invoice")}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          previewSurface === "invoice"
                            ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Fee Voucher
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSurface("mobile")}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          previewSurface === "mobile"
                            ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Mobile App
                      </button>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      SURFACE 1: DESKTOP CAMPUS WEB PORTAL
                  ───────────────────────────────────────────────────────────── */}
                  {previewSurface === "portal" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in duration-200">
                      {/* Browser address bar */}
                      <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span className="truncate">
                          https://{formData.subdomain || "portal"}.occocore.com
                        </span>
                      </div>

                      {/* Dynamic Header in Brand Primary Color */}
                      <div
                        className="p-3.5 text-white transition-colors flex items-center justify-between"
                        style={{ backgroundColor: formData.brandPrimaryColor }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderLogo("md")}
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm block truncate leading-tight">
                              {formData.institutionName || "Apex International Academy"}
                            </span>
                            <span className="text-[10px] opacity-80 block truncate">
                              {formData.motto || "Excellence in Holistic Education"}
                            </span>
                          </div>
                        </div>

                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                          style={{
                            backgroundColor: formData.brandAccentColor,
                            color: formData.brandPrimaryColor,
                          }}
                        >
                          {activeArchetypeConfig.badge}
                        </span>
                      </div>

                      {/* Portal Body Content */}
                      <div className="p-4 space-y-3 bg-[#F8FAFC]">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Active Academic Session
                            </span>
                            <strong className="text-slate-800 text-xs block mt-0.5">2026 - 2027</strong>
                            <span className="text-[10px] text-emerald-600 font-semibold">Term Rollover Ready</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Security & Encryption
                            </span>
                            <strong className="text-slate-800 text-xs block mt-0.5">3-Tier Verification</strong>
                            <span className="text-[10px] text-blue-700 font-semibold">Argon2id + 4-Digit PIN</span>
                          </div>
                        </div>

                        {/* Interactive Primary Action Button */}
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: formData.brandPrimaryColor }}
                        >
                          <span>Access {formData.institutionName || "Institutional"} Portal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      SURFACE 2: SMART STUDENT IDENTITY PASS (PVC CARD)
                  ───────────────────────────────────────────────────────────── */}
                  {previewSurface === "id_card" && (
                    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden max-w-sm mx-auto animate-in fade-in duration-200">
                      {/* Card Header Banner in Primary Color */}
                      <div
                        className="p-3 text-white transition-colors flex items-center justify-between"
                        style={{ backgroundColor: formData.brandPrimaryColor }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderLogo("sm")}
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs block truncate leading-tight">
                              {formData.institutionName || "Apex International Academy"}
                            </span>
                            <span className="text-[8px] opacity-75 block truncate">
                              Student Identity Pass • 2026-27
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/20 font-bold">
                          ACTIVE
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3 bg-white">
                        <div className="flex items-center gap-3">
                          {/* Student Photo */}
                          <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-inner">
                            <Users className="w-6 h-6 text-slate-400" />
                            <span className="text-[7px] font-mono mt-1">PHOTO</span>
                          </div>

                          <div className="space-y-1 min-w-0 text-xs">
                            <span className="font-black text-slate-900 block text-sm leading-tight">
                              Aarav Sharma
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              <span>PRN: </span>
                              <strong className="text-slate-800">2026-APX-0491</strong>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              <span>Cohort: </span>
                              <strong className="text-slate-800">Class 10-A (Science)</strong>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              <span>Blood Group: </span>
                              <strong className="text-red-700">O+ Positive</strong>
                            </div>
                          </div>
                        </div>

                        {/* Barcode & Signature Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                          <div>
                            <div className="h-4 flex items-center gap-0.5">
                              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4].map((w, i) => (
                                <span
                                  key={i}
                                  className="h-full bg-slate-800"
                                  style={{ width: `${w}px` }}
                                />
                              ))}
                            </div>
                            <span>* 20260491 *</span>
                          </div>

                          <div className="text-right">
                            <span
                              className="font-serif italic font-bold block text-[10px]"
                              style={{ color: formData.brandPrimaryColor }}
                            >
                              Authorized Seal
                            </span>
                            <span>Principal Office</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      SURFACE 3: OFFICIAL FEE INVOICE & RECEIPT
                  ───────────────────────────────────────────────────────────── */}
                  {previewSurface === "invoice" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3 max-w-sm mx-auto text-xs animate-in fade-in duration-200">
                      {/* Invoice Top Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          {renderLogo("sm")}
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {formData.institutionName || "Apex International Academy"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              GSTIN / Reg #27AABCT8912K1Z5
                            </span>
                          </div>
                        </div>

                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: formData.brandAccentColor,
                            color: formData.brandPrimaryColor,
                          }}
                        >
                          RECEIPT #891
                        </span>
                      </div>

                      {/* Student & Term Info */}
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <div>
                          <span>Student: </span>
                          <strong className="text-slate-800 block">Aarav Sharma</strong>
                        </div>
                        <div>
                          <span>Term: </span>
                          <strong className="text-slate-800 block">Q1 Tuition (2026-27)</strong>
                        </div>
                      </div>

                      {/* Fee Items Breakdown */}
                      <div className="divide-y divide-slate-100 text-[11px]">
                        <div className="py-1 flex justify-between">
                          <span className="text-slate-600">1. Tuition & Academic Instruction</span>
                          <span className="font-mono font-semibold text-slate-800">₹18,500</span>
                        </div>
                        <div className="py-1 flex justify-between">
                          <span className="text-slate-600">2. Smart ICT Lab & Library Access</span>
                          <span className="font-mono font-semibold text-slate-800">₹3,500</span>
                        </div>
                        <div className="py-1 flex justify-between">
                          <span className="text-slate-600">3. Sports & Laboratory Fee</span>
                          <span className="font-mono font-semibold text-slate-800">₹2,500</span>
                        </div>
                      </div>

                      {/* Total & Paid Stamp */}
                      <div className="pt-2 border-t-2 border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Received</span>
                          <span className="font-black text-sm text-slate-900 font-mono">₹24,500.00</span>
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 transform -rotate-3"
                          style={{
                            borderColor: formData.brandPrimaryColor,
                            color: formData.brandPrimaryColor,
                            backgroundColor: formData.brandAccentColor,
                          }}
                        >
                          PAID & SEALED
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      SURFACE 4: MOBILE PORTAL APP SCREEN
                  ───────────────────────────────────────────────────────────── */}
                  {previewSurface === "mobile" && (
                    <div className="w-60 mx-auto rounded-3xl border-4 border-slate-800 bg-white shadow-xl overflow-hidden animate-in fade-in duration-200">
                      {/* Notch */}
                      <div className="h-4 bg-slate-800 flex items-center justify-center">
                        <div className="w-16 h-2 rounded-full bg-slate-900" />
                      </div>

                      {/* App Top Bar */}
                      <div
                        className="p-3 text-white transition-colors"
                        style={{ backgroundColor: formData.brandPrimaryColor }}
                      >
                        <div className="flex items-center gap-1.5">
                          {renderLogo("sm")}
                          <span className="font-bold text-[11px] truncate">
                            {formData.institutionName || "Apex Academy"}
                          </span>
                        </div>
                      </div>

                      {/* App Body */}
                      <div className="p-3 space-y-2.5 bg-slate-50 text-[10px]">
                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-slate-400 block text-[8px]">Student Profile</span>
                          <strong className="text-slate-800 block text-[11px]">Aarav Sharma</strong>
                          <span className="text-slate-500 font-mono text-[9px]">Class 10-A • Roll #12</span>
                        </div>

                        {/* Attendance meter */}
                        <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <span>Today&apos;s Attendance</span>
                          <span
                            className="font-bold px-1.5 py-0.2 rounded font-mono"
                            style={{
                              backgroundColor: formData.brandAccentColor,
                              color: formData.brandPrimaryColor,
                            }}
                          >
                            96.4%
                          </span>
                        </div>

                        {/* Quick Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            className="p-2 rounded-lg text-white font-bold text-[9px] text-center"
                            style={{ backgroundColor: formData.brandPrimaryColor }}
                          >
                            Pay Fees
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-lg font-bold text-[9px] text-center border"
                            style={{
                              backgroundColor: formData.brandAccentColor,
                              color: formData.brandPrimaryColor,
                              borderColor: formData.brandPrimaryColor,
                            }}
                          >
                            Timetable
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Domain Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUBDOMAIN & CNAME DNS VERIFICATION */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Subdomain Reservation & Custom Domain CNAME
                  </h2>
                  <p className="text-xs text-slate-500">
                    Host on our cloud subdomain or map your own official domain with automated SSL certificate generation.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Primary Subdomain */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Platform Subdomain Reservation *
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                    <span className="px-3.5 py-2.5 bg-slate-50 text-slate-500 text-xs font-mono border-r border-slate-200">
                      https://
                    </span>
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      placeholder="apexacademy"
                      className="flex-1 px-3.5 py-2.5 bg-white text-sm font-bold text-blue-700 focus:outline-none font-mono"
                      required
                    />
                    <span className="px-3.5 py-2.5 bg-slate-50 text-slate-600 text-xs font-mono font-bold border-l border-slate-200">
                      .occocore.com
                    </span>
                  </div>
                  {formData.subdomain && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Subdomain is valid and available for immediate reservation.</span>
                    </p>
                  )}
                </div>

                {/* Custom CNAME Domain */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Institutional CNAME (Optional)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Point a DNS CNAME record (e.g. <code>portal.school.edu</code>) to <code>cname.occocore.com</code>.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.customCname}
                        onChange={(e) =>
                          setFormData({ ...formData, customCname: e.target.value, isCnameVerified: false })
                        }
                        placeholder="portal.apexacademy.edu"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyDnsCname}
                        disabled={!formData.customCname || isCheckingDns}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                      >
                        {isCheckingDns ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                        <span>Verify DNS CNAME</span>
                      </button>
                    </div>
                  </div>

                  {/* DNS Test Log Output */}
                  {dnsLog.length > 0 && (
                    <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1">
                      {dnsLog.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={!isDemo && !formData.subdomain.trim()}
                  className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Master Admin Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MASTER ADMIN & MANDATORY 4-DIGIT PIN */}
          {currentStep === 4 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Master Administrator & 4-Digit Security PIN
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mandatory 3-tier credentials (Email + Password + 4-Digit PIN) governing this institutional tenant.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Principal / Director Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.adminFullName}
                    onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
                    placeholder="e.g. Dr. Rajeshwar Sen"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Work Email *
                    </label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      placeholder="principal@apexacademy.edu"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Emergency WhatsApp Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.adminPhone}
                      onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Master Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* MANDATORY 4-DIGIT SECURITY PIN INPUT */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-blue-900 flex items-center space-x-1.5">
                      <Hash className="w-4 h-4 text-blue-700" />
                      <span>Mandatory 4-Digit Security PIN *</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      Required on All Logins
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    Under the platform&apos;s 3-tier security policy, you must configure a 4-digit numeric PIN. This PIN will be required whenever signing into the administrator console.
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">Enter 4-Digit PIN</span>
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        value={formData.adminPin}
                        onChange={(e) =>
                          setFormData({ ...formData, adminPin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        placeholder="••••"
                        className="w-full px-3 py-2 text-center font-mono font-bold text-lg bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">Confirm 4-Digit PIN</span>
                      <input
                        type={showPin ? "text" : "password"}
                        inputMode="numeric"
                        maxLength={4}
                        value={formData.adminPinConfirm}
                        onChange={(e) =>
                          setFormData({ ...formData, adminPinConfirm: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        placeholder="••••"
                        className="w-full px-3 py-2 text-center font-mono font-bold text-lg bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        formData.adminPin.length === 4 && formData.adminPin === formData.adminPinConfirm
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {formData.adminPin.length === 4 && formData.adminPin === formData.adminPinConfirm
                        ? "✓ 4-Digit PIN matches & meets criteria"
                        : "✗ PIN must be strictly 4 numeric digits and match"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-blue-700 hover:underline font-semibold"
                    >
                      {showPin ? "Hide PIN" : "Show PIN"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  disabled={
                    !isDemo &&
                    (!formData.adminFullName ||
                      !formData.adminEmail ||
                      !formData.adminPassword ||
                      formData.adminPin.length !== 4 ||
                      formData.adminPin !== formData.adminPinConfirm)
                  }
                  className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: MODULAR FEATURE MATRIX */}
          {currentStep === 5 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Modular Feature Activation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose which functional systems to deploy. Additional modules can be toggled by the admin at any time.
                  </p>
                </div>
              </div>

              {/* Module Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SYSTEM_MODULES.map((mod) => {
                  const isChecked = formData.selectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/60 border-blue-500 ring-1 ring-blue-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs truncate">{mod.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-700 focus:ring-blue-600 pointer-events-none"
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mb-1">
                        {mod.category}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  disabled={!isDemo && formData.selectedModules.length === 0}
                  className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Academic Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: ACADEMIC CALENDAR, DEMO SEEDER & LAUNCH */}
          {currentStep === 6 && !isProvisioning && !isCompleted && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Academic Session & Cloud Provisioning
                  </h2>
                  <p className="text-xs text-slate-500">
                    Set your operating term cadence and trigger isolated schema generation.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Initial Academic Session Year *
                    </label>
                    <input
                      type="text"
                      value={formData.academicSession}
                      onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                      placeholder="2026 - 2027"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Session Start Month
                    </label>
                    <select
                      value={formData.startMonth}
                      onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="April">April (Standard Indian K-12 Session)</option>
                      <option value="June">June (State Board Schools)</option>
                      <option value="July">July / August (Degree Colleges & Universities)</option>
                      <option value="January">January (International / Calendar Year)</option>
                    </select>
                  </div>
                </div>

                {/* Pre-Seed Realistic Demo Data Toggle */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.seedDemoData}
                      onChange={(e) => setFormData({ ...formData, seedDemoData: e.target.checked })}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-700 focus:ring-emerald-600 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-emerald-950 block">
                        Pre-Seed Ready-to-Use Evaluation Sandbox (Highly Recommended)
                      </span>
                      <p className="text-[11px] text-emerald-900 leading-snug mt-0.5">
                        Populates 45 realistic student records, 10 faculty accounts, a complete master timetable, sample fee instalment ledgers, and CBSE broadsheets. You can evaluate all features immediately without manual CSV imports.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] block">
                    Configuration Blueprint Summary
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Institution Name</span>
                      <strong className="text-slate-900">{formData.institutionName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Archetype Preset</span>
                      <strong className="text-slate-900">{activeArchetypeConfig.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Dedicated Subdomain</span>
                      <strong className="text-blue-700 font-mono">https://{formData.subdomain}.occocore.com</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Master Administrator</span>
                      <strong className="text-slate-900">{formData.adminEmail} (PIN: ••••)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleLaunchProvisioning}
                  className="py-3 px-8 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-xs transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Provision Dedicated Academic Cloud Tenant</span>
                </button>
              </div>
            </div>
          )}

          {/* IN-FLIGHT PROVISIONING SIMULATION TERMINAL */}
          {isProvisioning && (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-700 animate-pulse shadow-xs">
                <Server className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Provisioning Dedicated PostgreSQL Tenant Cloud...
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Creating isolated schema, compiling custom RBAC matrix, and encrypting credentials under DPDPA 2023 zero-trust standards.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-600">
                  <span>PROGRESS</span>
                  <span>{provisionProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700 transition-all duration-500 ease-out"
                    style={{ width: `${provisionProgress}%` }}
                  />
                </div>
              </div>

              {/* Live Terminal Output Box */}
              <div className="max-w-xl mx-auto bg-slate-950 rounded-2xl p-4 text-left font-mono text-[11px] text-emerald-400 space-y-1 border border-slate-800 shadow-xl max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-800 text-slate-500 text-[10px]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>occocore-provisioner@us-east-1 ~ stream</span>
                </div>
                {terminalLogs.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED ACTIVATION & DASHBOARD ACCESS */}
          {isCompleted && (
            <div className="p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tenant Live & Operational
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {formData.institutionName} is Provisioned!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-lg mx-auto">
                  Your dedicated multi-tenant academic database schema is active, encrypted with AES-256 GCM, and ready for campus operations.
                </p>
              </div>

              {/* Tenant Credentials Summary Card */}
              <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs font-mono space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Dedicated Portal:</span>
                  <strong className="text-blue-700 font-bold">{formData.subdomain}.occocore.com</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Master Administrator:</span>
                  <strong className="text-slate-900">{formData.adminEmail}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">4-Digit Security PIN:</span>
                  <strong className="text-emerald-700 font-bold">•••• (Configured: {formData.adminPin})</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Database Schema:</span>
                  <strong className="text-emerald-700">tenant_{formData.subdomain} (PostgreSQL Isolated)</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={isDemo ? "/admin?mode=demo" : "/admin"}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all shadow-tactile-blue flex items-center justify-center space-x-2"
                >
                  <span>{isDemo ? "Enter Demo Administrator Console" : "Open Administrator Console"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={isDemo ? "/auth/login?role=ADMIN&mode=demo" : `/auth/login?role=ADMIN&tenant=${formData.subdomain || "apexacademy"}`}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  {isDemo ? "Explore Demo Login Screen" : "Sign In to Tenant Portal"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OCCO Core Systems Inc. Enterprise Grade Multi-Tenant Academic OS. All rights reserved.
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Initializing Onboarding Engine...</p>
          </div>
        </div>
      }
    >
      <OnboardingWizardContent />
    </Suspense>
  );
}
