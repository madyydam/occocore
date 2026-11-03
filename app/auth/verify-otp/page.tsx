"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";

interface Ward {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  admissionNo: string;
  avatarColor: string;
  pendingFee?: string;
  attendanceToday: string;
}

const SAMPLE_WARDS: Ward[] = [
  {
    id: "ward-01",
    name: "Aryan Sharma",
    grade: "Grade 10 - Section A",
    rollNo: "14",
    admissionNo: "AIA-2022-0941",
    avatarColor: "bg-blue-600 text-white",
    pendingFee: "₹0 (Clear)",
    attendanceToday: "Present (08:12 AM)",
  },
  {
    id: "ward-02",
    name: "Ananya Sharma",
    grade: "Grade 6 - Section B",
    rollNo: "08",
    admissionNo: "AIA-2025-1120",
    avatarColor: "bg-indigo-600 text-white",
    pendingFee: "₹18,500 (Term 2 Due)",
    attendanceToday: "Present (08:24 AM)",
  },
];

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [phoneNumber] = useState<string>("+91 98765 •••••");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [timer, setTimer] = useState<number>(42);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  
  // Step: "otp_entry" | "ward_selection" | "success"
  const [step, setStep] = useState<"otp_entry" | "ward_selection" | "success">("otp_entry");
  const [selectedWardId, setSelectedWardId] = useState<string>("ward-01");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derived resend availability
  const canResend = timer === 0;

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single character entry and auto-focus next
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1); // Take latest single digit
    setOtp(newOtp);
    setErrorMsg("");

    // Auto-advance to next input if digit entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current is empty, focus and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    setErrorMsg("");

    // Focus last filled index or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Submit OTP Verification
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join("");

    if (enteredCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    // Demo check: accept "123456" or any 6 digits unless testing error
    setTimeout(() => {
      setIsLoading(false);
      if (enteredCode === "000000") {
        setAttemptsLeft((prev) => Math.max(0, prev - 1));
        setErrorMsg("Invalid OTP code. Please check and try again.");
      } else {
        // Verified! If parent has multiple registered wards, present ward switcher
        setStep("ward_selection");
      }
    }, 900);
  };

  // Resend code
  const handleResend = () => {
    if (!canResend) return;
    setTimer(45);
    setOtp(["", "", "", "", "", ""]);
    setErrorMsg("");
    inputRefs.current[0]?.focus();
  };

  // Final confirmation into Portal
  const handleConfirmWard = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Institutional Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">OCCO Core</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Parent Security Vault
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted TLS Session</span>
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
          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all">
            {/* Step 1: OTP Entry */}
            {step === "otp_entry" && (
              <div className="p-6 sm:p-8">
                {/* Header Badge & Title */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-700 shadow-xs">
                    {channel === "whatsapp" ? (
                      <MessageSquare className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <Smartphone className="w-7 h-7 text-blue-700" />
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Verify Your Mobile
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5">
                    We sent a 6-digit one-time passcode to
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {phoneNumber}
                  </p>
                </div>

                {/* Channel Switcher Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChannel("whatsapp")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      channel === "whatsapp"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("sms")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      channel === "sms"
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                    <span>SMS Dispatch</span>
                  </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">{errorMsg}</p>
                      {attemptsLeft < 3 && attemptsLeft > 0 && (
                        <p className="mt-0.5 text-red-600">
                          {attemptsLeft} verification attempts remaining before cooldown.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 6-Box Segmented OTP Input Form */}
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 text-center">
                      Enter 6-Digit Passcode
                    </label>
                    <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                            digit
                              ? "border-blue-600 ring-1 ring-blue-600 text-slate-900"
                              : "border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-500/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend and Countdown */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Didn&apos;t receive code?
                    </span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend Code</span>
                      </button>
                    ) : (
                      <span className="font-mono text-slate-400">
                        Resend in <strong className="text-slate-600 font-semibold">{timer}s</strong>
                      </span>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isLoading || otp.join("").length < 6}
                    className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Change Number Option */}
                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <Link
                    href="/auth/login"
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Entered incorrect number?</span>
                    <span className="text-blue-700 underline font-semibold">Switch Account</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2: Multi-Ward Selector */}
            {step === "ward_selection" && (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-700 shadow-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Select Student Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Multiple children found linked to mobile number <strong>{phoneNumber}</strong>
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {SAMPLE_WARDS.map((ward) => {
                    const isSelected = selectedWardId === ward.id;
                    return (
                      <div
                        key={ward.id}
                        onClick={() => setSelectedWardId(ward.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${ward.avatarColor}`}
                          >
                            {ward.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-slate-900 text-sm truncate">
                                {ward.name}
                              </h3>
                              <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                Roll #{ward.rollNo}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{ward.grade}</p>
                            <div className="flex items-center space-x-3 mt-2 text-[11px]">
                              <span className="text-slate-500">
                                Status: <strong className="text-emerald-600 font-medium">{ward.attendanceToday}</strong>
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">
                                Fees: <strong className={ward.pendingFee?.includes("Due") ? "text-amber-600" : "text-slate-700"}>{ward.pendingFee}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmWard}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Parent Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === "success" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Authentication Successful
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Session token verified under DPDPA 2023 Digital Vault standards.
                </p>
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-mono text-slate-600">
                  <div><strong>Portal Shell:</strong> Parent / Guardian Portal</div>
                  <div><strong>Active Ward:</strong> {SAMPLE_WARDS.find(w => w.id === selectedWardId)?.name}</div>
                  <div><strong>Institution:</strong> Apex International Academy</div>
                  <div><strong>Security Level:</strong> OTP Biometric Session Verified</div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    <span>Proceed to ERP Parent Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Security Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>DPDPA 2023 Compliant Vault</span>
              </div>
              <div className="text-slate-400">
                Session ID: <span className="font-mono text-slate-600">#4921-X9</span>
              </div>
            </div>
          </div>

          {/* Quick Help Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Having trouble signing in?{" "}
            <a href="mailto:support@occocore.com" className="text-blue-700 hover:underline font-medium">
              Contact School IT Helpdesk
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OCCO Core Systems Inc. Enterprise Grade Multi-Tenant Academic OS. All rights reserved.
      </footer>
    </div>
  );
}
