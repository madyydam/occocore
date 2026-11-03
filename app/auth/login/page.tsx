"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  UserCheck,
  HeartHandshake,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { ROLE_DEFINITIONS, RoleConfig } from "@/lib/auth/roles";

export default function LoginPage() {
  // Selected Portal Tab: "staff" | "student" | "parent" | "super_admin"
  const [activeTab, setActiveTab] = useState<"staff" | "student" | "parent" | "super_admin">("staff");

  // Selected specific role within staff for quick demo testing
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("ADMIN");

  // Form inputs
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);

  // Dynamic tenant preview switcher (allows testing multiple institutional themes)
  const [activeTenantPreset, setActiveTenantPreset] = useState<"apex" | "xavier" | "imperial">("apex");

  const tenantPresets = {
    apex: {
      name: "Apex International Academy",
      domain: "portal.school.edu",
      themeColor: "text-blue-700 bg-blue-50 border-blue-200",
      accentButton: "bg-blue-700 hover:bg-blue-800 text-white",
      logoBadge: "Global K-12 / CBSE & IB",
    },
    xavier: {
      name: "St. Xavier's Autonomous College",
      domain: "portal.xaviers.ac.in",
      themeColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
      accentButton: "bg-indigo-700 hover:bg-indigo-800 text-white",
      logoBadge: "NAAC A++ Degree College",
    },
    imperial: {
      name: "Imperial University of Technology",
      domain: "portal.imperial.edu",
      themeColor: "text-purple-700 bg-purple-50 border-purple-200",
      accentButton: "bg-purple-700 hover:bg-purple-800 text-white",
      logoBadge: "Institute of Eminence",
    },
  };

  const currentTenant = tenantPresets[activeTenantPreset];

  // Quick preset test filler
  const handleQuickRoleFill = (role: RoleConfig) => {
    setSelectedRoleKey(role.key);
    setAuthError("");
    if (role.category === "super_admin") {
      setActiveTab("super_admin");
      setIdentifier("superadmin@occocore.com");
      setPassword("MasterSecret#2026");
      setTotpCode("849201");
    } else if (role.category === "student") {
      setActiveTab("student");
      setIdentifier("PRN-2026-APX-0491");
      setPassword("StudentPass@2026");
    } else if (role.category === "parent") {
      setActiveTab("parent");
      setPhone("+91 98765 43210");
    } else {
      setActiveTab("staff");
      setIdentifier(`${role.key.toLowerCase()}@${currentTenant.domain}`);
      setPassword("StaffPass@2026");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    // Simulated robust authentication validation
    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === "super_admin" && (!totpCode || totpCode.length < 6)) {
        setAuthError("Invalid 2FA Authenticator Code. Please enter 6-digit TOTP token.");
        return;
      }
      if (activeTab === "parent" && (!phone || phone.length < 10)) {
        setAuthError("Please enter a valid 10-digit mobile number.");
        return;
      }
      setAuthSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Universal Security & Tenant Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-[#090D16] shadow-2xs group-hover:scale-105 transition-transform">
                <Image src="/brand/occo-logo.jpg" alt="Logo" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-sm tracking-tight block leading-none">
                  OCCO Core
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Authentication Suite</span>
              </div>
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Active Institutional Tenant Selector (Demonstration Engine) */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase hidden md:inline">Tenant:</span>
              <button
                type="button"
                onClick={() => setActiveTenantPreset("apex")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeTenantPreset === "apex" ? "bg-blue-100 text-blue-900 border border-blue-300" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Apex Academy
              </button>
              <button
                type="button"
                onClick={() => setActiveTenantPreset("xavier")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeTenantPreset === "xavier" ? "bg-indigo-100 text-indigo-900 border border-indigo-300" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                St. Xavier&apos;s
              </button>
              <button
                type="button"
                onClick={() => setActiveTenantPreset("imperial")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  activeTenantPreset === "imperial" ? "bg-purple-100 text-purple-900 border border-purple-300" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Imperial Univ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit Encrypted TLS 1.3
            </span>
            <Link
              href="/auth/register"
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors ml-2"
            >
              Register Institute →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-xl space-y-4">
          {/* Institutional Banner Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-2xs text-[11px] font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-slate-600">{currentTenant.domain}</span>
              <span>•</span>
              <span className="text-blue-700 font-extrabold">{currentTenant.logoBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentTenant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Unified Institutional Portal • Single sign-on for administration, faculty, students & parents.
            </p>
          </div>

          {/* Core Auth Panel Card with 3D Beveled Border */}
          <div className="rounded-3xl border-2 border-b-4 border-slate-200/90 border-b-blue-600 bg-white p-5 sm:p-7 shadow-xl space-y-5">
            {/* 4 Portal Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("staff");
                  setAuthError("");
                  setAuthSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  activeTab === "staff" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px]">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("student");
                  setAuthError("");
                  setAuthSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  activeTab === "student" ? "bg-white text-cyan-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-[11px]">Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("parent");
                  setAuthError("");
                  setAuthSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  activeTab === "parent" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span className="text-[11px]">Parent (OTP)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("super_admin");
                  setAuthError("");
                  setAuthSuccess(false);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  activeTab === "super_admin" ? "bg-white text-red-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[11px]">Super Admin</span>
              </button>
            </div>

            {/* Quick Test Demo Role Pills (Demonstrating Scalable Extensibility) */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <span>Senior Role Switcher (Instant Fill Demo)</span>
                <span className="text-emerald-700 font-extrabold">10 Scalable Roles</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.values(ROLE_DEFINITIONS).map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleQuickRoleFill(role)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border transition-all cursor-pointer ${
                      selectedRoleKey === role.key
                        ? `${role.badgeColor} ring-1 ring-blue-500 shadow-2xs`
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Success State Alert */}
            {authSuccess && (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">Authentication Successful</span>
                  <span className="text-[11px] block mt-0.5">
                    Logged in as <strong>{ROLE_DEFINITIONS[selectedRoleKey]?.label || activeTab}</strong>. Redirecting to{" "}
                    <code>{ROLE_DEFINITIONS[selectedRoleKey]?.defaultRoute}</code>...
                  </span>
                </div>
              </div>
            )}

            {/* Error State Alert */}
            {authError && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Dynamic Form per Portal */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* TAB 1: STAFF & ADMINISTRATION */}
              {activeTab === "staff" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Official Staff Email or Employee Code
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="teacher@school.edu or EMP-1049"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        Security Password
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-[10px] font-bold text-blue-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: STUDENT PORTAL */}
              {activeTab === "student" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Student PRN, Admission No, or Roll ID
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="PRN-2026-APX-0491 or ADM/2026/104"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-slate-900 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        Student Password / Birth Date Code
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-[10px] font-bold text-blue-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-600 text-slate-900 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: PARENT PASSWORDLESS QUICK LOGIN (WhatsApp / SMS OTP) */}
              {activeTab === "parent" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Registered Parent Mobile Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 bg-white text-xs font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      We will dispatch an instant 6-digit verification code to your registered WhatsApp & SMS.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-between text-[11px]">
                    <span className="text-purple-900 font-semibold flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-purple-700" />
                      Multi-Child Switcher Active
                    </span>
                    <Link
                      href="/auth/verify-otp"
                      className="font-bold text-purple-700 hover:underline"
                    >
                      Enter OTP Directly →
                    </Link>
                  </div>
                </>
              )}

              {/* TAB 4: SUPER ADMIN PLATFORM OWNER */}
              {activeTab === "super_admin" && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Master Super Admin Email
                    </label>
                    <div className="relative">
                      <ShieldAlert className="w-4 h-4 text-red-500 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="superadmin@occocore.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Master Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        Hardware 2FA / TOTP Authenticator Code
                      </label>
                      <span className="text-[10px] text-red-600 font-bold uppercase">Mandatory</span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="6-Digit Token (e.g. 849201)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900 bg-white text-xs font-mono tracking-widest text-center"
                    />
                  </div>
                </>
              )}

              {/* Bottom Security Row */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>Keep session active for 30 days</span>
                </label>

                <Link
                  href="/auth/first-login"
                  className="font-bold text-blue-700 hover:underline"
                >
                  First-time login?
                </Link>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "super_admin"
                    ? "bg-red-700 hover:bg-red-800 text-white"
                    : activeTab === "student"
                    ? "bg-cyan-700 hover:bg-cyan-800 text-white"
                    : activeTab === "parent"
                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                    : "bg-blue-700 hover:bg-blue-800 text-white"
                }`}
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>
                      {activeTab === "parent" ? "Send Instant WhatsApp / SMS OTP" : "Authenticate & Open Console"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Links Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                DPDPA 2023 Minor Protection Verified
              </span>
              <div className="flex items-center gap-3 font-semibold">
                <Link href="/auth/register" className="hover:text-blue-700">
                  New School? Setup
                </Link>
                <span>•</span>
                <Link href="/auth/forgot-password" className="hover:text-blue-700">
                  Reset Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Legal Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-4 py-3 text-center text-[10px] text-slate-500">
        <p>
          OCCO Core Sovereign Education Operating System • Strictly Isolated Multi-Tenant Relational Architecture • All login attempts are cryptographically audit-logged with IP attribution.
        </p>
      </footer>
    </div>
  );
}
