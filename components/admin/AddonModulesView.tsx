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

interface AddonModulesViewProps {
  moduleType: "library" | "transport" | "hostel" | "placements";
  archetype?: InstitutionalArchetype;
}

export default function AddonModulesView({ moduleType }: AddonModulesViewProps) {
  const { theme, activeSubTab } = useAdmin();
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
    const bookList = [
      { id: "BK-101", title: "Higher Engineering Mathematics", author: "B.S. Grewal", isbn: "978-81-7409-195-5", borrower: "Aarav Sharma", due: "08 Nov 2026", status: "Checked Out" },
      { id: "BK-102", title: "Concepts of Physics (Vol 1 & 2)", author: "H.C. Verma", isbn: "978-81-7709-187-0", borrower: "Priya Nair", due: "10 Nov 2026", status: "Checked Out" },
      { id: "BK-103", title: "Principles of Anatomy & Physiology", author: "Tortora & Derrickson", isbn: "978-11-1970-138-5", borrower: "Kabir Khan", due: "02 Nov 2026", status: "Overdue" },
      { id: "BK-104", title: "Organic Chemistry: Structure & Reactivity", author: "Morrison & Boyd", isbn: "978-93-3257-789-3", borrower: "Ananya Deshmukh", due: "15 Nov 2026", status: "Reserved" },
    ].filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.borrower.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <span>Library & RFID Catalog Desk</span>
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
              <span className="text-2xl font-black text-slate-900 block">18,450</span>
              <span className="text-xs font-semibold text-slate-500">Cataloged Physical Titles</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">⏱️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">842</span>
              <span className="text-xs font-semibold text-slate-500">Currently in Circulation</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">⚠️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">14</span>
              <span className="text-xs font-semibold text-slate-500">Overdue Reminders</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">💻</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">6,200</span>
              <span className="text-xs font-semibold text-slate-500">E-Journals & E-Books</span>
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
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Accession</th>
                  <th className="py-3 px-2">Title & Author</th>
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
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. TRANSPORT & GPS MODULE
  // ══════════════════════════════════════════════════════════════════════════
  if (moduleType === "transport") {
    const routes = [
      { id: "RT-01", name: "North Ring Road Express", busNo: "DL-01-AB-4021", driver: "Ramesh Gurjar (9811223344)", stops: "7 Stops", status: "GPS Online", speed: "34 km/h" },
      { id: "RT-02", name: "Metro Station feeder", busNo: "DL-01-CD-8910", driver: "Mohd. Aslam (9822334455)", stops: "5 Stops", status: "GPS Online", speed: "28 km/h" },
      { id: "RT-03", name: "South City Expressway", busNo: "DL-01-EF-3321", driver: "Gurpreet Singh (9833445566)", stops: "9 Stops", status: "Parked / Idle", speed: "0 km/h" },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
              <Bus className="w-7 h-7" style={{ color: theme.primary }} />
              <span>Transport & Live Fleet GPS Tracking</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time telemetry, parent bus tracker broadcast & RTO fitness permits.
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
              <span className="text-2xl font-black text-slate-900 block">14 / 14</span>
              <span className="text-xs font-semibold text-slate-500">Fleet Buses Online</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">👥</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">680</span>
              <span className="text-xs font-semibold text-slate-500">Students Commuting</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">📡</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">100%</span>
              <span className="text-xs font-semibold text-slate-500">AIS-140 GPS Compliance</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Active Bus Routes & Real-Time Telemetry</h2>
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
              <span>Hostel, Boarding & Mess Dining</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Room allocations, biometric warden gate-passes & weekly mess nutritional plans.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">🛏️</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">240 / 250</span>
              <span className="text-xs font-semibold text-slate-500">Beds Occupied (96%)</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">🍲</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">720</span>
              <span className="text-xs font-semibold text-slate-500">Meals Served Today</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">🚪</div>
            <div>
              <span className="text-2xl font-black text-slate-900 block">3</span>
              <span className="text-xs font-semibold text-slate-500">Pending Gate Pass Requests</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Hostel Blocks & Digital Gate-Pass Authorizations</h2>
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
              <p className="text-[11px] text-slate-600">Total 120 Rooms • 24/7 CCTV & RFID Gate • Warden: Mrs. S. Pillai</p>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "98%", backgroundColor: theme.primary }} />
              </div>
            </div>
          </div>
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
            <span>Campus Placements & Corporate Recruitment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recruiter directory, campus drives, CTC compensation analytics & offer letters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">💼</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">₹28.5L</span>
            <span className="text-xs font-semibold text-slate-500">Highest CTC Package</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">📈</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">₹8.4L</span>
            <span className="text-xs font-semibold text-slate-500">Average CTC Package</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">🎯</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">142</span>
            <span className="text-xs font-semibold text-slate-500">Offers Extended</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">🏢</div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">38</span>
            <span className="text-xs font-semibold text-slate-500">Active Recruiters</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Upcoming Campus Recruitment Drives</h2>
        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-900 block">Tata Consultancy Services (TCS Digital)</span>
              <span className="text-[11px] text-slate-500">Eligible: Final Year Computer Engineering & IT • CTC: ₹7.5 LPA</span>
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
      </div>
    </div>
  );
}
