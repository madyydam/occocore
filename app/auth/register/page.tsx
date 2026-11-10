"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Shield,
  Layers,
  Calendar,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Server,
  Database,
  ShieldCheck,
  GraduationCap,
  Users,
  CreditCard,
  Bus,
  Home,
  BookOpen,
  Info,
} from "lucide-react";

interface OnboardingFormState {
  // Step 1: Institutional Profile
  institutionName: string;
  archetype: "K12_SCHOOL" | "COLLEGE" | "UNIVERSITY" | "POLYTECHNIC";
  affiliationBoard: string;
  country: string;
  officialWebsite: string;

  // Step 2: Tenant Domain
  subdomain: string;
  customCname: string;
  dataResidency: string;

  // Step 3: Master Admin Profile
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  enableTotp2FA: boolean;

  // Step 4: Modules
  selectedModules: string[];

  // Step 5: Academic Calendar
  academicYear: string;
  termStructure: "semester" | "trimester" | "annual";
  seedDemoData: boolean;
}

const AVAILABLE_MODULES = [
  {
    id: "academics",
    name: "Academics & Timetable",
    desc: "Curriculum mapping, section workloads, and conflict-free timetable engine.",
    icon: GraduationCap,
    includedByDefault: true,
  },
  {
    id: "fees",
    name: "Fee Engine & Payments",
    desc: "Instalment schedules, POS cash counter, fine waivers, and payment gateway.",
    icon: CreditCard,
    includedByDefault: true,
  },
  {
    id: "attendance",
    name: "Attendance & RFID",
    desc: "Classroom roll call, biometric sync, and instant parent WhatsApp dispatch.",
    icon: Users,
    includedByDefault: true,
  },
  {
    id: "exams",
    name: "Exams & Marksheets",
    desc: "CBSE / University grading rules, report card PDF generation, and GPA rank lists.",
    icon: BookOpen,
    includedByDefault: true,
  },
  {
    id: "transport",
    name: "Transport & GPS Fleet",
    desc: "Bus routes, stop geofencing, speed alerts, and parent live tracking.",
    icon: Bus,
    includedByDefault: false,
  },
  {
    id: "hostel",
    name: "Hostel & Bed Allocation",
    desc: "Room allocation, digital gate passes, mess catering, and curfew roll call.",
    icon: Home,
    includedByDefault: false,
  },
];

