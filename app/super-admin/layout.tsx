import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  KeyRound,
  FileCode2,
  LogOut,
  Sparkles,
  Server,
  Activity,
} from "lucide-react";
import { getSuperAdminSession } from "@/lib/auth/security";

export const instant = false;

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSuperAdminSession();

  // Route Guard: If not logged in as Super Admin, redirect to /super-admin/login
  if (!session) {
    redirect("/super-admin/login");
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Fixed Executive Header */}
      <header className="sticky top-0 z-40 bg-[#090E1B]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xl">
        {/* Left: Brand & Platform Hierarchy */}
        <div className="flex items-center space-x-4">
          <Link href="/super-admin" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                Core Super Admin
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Business Owner
                </span>
              </span>
              <span className="text-[11px] text-slate-400 tracking-wide mt-1">
                Central Multi-Tenant Control Plane
              </span>
            </div>
          </Link>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden lg:flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PostgreSQL 16 Multi-Tenant</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="text-slate-400">Isolated Tenant Scopes</span>
        </div>

        {/* Right: Owner Profile & True Logout */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white leading-tight">
              {session.fullName || "Platform Owner"}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono leading-tight">
              {session.email}
            </span>
          </div>

          <form action="/api/super-admin/auth/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold transition-colors cursor-pointer"
              title="Secure Super Admin Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 px-8 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 max-w-7xl mx-auto">
        <span>© 2026 Core Platform Owner Infrastructure • Architecture Tier 1 Root</span>
        <span>Dedicated Enterprise Super Admin Console</span>
      </footer>
    </div>
  );
}

