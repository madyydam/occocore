"use client";

import React, { useState } from "react";
import {
  BookMarked,
  Bus,
  BedDouble,
  Briefcase,
  Search,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/adminContext";
import { InstitutionalArchetype } from "@/lib/terminology";
import { DEMO_LIBRARY_BOOKS, DEMO_TRANSPORT_ROUTES, DemoLibraryBook, DemoTransportRoute } from "@/lib/demo/demoMockData";

interface AddonModulesViewProps {
  moduleType: "library" | "transport" | "hostel" | "placements";
  archetype?: InstitutionalArchetype;
}

export default function AddonModulesView({ moduleType }: AddonModulesViewProps) {
  const { theme, activeSubTab, isDemoMode } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. LIBRARY & RFID MODULE
  // ══════════════════════════════════════════════════════════════════════════
  if (moduleType === "library") {
    const rawBooks: DemoLibraryBook[] = isDemoMode ? DEMO_LIBRARY_BOOKS : [];
    const bookList = rawBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.borrower.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2" style={{ backgroundColor: theme.primary }}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
              <BookMarked className="w-7 h-7" style={{ color: theme.primary }} />
              <span>Library &amp; RFID Catalog Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated barcode/RFID check-in, circulation logs, and digital textbook inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerToast("Opened New Book ISBN Acquisition Modal.")}
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-all self-start sm:self-auto"
          >
            + Add New Book Title
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">📚</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "18,450" : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">Cataloged Physical Titles</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">⏱️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "842" : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">Currently in Circulation</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">⚠️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">0</span>
              <span className="text-xs font-semibold text-slate-500">Overdue Reminders</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">💻</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "6,200" : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">E-Journals &amp; E-Books</span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, borrower..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">Sub-Tab: {activeSubTab}</span>
          </div>

          <div className="overflow-x-auto">
            {bookList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No active library loans or accession records registered yet. Click &quot;+ Add New Book Title&quot; to catalog your library collection.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Accession</th>
                    <th className="py-3 px-2">Title &amp; Author</th>
                    <th className="py-3 px-2">Borrower</th>
                    <th className="py-3 px-2">Due Date</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookList.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-slate-700">{b.id}</td>
                      <td className="py-3 px-2">
                        <span className="font-bold text-slate-900 block">{b.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium">by {b.author}</span>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-800">{b.borrower}</td>
                      <td className="py-3 px-2 font-mono text-slate-600">{b.due}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === "Overdue" ? "bg-red-100 text-red-800" : b.status === "Checked Out" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => triggerToast(`Processed return for ${b.id}`)}
                          className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-[11px] cursor-pointer"
                        >
                          Return / Renew
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TRANSPORT & GPS MODULE
  // ══════════════════════════════════════════════════════════════════════════
  if (moduleType === "transport") {
    const routes: DemoTransportRoute[] = isDemoMode ? DEMO_TRANSPORT_ROUTES : [];

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
              <Bus className="w-7 h-7" style={{ color: theme.primary }} />
              <span>Transport &amp; Live Fleet GPS Tracking</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time telemetry, parent bus tracker broadcast &amp; RTO fitness permits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerToast("Pushed Live ETA to Parent WhatsApp Groups.")}
            style={{ backgroundColor: theme.primary }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-all self-start sm:self-auto"
          >
            Broadcast Fleet Status
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">🚍</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "14 / 14" : "0 / 0"}</span>
              <span className="text-xs font-semibold text-slate-500">Fleet Buses Online</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">👥</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "680" : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">Students Commuting</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">📡</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "100%" : "Standby"}</span>
              <span className="text-xs font-semibold text-slate-500">AIS-140 GPS Compliance</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Active Bus Routes &amp; Real-Time Telemetry</h2>
          {routes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              No active GPS fleet routes registered yet. Configure your transport routes and IoT GPS devices to start live telemetry tracking.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {routes.map((r) => (
                <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                      {r.id}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{r.name}</span>
                      <span className="text-[11px] text-slate-500 block">Bus: {r.busNo} • {r.driver}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.stops}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {r.status} ({r.speed})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. HOSTEL & BOARDING MODULE
  // ══════════════════════════════════════════════════════════════════════════
  if (moduleType === "hostel") {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
              <BedDouble className="w-7 h-7" style={{ color: theme.primary }} />
              <span>Hostel, Boarding &amp; Mess Dining</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Room allocations, biometric warden gate-passes &amp; weekly mess nutritional plans.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">🛏️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "240 / 250" : "0 / 0"}</span>
              <span className="text-xs font-semibold text-slate-500">Beds Occupied</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">🍲</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "720" : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">Meals Served Today</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">🚪</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">0</span>
              <span className="text-xs font-semibold text-slate-500">Pending Gate Pass Requests</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Hostel Blocks &amp; Digital Gate-Pass Authorizations</h2>
          {isDemoMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Block A (Senior Residency)</span>
                <p className="text-[11px] text-slate-600">Total 120 Rooms • Biometric Terminal Online • Warden: Dr. K. Verma</p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "94%", backgroundColor: theme.primary }} />
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Block B (Junior / Foundation Residency)</span>
                <p className="text-[11px] text-slate-600">Total 120 Rooms • 24/7 CCTV &amp; RFID Gate • Warden: Mrs. S. Pillai</p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "98%", backgroundColor: theme.primary }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              No hostel blocks configured yet. Add room and dormitory records to initialize residential accommodations.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. PLACEMENTS & INTERNSHIPS MODULE
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
            <Briefcase className="w-7 h-7" style={{ color: theme.primary }} />
            <span>Campus Placements &amp; Corporate Recruitment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recruiter directory, campus drives, CTC compensation analytics &amp; offer letters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">💼</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "₹28.5L" : "₹0"}</span>
            <span className="text-xs font-semibold text-slate-500">Highest CTC Package</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">📈</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "₹8.4L" : "₹0"}</span>
            <span className="text-xs font-semibold text-slate-500">Average CTC Package</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">🎯</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "142" : "0"}</span>
            <span className="text-xs font-semibold text-slate-500">Offers Extended</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">🏢</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">{isDemoMode ? "38" : "0"}</span>
            <span className="text-xs font-semibold text-slate-500">Active Recruiters</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Upcoming Campus Recruitment Drives</h2>
        {isDemoMode ? (
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Tata Consultancy Services (TCS Digital)</span>
                <span className="text-[11px] text-slate-500">Eligible: Final Year Computer Engineering &amp; IT • CTC: ₹7.5 LPA</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">12 Nov 2026</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Infosys Limited (Specialist Programmer)</span>
                <span className="text-[11px] text-slate-500">Eligible: B.Tech / BCA / MCA graduates with &gt; 7.5 CGPA • CTC: ₹9.5 LPA</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">18 Nov 2026</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No campus placement recruitment drives scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}