export default function RegisterInstitutePage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState<OnboardingFormState>({
    institutionName: "",
    archetype: "K12_SCHOOL",
    affiliationBoard: "CBSE & IB World",
    country: "India (Global Multi-Region)",
    officialWebsite: "",
    subdomain: "",
    customCname: "",
    dataResidency: "ap-south-1 (Mumbai / AWS Dedicated)",
    adminFullName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    enableTotp2FA: true,
    selectedModules: ["academics", "fees", "attendance", "exams"],
    academicYear: "2026 - 2027",
    termStructure: "semester",
    seedDemoData: true,
  });

  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [provisionProgress, setProvisionProgress] = useState<number>(0);
  const [provisionStepText, setProvisionStepText] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16);
    setFormData((prev) => ({
      ...prev,
      institutionName: val,
      subdomain: prev.subdomain ? prev.subdomain : slug,
    }));
  };

  const toggleModule = (modId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedModules.includes(modId);
      if (exists) {
        return {
          ...prev,
          selectedModules: prev.selectedModules.filter((m) => m !== modId),
        };
      } else {
        return {
          ...prev,
          selectedModules: [...prev.selectedModules, modId],
        };
      }
    });
  };

  // Launch Provisioning Simulation
  const handleProvisionTenant = () => {
    setIsProvisioning(true);
    setProvisionProgress(15);
    setProvisionStepText("Allocating tenant schema in multi-tenant PostgreSQL cluster...");

    setTimeout(() => {
      setProvisionProgress(45);
      setProvisionStepText("Compiling custom institutional RBAC & permission matrices...");
    }, 1200);

    setTimeout(() => {
      setProvisionProgress(75);
      setProvisionStepText(
        formData.seedDemoData
          ? "Seeding 45 student profiles, faculty timetables & fee rosters..."
          : "Configuring blank master tables & audit vault..."
      );
    }, 2400);

    setTimeout(() => {
      setProvisionProgress(100);
      setProvisionStepText("Generating cryptographic 2FA seed & dispatching activation credentials.");
      setTimeout(() => {
        setIsProvisioning(false);
        setIsCompleted(true);
      }, 800);
    }, 3600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Core</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Institutional Onboarding
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated Tenant Isolation • SOC 2 Ready</span>
          </div>
          <Link
            href="/auth/login"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Existing Tenant? Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl">
          {/* Progress Step Indicator */}
          {!isCompleted && !isProvisioning && (
            <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentStep === 1 && "Institutional Identity"}
                  {currentStep === 2 && "Tenant Domain & Subdomain"}
                  {currentStep === 3 && "Master Admin Account"}
                  {currentStep === 4 && "ERP Module Selection"}
                  {currentStep === 5 && "Academic Calendar Setup"}
                  {currentStep === 6 && "Review & Cloud Provisioning"}
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

          {/* Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Step 1: Institutional Profile */}
            {currentStep === 1 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Institutional Identity & Profile
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure your official school, college, or university registration data.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Legal Institution Name *
                    </label>
                    <input
                      type="text"
                      value={formData.institutionName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Apex International Academy"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Institutional Archetype *
                      </label>
                      <select
                        value={formData.archetype}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            archetype: e.target.value as OnboardingFormState["archetype"],
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      >
                        <option value="K12_SCHOOL">K-12 School (CBSE / ICSE / IB)</option>
                        <option value="COLLEGE">Autonomous Degree College</option>
                        <option value="UNIVERSITY">Multi-Disciplinary University</option>
                        <option value="POLYTECHNIC">Polytechnic / Technical Institute</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Affiliation / Accreditations
                      </label>
                      <input
                        type="text"
                        value={formData.affiliationBoard}
                        onChange={(e) =>
                          setFormData({ ...formData, affiliationBoard: e.target.value })
                        }
                        placeholder="e.g. CBSE Affiliation #12345 / NAAC A+"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Country & Sovereign Cloud
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Campus Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.officialWebsite}
                        onChange={(e) =>
                          setFormData({ ...formData, officialWebsite: e.target.value })
                        }
                        placeholder="https://www.apexacademy.edu"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.institutionName}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Proceed to Domain Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Tenant Domain & Subdomain */}
            {currentStep === 2 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Tenant Domain & White-Label Isolation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Reserve your exclusive institutional ERP URL or bind a custom CNAME.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Core Platform Subdomain *
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600">
                      <span className="px-3 py-2.5 bg-slate-50 text-slate-500 text-xs font-mono border-r border-slate-200">
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
                        className="flex-1 px-3.5 py-2.5 bg-white text-sm font-semibold text-blue-700 focus:outline-none"
                        required
                      />
                      <span className="px-3 py-2.5 bg-slate-50 text-slate-500 text-xs font-mono border-l border-slate-200">
                        .coreerp.in
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Staff, students, and parents will log in at this address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Custom Institutional CNAME (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.customCname}
                      onChange={(e) =>
                        setFormData({ ...formData, customCname: e.target.value })
                      }
                      placeholder="e.g. portal.apexacademy.edu"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Can be verified via DNS TXT record post-activation.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
                    <Server className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Isolated Database Schema Architecture</p>
                      <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                        Every tenant is provisioned with an isolated PostgreSQL database schema, preventing accidental cross-tenant data leakages. Complies with DPDPA 2023, FERPA, and ISO/IEC 27001 data isolation controls.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.subdomain}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Proceed to Admin Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Master Admin Profile */}
            {currentStep === 3 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Master Administrator Credentials
                    </h2>
                    <p className="text-xs text-slate-500">
                      Create the primary administrative authority profile for this tenant.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Principal / Director Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.adminFullName}
                      onChange={(e) =>
                        setFormData({ ...formData, adminFullName: e.target.value })
                      }
                      placeholder="e.g. Dr. Rajeshwar Sen"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, adminEmail: e.target.value })
                        }
                        placeholder="principal@apexacademy.edu"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        WhatsApp Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.adminPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, adminPhone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Master Password *
                    </label>
                    <input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, adminPassword: e.target.value })
                      }
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableTotp2FA}
                        onChange={(e) =>
                          setFormData({ ...formData, enableTotp2FA: e.target.checked })
                        }
                        className="rounded border-slate-300 text-blue-700 focus:ring-blue-600 shrink-0"
                      />
                      <span className="text-xs text-slate-700">
                        <strong>Enforce Mandatory 2FA TOTP (Recommended):</strong> Require Google Authenticator / Microsoft Authenticator app for all administrative operations.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    disabled={!formData.adminFullName || !formData.adminEmail || !formData.adminPassword}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Proceed to Modules</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Module Activation Matrix */}
            {currentStep === 4 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Modular Feature Activation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Toggle the operational modules you wish to deploy for your institution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = formData.selectedModules.includes(mod.id);
                    const IconComponent = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50/60 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900 text-sm">
                                {mod.name}
                              </h3>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-blue-700 focus:ring-blue-600 pointer-events-none"
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-snug">
                              {mod.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    disabled={formData.selectedModules.length === 0}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Proceed to Academic Year</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Academic Calendar & Term Structure */}
            {currentStep === 5 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Academic Session & Term Cadence
                    </h2>
                    <p className="text-xs text-slate-500">
                      Establish your initial operational academic cycle and grading cadence.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Current Academic Session *
                      </label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) =>
                          setFormData({ ...formData, academicYear: e.target.value })
                        }
                        placeholder="2026 - 2027"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Term / Evaluation Cadence
                      </label>
                      <select
                        value={formData.termStructure}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            termStructure: e.target.value as OnboardingFormState["termStructure"],
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      >
                        <option value="semester">Semester System (Term 1 & Term 2)</option>
                        <option value="trimester">Trimester System (3 Terms / Annual)</option>
                        <option value="annual">Single Annual Examination Model</option>
                      </select>
                    </div>
                  </div>

                  {/* Seed Demo Dataset Option */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.seedDemoData}
                        onChange={(e) =>
                          setFormData({ ...formData, seedDemoData: e.target.checked })
                        }
                        className="mt-0.5 rounded border-emerald-400 text-emerald-700 focus:ring-emerald-600 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-emerald-900">
                          Pre-Seed Ready-to-Use Demo Dataset (Recommended)
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                          Populates 45 realistic student profiles, 10 faculty accounts, 1 functional timetable, and fee rosters. Perfect for immediate sandbox testing without manual data entry.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Review & Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Review & Cloud Provisioning */}
            {currentStep === 6 && !isProvisioning && !isCompleted && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-700">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Review & Provision Academic Tenant
                    </h2>
                    <p className="text-xs text-slate-500">
                      Verify your institutional configuration before triggering automatic cloud initialization.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Institution Name:</span>
                      <span className="font-semibold text-slate-900">{formData.institutionName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Archetype & Board:</span>
                      <span className="font-semibold text-slate-900">
                        {formData.archetype} ({formData.affiliationBoard})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Portal URL:</span>
                      <span className="font-mono font-bold text-blue-700">
                        https://{formData.subdomain}.coreerp.in
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Master Admin:</span>
                      <span className="font-semibold text-slate-900">
                        {formData.adminFullName} ({formData.adminEmail})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Active Modules:</span>
                      <span className="font-semibold text-slate-900">
                        {formData.selectedModules.length} Enterprise Modules Selected
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Initial Academic Year:</span>
                      <span className="font-semibold text-slate-900">{formData.academicYear}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-800">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Clicking <strong>&ldquo;Provision Academic Cloud Tenant&rdquo;</strong> will create isolated Postgres schemas, apply database migrations, generate RBAC seed keys, and activate your portal.
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleProvisionTenant}
                    className="py-3 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Provision Academic Cloud Tenant</span>
                  </button>
                </div>
              </div>
            )}

            {/* In-Flight Provisioning State */}
            {isProvisioning && (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-700 animate-pulse">
                  <Server className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Provisioning Isolated Tenant Cloud...
                </h2>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
                  {provisionStepText}
                </p>

                <div className="w-full max-w-md mx-auto mt-6">
                  <div className="flex justify-between text-xs font-mono font-medium text-slate-600 mb-1">
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
              </div>
            )}

            {/* Completed Activation State */}
            {isCompleted && (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {formData.institutionName} is Live!
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                  Your dedicated multi-tenant academic database schema has been provisioned, encrypted with AES-256 GCM, and configured with all selected enterprise modules.
                </p>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Tenant Subdomain:</span>
                    <strong className="text-blue-700 font-bold">{formData.subdomain}.coreerp.in</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal Account:</span>
                    <strong>{formData.adminEmail}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Isolation:</span>
                    <strong className="text-emerald-700 font-bold">PostgreSQL Schema ({formData.subdomain})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Demo Data Status:</span>
                    <strong>{formData.seedDemoData ? "45 Profiles Seeded" : "Empty Masters Ready"}</strong>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/auth/login?role=ADMIN&tenant=${formData.subdomain}`}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Zero-Trust Enterprise Multi-Tenancy</span>
              </div>
              <span>SOC 2 Type II • ISO 27001 • DPDPA 2023</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Core Systems Inc. Enterprise Grade Multi-Tenant Academic OS.
      </footer>
    </div>
  );
}
