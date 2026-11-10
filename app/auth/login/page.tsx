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
  Settings,
  Lock,
} from "lucide-react";
import { ROLE_DEFINITIONS, RoleConfig, INITIAL_USER_ACCOUNTS } from "@/lib/auth/roles";

export default function LoginPage() {
  // Selected Portal Tab: "staff" | "student" | "parent"
  const [activeTab, setActiveTab] = useState<"staff" | "student" | "parent">("staff");

  // Selected specific role within staff for quick demo testing
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("ADMIN");

  // Form inputs: Email + Password + 4-Digit PIN (Mandatory on ALL logins)
  const [email, setEmail] = useState("principal@apexacademy.edu");
  const [password, setPassword] = useState("AdminPass@2026");
  const [pin, setPin] = useState("2468"); // 4-digit Security PIN
  const [totpCode, setTotpCode] = useState("849201");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);

  // Dynamic tenant preview switcher
  const [activeTenantPreset, setActiveTenantPreset] = useState<"apex" | "xavier" | "imperial">("apex");

  const tenantPresets = {
    apex: {
      name: "Apex International Academy",
      domain: "portal.apexacademy.edu",
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

  // Quick preset test filler: Fills Email, Password, AND 4-digit Security PIN
  const handleQuickRoleFill = (role: RoleConfig) => {
    setSelectedRoleKey(role.key);
    setAuthError("");
    setAuthSuccess(false);

    // Find pre-configured demo account or fallback
    const matchedAccount = INITIAL_USER_ACCOUNTS.find((u) => u.roleKey === role.key);

    if (role.category === "student") {
      setActiveTab("student");
      setEmail(matchedAccount?.email || "student@apexacademy.edu");
      setPassword(matchedAccount?.defaultPassword || "StudentPass@2026");
      setPin(matchedAccount?.pin || "2026");
    } else if (role.category === "parent") {
      setActiveTab("parent");
      setEmail(matchedAccount?.email || "parent@apexacademy.edu");
      setPassword(matchedAccount?.defaultPassword || "ParentPass@2026");
      setPin(matchedAccount?.pin || "7788");
    } else {
      setActiveTab("staff");
      setEmail(matchedAccount?.email || `${role.key.toLowerCase()}@${currentTenant.domain}`);
      setPassword(matchedAccount?.defaultPassword || "StaffPass@2026");
      setPin(matchedAccount?.pin || "2468");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // 1. Validate Email
    if (!email || !email.includes("@") || !email.includes(".")) {
      setAuthError("Please enter a valid institutional email address.");
      return;
    }

    // 2. Validate Password
    if (!password || password.length < 4) {
      setAuthError("Please enter your account password.");
      return;
    }

    // 3. Validate 4-Digit Security PIN (Strictly 4 numeric digits)
    if (!pin || !/^\d{4}$/.test(pin)) {
      setAuthError("Please enter your 4-digit Security PIN.");
      return;
    }

    setIsLoading(true);

    // Simulated robust authentication validation
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
    }, 700);
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
                  Core
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Authentication Suite</span>
              </div>
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Active Institutional Tenant Selector */}
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

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/roles"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg font-bold text-[11px] hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Role & PIN Manager →</span>
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
              Sign in to access your institutional portal.
            </p>
          </div>

          {/* Core Auth Panel Card */}
          <div className="rounded-3xl border-2 border-b-4 border-slate-200/90 border-b-blue-600 bg-white p-5 sm:p-7 shadow-xl space-y-5">
            {/* 3 Portal Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
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
                <span className="text-[11px]">Parent</span>
              </button>
            </div>

            {/* Quick Test Demo Role Pills: Fills Email, Password & 4-Digit PIN */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                <span>Quick Role Demo Switcher (Auto-Fills Email + Pass + PIN)</span>
                <span className="text-emerald-700 font-extrabold">10 Roles Configured</span>
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
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-extrabold block text-sm">Authentication Successful!</span>
                    <span className="text-[11px] block text-emerald-800 mt-0.5">
                      Credentials verified successfully. Redirecting to your dashboard...
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-white/80 rounded-lg border border-emerald-200 text-[11px] space-y-1 font-mono text-slate-700">
                  <div><strong>Account Email:</strong> {email}</div>
                  <div><strong>Active Role:</strong> {selectedRoleKey} ({ROLE_DEFINITIONS[selectedRoleKey]?.label})</div>
                  <div><strong>Security PIN:</strong> <span className="tracking-widest font-bold text-emerald-700">•••• (Verified)</span></div>
                  <div><strong>Assigned Modules:</strong> {ROLE_DEFINITIONS[selectedRoleKey]?.allowedModules?.join(", ")}</div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Session authenticated.</span>
                  {activeTab === "student" ? (
                    <Link
                      href="/student"
                      className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold text-[11px] transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <span>Enter Student Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/admin/roles"
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition-colors"
                    >
                      Open Role Manager →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Error Alert */}
            {authError && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{authError}</span>
              </div>
            )}

            {/* Dynamic Form: ALL LOGINS REQUIRE EMAIL + PASSWORD + 4-DIGIT PIN */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Field 1: Institutional Email */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">
                  {activeTab === "staff" && "Official Staff / Faculty Email Address"}
                  {activeTab === "student" && "Student Institutional Email / PRN ID"}
                  {activeTab === "parent" && "Parent / Guardian Registered Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu or name@academy.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Account Password
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

              {/* Field 3: 4-Digit Security PIN */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    Security PIN (4 digits)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    4 numeric digits
                  </span>
                </div>
                
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono font-bold text-sm tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Session */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">Keep institutional session active</span>
                </label>

                <div className="text-[10px] text-slate-400 font-mono">
                  Timeout: 30m idle
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-blue-700 hover:bg-blue-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick First-Time Login & OTP Links */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <Link
                href="/auth/first-login"
                className="hover:text-blue-700 underline font-medium"
              >
                First-time user? Set password & PIN →
              </Link>

              <Link
                href="/auth/verify-otp"
                className="hover:text-purple-700 font-medium"
              >
                Direct WhatsApp OTP Login →
              </Link>
            </div>
          </div>

          {/* Bottom Compliance & Administrator Controls Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[11px]">
                Administrator Governance:
              </span>
              <Link
                href="/admin/roles"
                className="font-bold text-blue-700 hover:underline"
              >
                Manage Roles, Module Access & User PINs
              </Link>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
              <Link href="/auth/register" className="hover:text-blue-700">
                New School Setup
              </Link>
              <span>•</span>
              <Link href="/auth/forgot-password" className="hover:text-blue-700">
                Reset Credentials
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-4 py-3 text-center text-[10px] text-slate-400">
        Core Institutional OS • Enterprise Multi-Tenant ERP Platform. All rights reserved.
      </footer>
    </div>
  );
}
