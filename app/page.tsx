"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  School,
  Building2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Wifi,
  Users,
  ArrowRight,
  Scale,
  Building,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  const [selectedArchetype, setSelectedArchetype] = useState<"school" | "college" | "university" | "coaching">("school");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Interactive SaaS Console Active Tab
  const [heroTab, setHeroTab] = useState<"attendance" | "fees" | "nep">("attendance");

  // Hero Roll Call Interactive Toggle Simulation
  const [attendanceList, setAttendanceList] = useState([
    { roll: "101", name: "Aarav Sharma", status: "present", time: "08:14 AM" },
    { roll: "102", name: "Diya Patel", status: "present", time: "08:15 AM" },
    { roll: "103", name: "Rohan Varma", status: "present", time: "08:16 AM" },
    { roll: "104", name: "Ananya Iyer", status: "absent", time: "Unmarked" },
  ]);

  const toggleStudentStatus = (index: number) => {
    setAttendanceList((prev) =>
      prev.map((student, i) =>
        i === index
          ? {
              ...student,
              status: student.status === "present" ? "absent" : "present",
              time: student.status === "present" ? "Marked Absent" : "08:22 AM (Just now)",
            }
          : student
      )
    );
  };

  // 3D Comparison Big Switch: false = Traditional ERP (Legacy), true = OCCO Core (Modern)
  const [isModernMode, setIsModernMode] = useState<boolean>(true);

  // Form State
  const [instituteName, setInstituteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [instituteType, setInstituteType] = useState("K-12 School");

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !instituteName) return;
    setDemoSubmitted(true);
  };

  const archetypeData = {
    school: {
      id: "school",
      title: "K-12 Schools",
      board: "CBSE / ICSE / State Boards",
      themeColor: "from-blue-600 to-indigo-700",
      accentBg: "bg-blue-50 border-blue-200 text-blue-900",
      description: "Primary, Middle, and Senior Secondary schools with standard academic divisions, CBSE 9-point grading, and statutory RTE 25% quotas.",
      sampleInstitute: "Delhi Public Global School, Vasant Kunj",
      cohortUnit: "Class & Section",
      exampleCohort: "Class 10-A (Room 204)",
      studentId: "Admission No / Roll No",
      leader: "Principal",
      statutoryBadge: "RTE Act & Minor Data Shield",
      metrics: {
        students: "1,840 Enrolled",
        attendance: "96.4% Today",
        feeCollected: "₹11,84,500 Settled",
        activeDivisions: "32 Sections",
      },
      dashboardHighlight: {
        title: "Daily Morning Roll Call (Room 204)",
        subtitle: "Class 10-A • 42/43 Present • Zero Internet Needed",
        metricLabel: "Quota Compliance",
        metricValue: "25% RTE EWS Waived",
      },
      features: [
        "Automated 100% Tuition Waiver for RTE 25% EWS Quota seats",
        "Verifiable Parental Consent via instant mobile OTP",
        "Subject & Section roll-call with instant parent notification on absent",
        "School bus safety speed limiter & real-time route tracking",
      ],
    },
    college: {
      id: "college",
      title: "Degree Colleges",
      board: "UGC / AICTE / NAAC Affiliated",
      themeColor: "from-indigo-600 to-purple-700",
      accentBg: "bg-indigo-50 border-indigo-200 text-indigo-900",
      description: "Undergraduate and Postgraduate arts, science, and commerce colleges with semester credit structures and SGPA/CGPA calculations.",
      sampleInstitute: "St. Xavier's Autonomous College",
      cohortUnit: "Program & Semester",
      exampleCohort: "B.Com Honours (Semester 4)",
      studentId: "College PRN / Roll",
      leader: "Principal / HOD",
      statutoryBadge: "UGC ABC & National Student ID",
      metrics: {
        students: "3,420 Enrolled",
        attendance: "91.8% Today",
        feeCollected: "₹13,40,000 Settled",
        activeDivisions: "18 Departments",
      },
      dashboardHighlight: {
        title: "Departmental Attendance & Credit Audit",
        subtitle: "B.Com Hons Sem 4 • 64 Enrolled • Academic Bank Sync",
        metricLabel: "Minimum Attendance Gate",
        metricValue: "75% Mandatory SGPA",
      },
      features: [
        "12-Digit Indian National Student ID & Academic Bank of Credits sync",
        "Automatic 75% attendance condonation threshold calculation",
        "Departmental subject allocation & faculty workload balancing",
        "Annual statutory regulatory accreditation export schema",
      ],
    },
    university: {
      id: "university",
      title: "Autonomous Universities",
      board: "Institute of Eminence / State University",
      themeColor: "from-purple-600 to-pink-700",
      accentBg: "bg-purple-50 border-purple-200 text-purple-900",
      description: "Multi-campus, multi-faculty universities operating Outcome-Based Education (OBE) and NEP 2020 multi-entry credit frameworks.",
      sampleInstitute: "Apex University of Science & Technology",
      cohortUnit: "Degree & Department",
      exampleCohort: "B.Tech CSE - Data Science (Yr 3)",
      studentId: "University PRN / National ID",
      leader: "Dean / Vice-Chancellor",
      statutoryBadge: "NEP 2020 Digital Degree Seal",
      metrics: {
        students: "8,200 Enrolled",
        attendance: "89.4% Today",
        feeCollected: "₹18,90,000 Settled",
        activeDivisions: "42 Schools",
      },
      dashboardHighlight: {
        title: "NEP 2020 Multi-Disciplinary Credit Bank",
        subtitle: "B.Tech CSE Data Science (Yr 3) • 24 CBCS Credits",
        metricLabel: "Degree Authentication",
        metricValue: "Tamper-Proof Digital Seal",
      },
      features: [
        "NEP 2020 Choice Based Credit System (CBCS) credit banking",
        "Cryptographic digital security seal on official marksheets & degrees",
        "Statutory Anti-Ragging and Internal Complaints Committee records",
        "Multi-campus hierarchy with independent departmental accounts",
      ],
    },
    coaching: {
      id: "coaching",
      title: "Coaching Academies",
      board: "MoE Registered Test Prep",
      themeColor: "from-emerald-600 to-teal-700",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      description: "Competitive exam coaching centers (JEE, NEET, UPSC, CA) with batch pacing, test percentiles, and MoE Jan 2024 compliance.",
      sampleInstitute: "Pinnacle IIT-JEE & NEET Academy",
      cohortUnit: "Course & Batch",
      exampleCohort: "JEE Advanced 2027 Morning Batch",
      studentId: "Student Reg ID",
      leader: "Center Director",
      statutoryBadge: "Ministry Guidelines 2024",
      metrics: {
        students: "1,360 Enrolled",
        attendance: "96.4% Today",
        feeCollected: "₹12,10,000 Settled",
        activeDivisions: "24 Batches",
      },
      dashboardHighlight: {
        title: "Competitive Exam Batch Pacing Console",
        subtitle: "JEE Advanced 2027 Morning Batch • 98.4 Percentile Mock",
        metricLabel: "Statutory Age Gate",
        metricValue: "Under-16 Enrollment Blocked",
      },
      features: [
        "Rule 4(a) Automated Age Barrier: Blocks admission for students under 16",
        "Statutory 10-Day Pro-Rata Fee Refund calculator for course withdrawals",
        "Classroom capacity safety validation based on 1 sqm/student mandate",
        "Batch-wise national percentile ranking and mock test tabulation",
      ],
    },
  };

  const activePreset = archetypeData[selectedArchetype];

  // Comparison Matrix Data (Compact, Zero Technicalities)
  const legacyFeatures = [
    {
      title: "Internet Outage = Complete Shutdown",
      description: "Wi-Fi or mobile data drops freeze screens immediately. Roll calls and grades cannot be entered.",
      badge: "Zero Offline",
    },
    {
      title: "4 to 12 Weeks Painful Setup",
      description: "Institutions wait months for external consultants to configure basic student databases.",
      badge: "Slow Setup",
    },
    {
      title: "Rigid & Inflexible Monolith",
      description: "Hardcoded for one single model. Breaks completely for colleges, universities, or coaching.",
      badge: "Inflexible",
    },
    {
      title: "Fails Indian Statutory Data Laws",
      description: "Lacks mandatory minor student consent tracking, RTE fee waivers, and coaching age limits.",
      badge: "Legal Risk",
    },
    {
      title: "Clunky 90s Interface & Menus",
      description: "Staff waste hours clicking nested dropdowns and slow tables. Zero spotlight keyboard search.",
      badge: "High Friction",
    },
    {
      title: "Expensive Hidden Domain Fees",
      description: "Vendors charge ₹1 to 2 Lakhs extra just to connect your institution's own web domain.",
      badge: "Hidden Costs",
    },
  ];

  const modernFeatures = [
    {
      title: "Uninterrupted Offline Roll Calls",
      description: "Mark attendance anywhere—even in basement classrooms with zero Wi-Fi. Syncs automatically upon reconnecting.",
      badge: "Zero-Lag Sync",
      color: "border-emerald-200 bg-gradient-to-b from-white to-emerald-50/40",
      iconColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "10-Minute Guided Onboarding",
      description: "Upload existing student spreadsheets with instant validation and enroll students in minutes with zero consultant fees.",
      badge: "Instant Setup",
      color: "border-blue-200 bg-gradient-to-b from-white to-blue-50/40",
      iconColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "Adaptive 4-in-1 Framework",
      description: "A single intelligent platform that dynamically adapts terminology across Schools, Colleges, Universities, and Coaching.",
      badge: "Adaptive",
      color: "border-indigo-200 bg-gradient-to-b from-white to-indigo-50/40",
      iconColor: "bg-indigo-100 text-indigo-800",
    },
    {
      title: "Built-in Statutory Compliance",
      description: "Minor student privacy consent, 25% RTE fee waivers, and Ministry coaching refund rules built into every record.",
      badge: "100% Compliant",
      color: "border-amber-200 bg-gradient-to-b from-white to-amber-50/40",
      iconColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Universal Instant Search (Ctrl + K)",
      description: "Keyboard-first navigation. Pull up any student file, issue fee receipts, or verify credentials in two keystrokes.",
      badge: "2-Sec Search",
      color: "border-purple-200 bg-gradient-to-b from-white to-purple-50/40",
      iconColor: "bg-purple-100 text-purple-800",
    },
    {
      title: "Free Custom Institutional Domains",
      description: "Launch your own branded web portal (e.g., portal.yourschool.edu) with SSL security and custom badges at zero extra fee.",
      badge: "White-Label",
      color: "border-teal-200 bg-gradient-to-b from-white to-teal-50/40",
      iconColor: "bg-teal-100 text-teal-800",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-600/10 selection:text-blue-900">
      {/* ═════════════════════════════════════════════════════════════════════════
          STICKY TOP NAVBAR (Crisp Light Theme with Official Logo)
      ═════════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs h-14 sm:h-15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo & Brand Identity with Generated Official Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="relative w-8.5 h-8.5 rounded-xl overflow-hidden shadow-tactile-indigo border border-slate-200/90 group-hover:scale-105 transition-transform bg-[#090D16] flex items-center justify-center shrink-0">
              <Image
                src="/brand/occo-logo.jpg"
                alt="OCCO Core Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                OCCO Core
              </span>
              <span className="text-[9px] text-slate-500 font-medium leading-none mt-1">
                The Education Operating System
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#comparison" className="hover:text-blue-700 transition-colors flex items-center gap-1 font-bold text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>ERP Comparison</span>
            </a>
            <a href="#capabilities" className="hover:text-blue-700 transition-colors">
              Core Capabilities
            </a>
            <a href="#archetypes" className="hover:text-blue-700 transition-colors">
              Institutional Archetypes
            </a>
            <a href="#compliance" className="hover:text-blue-700 transition-colors">
              Statutory Shield
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#demo"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-tactile-blue transition-all active:scale-95"
            >
              Request Walkthrough
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-2.5 space-y-1.5 text-xs font-semibold text-slate-700 shadow-md">
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-700 font-bold text-blue-800"
            >
              ERP Comparison
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-700"
            >
              Core Capabilities
            </a>
            <a
              href="#archetypes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-700"
            >
              Institutional Archetypes
            </a>
            <a
              href="#compliance"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-blue-700"
            >
              Statutory Shield
            </a>
            <div className="pt-1.5 border-t border-slate-100">
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-blue-700 text-white font-bold"
              >
                Request Walkthrough
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 1: HERO & 3D MOVING SAAS CONSOLE (Strict Screen-Fit on Desktop)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="lg:h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)] lg:overflow-hidden flex flex-col justify-center py-6 lg:py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-mesh-hero relative"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          {/* Left Column (6 Cols): Value Proposition & Highlights */}
          <div className="lg:col-span-6 space-y-3 lg:space-y-4">
            {/* Vibrant Status Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-blue-200 bg-white/90 shadow-2xs text-blue-900 text-[11px] font-semibold backdrop-blur-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>100% Indian Statutory Shield • Zero-Interruption Offline Mode</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-[1.18]">
              The Operating System for Modern Institutions.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg font-normal">
              Replaces slow, fragmented software with a high-craft platform: automated multi-head fee ledgers, uninterrupted offline roll calls, and automated compliance with national education mandates.
            </p>

            {/* Interactive CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-1">
              <a
                href="#comparison"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-tactile-blue transition-all active:scale-95 cursor-pointer text-center"
              >
                <span>Compare vs Traditional ERPs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold border border-slate-300/80 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-2xs hover:border-slate-400 text-center"
              >
                <span>Explore Capabilities</span>
              </a>
            </div>

            {/* Key Metric Highlights with Feature Focus */}
            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1.5 sm:gap-2.5 text-xs">
              <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs text-center sm:text-left">
                <span className="font-extrabold text-blue-700 block font-mono text-xs sm:text-sm lg:text-base">Instant</span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Automated Ledgers</span>
              </div>
              <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs text-center sm:text-left">
                <span className="font-extrabold text-emerald-700 block font-mono text-xs sm:text-sm lg:text-base">100% Offline</span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Zero-Downtime Roll</span>
              </div>
              <div className="p-2 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs text-center sm:text-left">
                <span className="font-extrabold text-indigo-700 block font-mono text-xs sm:text-sm lg:text-base">DPDPA 2023</span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Parental Consent</span>
              </div>
            </div>
          </div>

          {/* Right Column (6 Cols): 3D ISOMETRIC DASHBOARD (Compact & Screen-Fitted) */}
          <div className="lg:col-span-6 relative perspective-container py-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-indigo-400/15 to-emerald-400/10 rounded-3xl blur-2xl -z-10" />

            {/* Main Isometric Dashboard Window with Logo */}
            <div className="isometric-card rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xl relative z-10 space-y-2.5 max-w-lg mx-auto">
              {/* Window Header with Logo and Live Status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-2xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-2xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-2xs" />
                  </div>
                  <div className="w-4.5 h-4.5 rounded overflow-hidden bg-[#090D16] border border-slate-200 ml-1 shrink-0">
                    <Image src="/brand/occo-logo.jpg" alt="Logo" width={20} height={20} className="w-full h-full object-cover" />
                  </div>
                  <span className="ml-1 font-mono text-[10px] text-slate-500 font-bold truncate">
                    portal.dpsdelhi.edu.in • Live Console
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Offline Sync Active
                </span>
              </div>

              {/* Interactive SaaS Tab Switcher */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setHeroTab("attendance")}
                  className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                    heroTab === "attendance" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Live Roll Call
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab("fees")}
                  className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                    heroTab === "fees" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Fee Ledgers
                </button>
                <button
                  type="button"
                  onClick={() => setHeroTab("nep")}
                  className={`flex-1 py-1 rounded-md transition-all text-center cursor-pointer ${
                    heroTab === "nep" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  NEP Grades
                </button>
              </div>

              {/* Dynamic Animated Content Panel */}
              {heroTab === "attendance" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/50">
                      <span className="text-[9px] text-blue-800 font-bold block uppercase">Attendance</span>
                      <span className="font-black text-slate-900 text-sm font-mono">96.4%</span>
                      <span className="text-[8px] text-emerald-700 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> 1,752 Present
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50">
                      <span className="text-[9px] text-emerald-800 font-bold block uppercase">Offline Saved</span>
                      <span className="font-black text-slate-900 text-sm font-mono">42 Records</span>
                      <span className="text-[8px] text-emerald-700 font-bold block">Auto-Syncing</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50">
                      <span className="text-[9px] text-indigo-800 font-bold block uppercase">Latency</span>
                      <span className="font-black text-slate-900 text-sm font-mono">0ms</span>
                      <span className="text-[8px] text-indigo-700 font-bold block">Local Mode</span>
                    </div>
                  </div>

                  {/* Interactive Live Roll Call Switchboard */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-900">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        Class 10-A • Morning Roll Call
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded-full">
                        Interactive
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/70 text-[11px]">
                      {attendanceList.slice(0, 3).map((st, idx) => (
                        <div key={idx} className="py-1 flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 font-mono text-[9px] font-bold flex items-center justify-center">
                              {st.roll}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block text-[11px]">{st.name}</span>
                              <span className="text-[9px] text-slate-500">{st.time}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(idx)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                              st.status === "present"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
                            }`}
                          >
                            {st.status === "present" ? "Present ✓" : "Absent ✗"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {heroTab === "fees" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50">
                      <span className="text-[9px] text-emerald-800 font-bold block uppercase">Collected</span>
                      <span className="font-black text-slate-900 text-sm font-mono">₹11,84,500</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-amber-100 bg-amber-50/50">
                      <span className="text-[9px] text-amber-800 font-bold block uppercase">RTE Waivers</span>
                      <span className="font-black text-slate-900 text-sm font-mono">460 Seats</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/50">
                      <span className="text-[9px] text-blue-800 font-bold block uppercase">Receipts</span>
                      <span className="font-black text-slate-900 text-sm font-mono">1,840 Issued</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 space-y-1 text-xs">
                    <div className="p-1.5 rounded bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900 block">Aarav Sharma (Class 10-A)</span>
                        <span className="text-[9px] text-slate-500">Term 1 Tuition • Receipt #DPS-0491</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">₹14,500</span>
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          Settled
                        </span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-900 block">Tanvi Deshmukh (Class 10-A)</span>
                        <span className="text-[9px] text-slate-500">RTE Act 25% EWS Allocation</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">₹0</span>
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          Waived
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {heroTab === "nep" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-purple-100 bg-purple-50/50">
                      <span className="text-[9px] text-purple-800 font-bold block uppercase">Credits</span>
                      <span className="font-black text-slate-900 text-sm font-mono">160 Earned</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/50">
                      <span className="text-[9px] text-blue-800 font-bold block uppercase">Student ID</span>
                      <span className="font-black text-slate-900 text-sm font-mono">100% Linked</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50">
                      <span className="text-[9px] text-emerald-800 font-bold block uppercase">Security</span>
                      <span className="font-black text-slate-900 text-sm font-mono">Digital Seal</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60">
                      <span className="text-slate-700">Data Structures & Algorithms (4 Cr)</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">Grade O (10.0)</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-slate-700">Indian Constitution & Ethics (2 Cr)</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 rounded">Grade A+ (9.0)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING 3D ELEMENT 1: Smart Identity Pass with Official Logo */}
            <div className="animate-float absolute -top-3 -right-2 sm:-right-4 w-44 p-2.5 rounded-xl border border-indigo-200 bg-white shadow-tactile-indigo z-20 hidden sm:block">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                <span className="text-[9px] font-extrabold text-slate-800">Student Identity Pass</span>
                <span className="text-[7px] font-bold text-blue-700 bg-blue-50 px-1 rounded-full">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-indigo-200 bg-[#090D16] shadow-2xs shrink-0">
                  <Image src="/brand/occo-logo.jpg" alt="Logo" width={28} height={28} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-[11px] block leading-none">Aarav Sharma</span>
                  <span className="text-[9px] font-mono text-slate-500 block mt-0.5">PRN-2026-DPS-0491</span>
                </div>
              </div>
            </div>

            {/* FLOATING 3D ELEMENT 2: Offline-First Zero-Latency Badge */}
            <div className="animate-float-delayed absolute -bottom-3 -left-2 sm:-left-4 p-2 rounded-xl border border-emerald-200 bg-white shadow-tactile-emerald z-20 hidden sm:flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-900 block leading-none">
                  Offline-Ready Roll Call
                </span>
                <span className="text-[9px] text-emerald-700 font-medium">
                  Zero Classroom Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 2: TRADITIONAL ERPS VS OURS WITH TRUE 3D PHYSICAL SWITCH
          (Strict Screen-Fit on Desktop, True 3D Borders & Switch)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="comparison"
        className="lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-center py-6 lg:py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white relative"
      >
        <div className="max-w-7xl mx-auto w-full space-y-3 lg:space-y-4">
          {/* HEADER SPLIT: Left Half Content | Right Half Middle: True 3D Physical Switch */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-6 items-center pb-3 border-b border-slate-200/90">
            {/* Left Half (7 cols): User specified headline & text */}
            <div className="md:col-span-7 space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                The Definitive Contrast
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                What Traditional ERPs Don&apos;t Have vs. What We Have
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 max-w-xl leading-relaxed">
                Flip the 3D switch below to compare outdated, rigid legacy software against OCCO Core&apos;s modern architecture.
              </p>
            </div>

            {/* Right Half Middle (5 cols): TRUE 3D PHYSICAL TOGGLE SWITCH (With 3D Borders & Trench) */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-end">
              <div className="switch-3d-chassis">
                <button
                  type="button"
                  onClick={() => setIsModernMode(!isModernMode)}
                  aria-label="Toggle Traditional Legacy ERP vs OCCO Core Modern Platform"
                  className={`relative w-26 sm:w-28 h-12 sm:h-13 cursor-pointer focus:outline-none transition-all duration-300 p-1 flex items-center ${
                    isModernMode ? "switch-3d-trench-active" : "switch-3d-trench"
                  }`}
                >
                  {/* Track Backlit Indicator Status */}
                  <div className="absolute inset-0 flex items-center justify-between px-3.5 pointer-events-none select-none">
                    <span
                      className={`text-[9px] font-black tracking-widest transition-opacity duration-300 ${
                        !isModernMode ? "text-white opacity-100" : "text-slate-400/30 opacity-40"
                      }`}
                    >
                      OFF
                    </span>
                    <span
                      className={`text-[9px] font-black tracking-widest transition-opacity duration-300 ${
                        isModernMode ? "text-white opacity-100" : "text-slate-500/30 opacity-40"
                      }`}
                    >
                      ON
                    </span>
                  </div>

                  {/* 3D Cylindrical Floating Puck (Physical Hardware Feel) */}
                  <div
                    className={`w-9 sm:w-10 h-9 sm:h-10 switch-3d-puck transform flex items-center justify-center ${
                      isModernMode ? "translate-x-13 sm:translate-x-15" : "translate-x-0"
                    }`}
                  >
                    {isModernMode ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-tactile-emerald flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shadow-inner flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Comparison Display with Live Moving 3D Simulation Screen (Compact) */}
          {!isModernMode ? (
            /* STATE A: TRADITIONAL ERP (OFF STATE) */
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="p-2 sm:p-2.5 rounded-xl border-2 border-red-300 bg-slate-100 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-300 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="ml-1 font-mono text-red-700 font-bold">
                      [CRASHED] Legacy-ERP-v2.14.exe • Not Responding
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.2 rounded">
                    Network Disconnected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="md:col-span-8 p-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-[11px]">
                      <span className="font-bold text-red-900 block">
                        Error 504: Database Connection Timed Out
                      </span>
                      <span className="text-red-700 block leading-tight">
                        Wi-Fi disconnected in Room 204. All 42 attendance entries lost. Please re-enter entire sheet.
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-4 p-2 rounded-lg bg-white border border-slate-300 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    <span>Synchronizing (45 mins pending)...</span>
                  </div>
                </div>
              </div>

              {/* 6 Compact Legacy Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {legacyFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-slate-50/80 shadow-2xs space-y-1 grayscale hover:grayscale-0 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-xs">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STATE B: OCCO CORE MODERN PLATFORM (ON STATE) */
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="p-2 sm:p-2.5 rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50/40 via-white to-blue-50/40 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-100 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-2xs" />
                    <div className="w-4 h-4 rounded overflow-hidden bg-[#090D16] border border-slate-200 ml-1 shrink-0">
                      <Image src="/brand/occo-logo.jpg" alt="Logo" width={18} height={18} className="w-full h-full object-cover" />
                    </div>
                    <span className="ml-1 font-mono text-emerald-800 font-bold">
                      portal.institution.edu.in • Zero-Interruption Core Active
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.2 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Zero Internet Needed • Local Sync Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-emerald-200 shadow-2xs flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Wifi className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px]">Classroom Roll Call</span>
                      <span className="text-[9px] text-emerald-700">42 Saved Locally & Auto-Syncing</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-blue-200 shadow-2xs flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px]">Automated Invoicing</span>
                      <span className="text-[9px] text-blue-700">₹14,500 Ledger Reconciled</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-indigo-200 shadow-2xs flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-[11px]">DPDPA 2023 Shield</span>
                      <span className="text-[9px] text-indigo-700">Parental OTP Consent Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Compact Modern Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {modernFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 sm:p-3 rounded-xl border shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 space-y-1 ${item.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold shadow-2xs ${item.iconColor}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-800 bg-white/90 border border-slate-200 px-1.5 py-0.2 rounded-full shadow-2xs">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-xs">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 3: 6 CORE CAPABILITIES (Strict Screen-Fit on Desktop)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="capabilities"
        className="lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-center py-6 lg:py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-[#F8FAFC]"
      >
        <div className="max-w-7xl mx-auto w-full space-y-3 lg:space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Operational Depth
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Engineered for Institutional Reality.
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Zero-downtime offline classrooms, automated fee ledgers, and national statutory compliance.
            </p>
          </div>

          {/* 6 Compact Operational Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {/* Pillar 1: Student Lifecycle */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/30 hover:border-blue-300 hover:shadow-tactile-blue transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full">
                  32 Modules
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Student Lifecycle & ID Registry
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Unique PRN auto-generation, 12-digit Indian national ID verification, digital document vault, and Transfer Certificate generator.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span className="text-blue-700 font-bold">Enquiry</span>
                <span>→</span>
                <span className="text-indigo-700 font-bold">Document Vault</span>
                <span>→</span>
                <span className="text-emerald-700 font-bold">PRN Issued ✓</span>
              </div>
            </div>

            {/* Pillar 2: Automated Fee Billing */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30 hover:border-emerald-300 hover:shadow-tactile-emerald transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Automated Fees
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Automated Fee Invoicing & Ledgers
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Multi-installment scheduling, automated ledger generation, statutory RTE fee waivers, thermal receipts, and pro-rata refund calculations.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span>Tuition Fee</span>
                <span className="text-amber-700 font-bold">-25% Waiver</span>
                <span className="text-emerald-700 font-bold">= Receipt Locked ✓</span>
              </div>
            </div>

            {/* Pillar 3: Offline-First Attendance */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30 hover:border-indigo-300 hover:shadow-tactile-indigo transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
                  <Wifi className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-full">
                  Zero Classroom Lag
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Zero-Interruption Offline Roll Call
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Mark roll calls and exam scores on any device with zero internet. Mutations queue securely and sync the moment Wi-Fi reconnects.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span className="text-emerald-700 font-bold">● Offline Mode</span>
                <span>42 Stored</span>
                <span className="text-blue-700 font-bold">Auto-Synced ✓</span>
              </div>
            </div>

            {/* Pillar 4: NEP 2020 Credit Engine */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-purple-100 bg-gradient-to-b from-white to-purple-50/30 hover:border-purple-300 hover:shadow-tactile-indigo transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full">
                  NEP 2020 CBCS
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Outcome-Based Credit Banking
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Choice Based Credit System (CBCS), multi-disciplinary course allocation, automatic SGPA/CGPA calculations, and tamper-proof marksheet seals.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span>160 Credits</span>
                <span className="text-purple-700 font-bold">SGPA 9.4</span>
                <span className="text-emerald-700 font-bold">Digital Seal ✓</span>
              </div>
            </div>

            {/* Pillar 5: Statutory Compliance Shield */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/30 hover:border-amber-300 hover:shadow-tactile-amber transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                  100% Legal
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Indian Statutory Compliance Shield
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Automated legal guards: DPDPA 2023 minor student privacy, RTE 25% fee waivers, Ministry Coaching under-16 age gates, and immutable logs.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span className="text-emerald-700 font-bold">DPDPA 2023</span>
                <span className="text-blue-700 font-bold">RTE 25%</span>
                <span className="text-amber-700 font-bold">MoE Verified ✓</span>
              </div>
            </div>

            {/* Pillar 6: Multi-Campus Custom Domains */}
            <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 hover:border-slate-400 transition-all duration-300 space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-2xs">
                  <Building className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-full">
                  White-Label
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Enterprise Multi-Campus Portals
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight">
                Host each school, college, or regional campus on its own branded web domain (e.g., portal.yourschool.edu) with strict data isolation.
              </p>
              <div className="p-1 rounded bg-white border border-slate-200 text-[9px] flex items-center justify-between text-slate-600 font-mono">
                <span>portal.dps.edu</span>
                <span>•</span>
                <span>apexuniv.ac.in</span>
                <span className="text-emerald-700 font-bold">SSL Active ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 4: INSTITUTIONAL ARCHETYPES (Strict Screen-Fit on Desktop)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="archetypes"
        className="lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-center py-6 lg:py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white"
      >
        <div className="max-w-7xl mx-auto w-full space-y-3 lg:space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Adaptive Architecture
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              One Unified Engine. Four Educational Models.
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600">
              The platform dynamically transforms terminology and grading rules. Click below to watch the console morph live.
            </p>
          </div>

          {/* Archetype Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => setSelectedArchetype("school")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedArchetype === "school"
                  ? "bg-blue-700 text-white shadow-tactile-blue scale-102"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>K-12 School</span>
            </button>

            <button
              onClick={() => setSelectedArchetype("college")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedArchetype === "college"
                  ? "bg-indigo-700 text-white shadow-tactile-indigo scale-102"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Degree College</span>
            </button>

            <button
              onClick={() => setSelectedArchetype("university")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedArchetype === "university"
                  ? "bg-purple-700 text-white shadow-tactile-indigo scale-102"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Autonomous University</span>
            </button>

            <button
              onClick={() => setSelectedArchetype("coaching")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedArchetype === "coaching"
                  ? "bg-emerald-700 text-white shadow-tactile-emerald scale-102"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Coaching Academy</span>
            </button>
          </div>

          {/* Morphing 3D Preview Window (Compact) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] shadow-md max-w-4xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {activePreset.title} Console
                  </h3>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${activePreset.accentBg}`}>
                    {activePreset.board}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg">
                  {activePreset.description}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">
                  Simulated Campus
                </span>
                <span className="text-xs font-extrabold text-slate-900">
                  {activePreset.sampleInstitute}
                </span>
              </div>
            </div>

            {/* Dynamic Dashboard Strip */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-900 block">
                  {activePreset.dashboardHighlight.title}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {activePreset.dashboardHighlight.subtitle}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  {activePreset.dashboardHighlight.metricLabel}
                </span>
                <span className="text-[11px] font-extrabold text-blue-700 font-mono">
                  {activePreset.dashboardHighlight.metricValue}
                </span>
              </div>
            </div>

            {/* Terminology Adaptation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg border border-slate-200 bg-white">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Cohort Term</span>
                <span className="font-extrabold text-slate-900 text-[11px] mt-0.5 block">{activePreset.cohortUnit}</span>
                <span className="text-[9px] text-slate-500 block truncate">{activePreset.exampleCohort}</span>
              </div>

              <div className="p-2 rounded-lg border border-slate-200 bg-white">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Student ID Format</span>
                <span className="font-extrabold text-slate-900 text-[11px] mt-0.5 block">{activePreset.studentId}</span>
                <span className="text-[9px] text-slate-500 block">Auto-Numbering</span>
              </div>

              <div className="p-2 rounded-lg border border-slate-200 bg-white">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Executive Head</span>
                <span className="font-extrabold text-slate-900 text-[11px] mt-0.5 block">{activePreset.leader}</span>
                <span className="text-[9px] text-slate-500 block">Full RBAC Control</span>
              </div>

              <div className="p-2 rounded-lg border border-slate-200 bg-white">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Regulatory Anchor</span>
                <span className="font-extrabold text-blue-800 text-[11px] mt-0.5 block truncate">{activePreset.statutoryBadge}</span>
                <span className="text-[9px] text-slate-500 block">Enforced in Logic</span>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {activePreset.features.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 5: INDIAN STATUTORY SHIELD (Strict Screen-Fit on Desktop)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="compliance"
        className="lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-center py-6 lg:py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white"
      >
        <div className="max-w-7xl mx-auto w-full space-y-3 lg:space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Legal Baseline
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              100% Indian Statutory Compliance.
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Foreign software solutions fail Indian audits. OCCO Core codifies statutory rules directly into the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 max-w-5xl mx-auto">
            {/* DPDPA 2023 */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  DPDPA 2023: Minor Student Protection
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  Section 9 Verified
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verifiable Parental Consent:</strong> Accounts under 18 require mobile OTP verification from parents.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Commercial Profiling:</strong> Strict ban on commercial tracking, ad pixels, or third-party behavioral profiling.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Grievance Workflow:</strong> Dedicated process to erase non-statutory records within 30 days upon request.</span>
                </li>
              </ul>
            </div>

            {/* RTE Act 2009 */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/40 to-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  RTE Act 2009 & Safety Directives
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                  Section 12(1)(c)
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Automated 25% EWS Waiver:</strong> Zero fee billing automatically applied for all RTE-admitted students.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Reimbursement Claims:</strong> Export verified expense claims formatted for state education departments in 1 click.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Bus Transport Safety:</strong> GPS route tracking and speed limiter compliance logs meeting Supreme Court rules.</span>
                </li>
              </ul>
            </div>

            {/* MoE Coaching 2024 */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/40 to-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  MoE Coaching Center Guidelines 2024
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                  Mandatory National Guard
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Under-16 Enrollment Block:</strong> Rule 4(a) blocks admission for students under 16 in competitive batches.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>10-Day Pro-Rata Refund Engine:</strong> Calculates remaining batch fee refunds automatically for course withdrawals.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Floor Area Safety:</strong> Blocks batch over-allocation to guarantee 1 sqm/student mandate.</span>
                </li>
              </ul>
            </div>

            {/* CERT-In & Communication Security */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50/40 to-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  CERT-In & Communication Norms
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800">
                  National Cyber Directives
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>180-Day Immutable Logs:</strong> System and fee access records stored to fulfill CERT-In cyber audit requirements.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>NTP Time Synchronization:</strong> Clock drift under 1 second synced to National Physical Laboratory atomic clocks.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Official Message Templates:</strong> SMS and WhatsApp notifications strictly conform to registered header standards.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION 6: WALKTHROUGH & FOOTER (Strict Screen-Fit on Desktop)
      ═════════════════════════════════════════════════════════════════════════ */}
      <section
        id="demo"
        className="lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col justify-between py-6 lg:py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#F8FAFC]"
      >
        <div className="max-w-2xl mx-auto w-full my-auto">
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-lg space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Institutional Access
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Experience OCCO Core Live.
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Schedule a confidential architecture walkthrough with our engineering team.
              </p>
            </div>

            {demoSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Walkthrough Request Received
                </h3>
                <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{instituteName}</strong>. Our team will reach out to <strong>{contactEmail}</strong> within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="e.g. Delhi Public School"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Institution Type
                    </label>
                    <select
                      value={instituteType}
                      onChange={(e) => setInstituteType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                    >
                      <option value="K-12 School">K-12 School (CBSE / ICSE / State)</option>
                      <option value="Degree College">Degree College (UGC / NAAC)</option>
                      <option value="Autonomous University">Autonomous University</option>
                      <option value="Coaching Academy">Coaching Academy (JEE / NEET)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="principal@school.edu.in"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">
                      Contact Phone (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-tactile-blue transition-all active:scale-95 cursor-pointer mt-1"
                >
                  Confirm Architecture Walkthrough
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FOOTER with Official Generated Logo */}
        <footer className="border-t border-slate-200/80 bg-white/80 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-slate-200 bg-[#090D16] flex items-center justify-center shrink-0 shadow-2xs">
                <Image
                  src="/brand/occo-logo.jpg"
                  alt="OCCO Core"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-black text-slate-900 text-xs">OCCO Core</span>
              <span className="text-[10px] text-slate-500">• The Education Operating System</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[10px]">
              <span>DPDPA 2023 Compliant</span>
              <span>•</span>
              <span>RTE Act Section 12(1)(c)</span>
              <span>•</span>
              <span>Zero-Downtime Offline Architecture</span>
              <span>•</span>
              <span>MoE Jan 2024 Rules</span>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
