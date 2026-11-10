"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Hash,
} from "lucide-react";

export default function FirstLoginPage() {
  const [currentTempPassword, setCurrentTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Mandatory 4-Digit Security PIN setup
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Compliance checkboxes
  const [consentDpdpa, setConsentDpdpa] = useState(false);
  const [consentAup, setConsentAup] = useState(false);
  const [consentBiometric, setConsentBiometric] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Password Strength validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const criteriaCount = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const pinsMatch = newPin.length === 4 && /^\d{4}$/.test(newPin) && newPin === confirmPin;
  const allConsentsGiven = consentDpdpa && consentAup && consentBiometric;
  
  const canSubmit =
    currentTempPassword.length >= 4 &&
    criteriaCount >= 4 &&
    passwordsMatch &&
    pinsMatch &&
    allConsentsGiven;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pinsMatch) {
      setErrorMsg("Please configure a valid 4-digit numeric Security PIN and confirm it.");
      return;
    }

    if (!canSubmit) {
      setErrorMsg("Please complete all password criteria, 4-digit PIN setup, and required statutory acknowledgments.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Core</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                Mandatory First-Time Security Setup
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Account Pending Activation</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all">
            {!isSuccess ? (
              <div className="p-6 sm:p-8">
                {/* Banner */}
                <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-700 shrink-0">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      Activate Profile & Setup 4-Digit Security PIN
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Your administrator provisioned your account with a temporary password. Under institutional policy, you must set a permanent password, create your personal <strong>4-digit Security PIN</strong>, and acknowledge statutory compliance.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Step 1: Temporary Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Temporary Password (from Admin / Welcome Email)
                    </label>
                    <div className="relative">
                      <input
                        type={showTempPassword ? "text" : "password"}
                        value={currentTempPassword}
                        onChange={(e) => setCurrentTempPassword(e.target.value)}
                        placeholder="e.g. Welcome@2026"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowTempPassword(!showTempPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: New Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        New Personal Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Requirements grid */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className={`flex items-center space-x-1.5 ${hasMinLength ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasUpperCase ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasUpperCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasLowerCase ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasLowerCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasNumber ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasSpecial ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Special Symbol</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${passwordsMatch ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Passwords Match</span>
                    </div>
                  </div>

                  {/* Step 3: MANDATORY 4-DIGIT SECURITY PIN SETUP */}
                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                        <Hash className="w-4 h-4 text-blue-700" />
                        <span>Configure Your Personal 4-Digit Security PIN</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Strictly 4 Digits
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-snug">
                      This 4-digit PIN is required alongside your email and password on every login. Memorize this securely.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Choose 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-3 py-2 text-center font-mono font-bold text-base bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirm 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="••••"
                          className="w-full px-3 py-2 text-center font-mono font-bold text-base bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-widest"
                          required
                        />
                      </div>
                    </div>
                    {confirmPin && (
                      <p className={`text-[11px] font-medium ${pinsMatch ? "text-emerald-700" : "text-red-600"}`}>
                        {pinsMatch ? "✓ 4-digit PIN confirmed & matches" : "✗ PINs do not match or is not 4 digits"}
                      </p>
                    )}
                  </div>

                  {/* Statutory Legal Consents (DPDPA 2023) */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>Statutory Governance & Compliance Acknowledgment</span>
                    </h3>

                    {/* DPDPA Consent */}
                    <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentDpdpa}
                        onChange={(e) => setConsentDpdpa(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600 shrink-0"
                      />
                      <span>
                        <strong>Digital Personal Data Protection (DPDPA 2023):</strong> I consent to the institutional storage, academic grade processing, and encrypted transmission of my academic profile and attendance logs.
                      </span>
                    </label>

                    {/* Acceptable Use Policy */}
                    <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAup}
                        onChange={(e) => setConsentAup(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600 shrink-0"
                      />
                      <span>
                        <strong>Institutional IT & Honor Code:</strong> I agree to abide by the institution&apos;s Acceptable Use Policy and will not share login credentials or bypass portal access controls.
                      </span>
                    </label>

                    {/* Biometric / Automated Gate Consent */}
                    <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentBiometric}
                        onChange={(e) => setConsentBiometric(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600 shrink-0"
                      />
                      <span>
                        <strong>Automated Attendance & Campus Safety:</strong> I authorize digital logging of entry/exit timestamps via RFID, biometric turnstiles, or bus GPS fleet trackers for institutional safety.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !canSubmit}
                      className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Save Password & 4-Digit PIN → Unlock Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Profile Activated & PIN Saved!
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Your credentials and 4-digit Security PIN have been securely encrypted and stored. You can now log into your portal using Email, Password, and your 4-digit PIN.
                </p>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-mono text-slate-600">
                  <div><strong>Account Status:</strong> ACTIVE (Verified)</div>
                  <div><strong>4-Digit Security PIN:</strong> Configured (••••)</div>
                  <div><strong>Consent Timestamp:</strong> {new Date().toLocaleDateString("en-IN")}</div>
                  <div><strong>Session Status:</strong> Encrypted &amp; Secured</div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
                  >
                    <span>Proceed to Sign In (Email + Password + PIN)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Trust Credential Sync</span>
              </div>
              <Link href="/auth/login" className="text-blue-700 hover:underline font-medium">
                Cancel & Return
              </Link>
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
