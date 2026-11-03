"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

export default function ForgotPasswordPage() {
  // Step: 1 = "request", 2 = "verify_and_reset", 3 = "success"
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Recovery method: "email" | "phone"
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");

  // New Password Fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State flags
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Password criteria evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const criteriaMetCount = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (newPassword.length === 0) return { label: "Not entered", color: "bg-slate-200", text: "text-slate-400" };
    if (criteriaMetCount <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-600" };
    if (criteriaMetCount <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
    return { label: "Strong & DPDPA Compliant", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const strength = getStrengthMeta();
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Send Recovery Link / Code
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg("Please enter your registered institutional email or phone number.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  };

  // Step 2: Confirm Token & Save New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken || resetToken.length < 4) {
      setErrorMsg("Please enter the recovery verification code sent to your device.");
      return;
    }

    if (criteriaMetCount < 4) {
      setErrorMsg("Password does not meet institutional enterprise complexity criteria.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match. Please re-enter identical passwords.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">OCCO Core</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Identity Governance
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>ISO 27001 Identity Recovery</span>
          </div>
          <Link
            href="/auth/login"
            className="text-xs font-medium text-slate-600 hover:text-blue-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all">
            {/* Step 1: Identifier Entry */}
            {step === 1 && (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-13 h-13 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-700 shadow-xs">
                    <KeyRound className="w-6 h-6 text-blue-700" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Reset Account Password
                  </h1>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Provide your verified institutional credentials to receive an authorized recovery verification challenge.
                  </p>
                </div>

                {/* Delivery Channel Radio Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("email");
                      setIdentifier("");
                      setErrorMsg("");
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      method === "email"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-700" />
                    <span>Official Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("phone");
                      setIdentifier("");
                      setErrorMsg("");
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      method === "phone"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                    <span>Registered Phone</span>
                  </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {method === "email" ? "Institutional Email Address" : "Registered Mobile Phone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        {method === "email" ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Smartphone className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type={method === "email" ? "email" : "tel"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          method === "email"
                            ? "faculty@school.edu.in or student@academy.edu"
                            : "+91 98765 43210"
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                    <strong>Enterprise Security Policy:</strong> Reset links are valid for exactly 15 minutes. Password reset activities are logged in the institutional audit log.
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Recovery Challenge</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Verification Code + New Password */}
            {step === 2 && (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-700 shadow-xs">
                    <Lock className="w-6 h-6 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the 6-digit challenge code sent to <strong>{identifier}</strong> and choose a secure new password.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Verification Token Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Recovery Challenge Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 748291"
                      className="w-full px-3.5 py-2.5 tracking-widest text-center font-mono font-bold text-lg bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Permanent Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Strength Meter */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Security Strength:</span>
                        <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-full flex-1 transition-all ${
                              criteriaMetCount >= lvl ? strength.color : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center space-x-1.5 ${hasMinLength ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>8+ Characters</span>
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
                    <div className={`flex items-center space-x-1.5 col-span-2 ${hasSpecial ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                      {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>Special Symbol (!@#$%)</span>
                    </div>
                  </div>

                  {/* Confirm Password */}
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
                    {confirmPassword && (
                      <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !passwordsMatch || criteriaMetCount < 4}
                    className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Save & Invalidate Other Sessions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Password Reset Complete
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Your password has been successfully updated. All active mobile and browser sessions have been revoked for your security.
                </p>

                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-mono text-slate-600">
                  <div><strong>Account:</strong> {identifier}</div>
                  <div><strong>Status:</strong> Encrypted Credentials Synced</div>
                  <div><strong>Audit Entry:</strong> PWD_RESET_SUCCESS (#7201)</div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
                  >
                    <span>Sign In With New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Card Bar */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Zero-Trust Credential Vault</span>
              </div>
              <Link href="/auth/login" className="text-blue-700 hover:underline font-medium">
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OCCO Core Systems Inc. Enterprise Grade Multi-Tenant Academic OS.
      </footer>
    </div>
  );
}
