"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Smartphone,
  Radio,
  X,
  Plus,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";

interface BroadcastRecord {
  id: string;
  title: string;
  channel: "WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal";
  targetAudience: string;
  timestamp: string;
  recipientsCount: number;
  deliveryRate: string;
  content: string;
  archetype: InstitutionalArchetype;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  bodyPreview: string;
  language: string;
  status: "APPROVED (Meta Verified)" | "PENDING_REVIEW";
  archetype: InstitutionalArchetype;
}

interface DltSmsLog {
  id: string;
  headerSenderId: string;
  peid: string;
  templateId: string;
  recipientPhone: string;
  messageSnippet: string;
  charCount: number;
  deliveredAt: string;
  status: "DELIVERED" | "QUEUED";
}

const SAMPLE_BROADCASTS: BroadcastRecord[] = [
  // School
  {
    id: "bc-1",
    title: "Parent-Teacher Conference (PTC) Schedule Announcement",
    channel: "WhatsApp & SMS",
    targetAudience: "All Parents (Nursery to Class 12)",
    timestamp: "Today • 09:30 AM",
    recipientsCount: 1240,
    deliveryRate: "99.4%",
    content: "Dear Parents, Term 1 Parent-Teacher Conferences are scheduled for Saturday 9:00 AM. Please book your 15-minute slot through the parent portal.",
    archetype: "K12_SCHOOL",
  },
  {
    id: "bc-2",
    title: "Winter Uniform & Bus Schedule Update",
    channel: "WhatsApp Only",
    targetAudience: "Junior Wing Parents",
    timestamp: "Yesterday • 04:15 PM",
    recipientsCount: 480,
    deliveryRate: "99.8%",
    content: "Notice: Mandatory switch to winter blazer and sweater effective Monday. Morning bus pickups will commence 10 minutes earlier on Route 4 & 7.",
    archetype: "K12_SCHOOL",
  },
  // College
  {
    id: "bc-201",
    title: "Campus Placement Drive 2026-27: Tier 1 Tech Day",
    channel: "WhatsApp & SMS",
    targetAudience: "B.Tech Final Year (CSE & ECE)",
    timestamp: "2 Nov 2026 • 11:00 AM",
    recipientsCount: 240,
    deliveryRate: "98.8%",
    content: "Campus recruitment drive commences next Monday. Eligible students with CGPA > 8.0 must upload resume PDFs to the placement portal before Friday 5 PM.",
    archetype: "DEGREE_COLLEGE",
  },
  // University
  {
    id: "bc-301",
    title: "38th Annual Convocation Robe Distribution & Rehearsal",
    channel: "In-App Portal",
    targetAudience: "Graduating PG & Ph.D. Scholars",
    timestamp: "1 Nov 2026 • 02:00 PM",
    recipientsCount: 850,
    deliveryRate: "100%",
    content: "The 38th University Convocation will be held at the Main Auditorium. Gown collection counter open from 10 AM to 4 PM at the Central Library foyer.",
    archetype: "UNIVERSITY",
  },
  // Coaching
  {
    id: "bc-401",
    title: "All-India Mock Test #4 Answer Key & Rank List Live",
    channel: "WhatsApp & SMS",
    targetAudience: "Rankers Super-30 & Champions NEET",
    timestamp: "Today • 08:00 AM",
    recipientsCount: 320,
    deliveryRate: "99.7%",
    content: "Sunday Grand Test #4 results and video solutions are now live! Check your All-India Rank, question-wise time analysis, and negative marking scorecards.",
    archetype: "COACHING_ACADEMY",
  },
];

const SAMPLE_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "wt-1",
    name: "attendance_absent_alert_v2",
    triggerEvent: "Classroom Roll Call marked Absent",
    bodyPreview: "Dear Parent, your child {{1}} was marked ABSENT today ({{2}}) in {{3}}. For queries, reply to this official institution line.",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "K12_SCHOOL",
  },
  {
    id: "wt-2",
    name: "dynamic_fee_upi_receipt",
    triggerEvent: "Counter / Online Fee Payment",
    bodyPreview: "Dear Parent, thank you for paying ₹{{1}} towards invoice #{{2}}. Click here to download your tax invoice receipt: {{3}}",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "K12_SCHOOL",
  },
  {
    id: "wt-201",
    name: "hall_ticket_admit_card_release",
    triggerEvent: "Semester Exam Hall Ticket Generated",
    bodyPreview: "Dear {{1}}, your semester hall ticket for {{2}} is ready. Verify your exam seat number and center rules here: {{3}}",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "DEGREE_COLLEGE",
  },
  {
    id: "wt-401",
    name: "test_series_air_scorecard",
    triggerEvent: "Weekly Mock Test Evaluation",
    bodyPreview: "Dear Parent, {{1}} secured All-India Rank {{2}} in Mock Test #{{3}} with score {{4}}/300. Detailed analysis attached.",
    language: "en_IN",
    status: "APPROVED (Meta Verified)",
    archetype: "COACHING_ACADEMY",
  },
];

const SAMPLE_DLT_LOGS: DltSmsLog[] = [
  { id: "dlt-1", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930491", recipientPhone: "+91 9845497084", messageSnippet: "Aarav Sharma marked ABSENT today. - APEX ACD", charCount: 46, deliveredAt: "Today • 08:35 AM", status: "DELIVERED" },
  { id: "dlt-2", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930492", recipientPhone: "+91 9444123890", messageSnippet: "Fee due reminder for Rohan Varma: ₹22,000 due on 25 Oct. - APEX ACD", charCount: 68, deliveredAt: "Yesterday • 05:00 PM", status: "DELIVERED" },
  { id: "dlt-3", headerSenderId: "APXACD", peid: "140129384729104", templateId: "110716182930493", recipientPhone: "+91 9820123456", messageSnippet: "Paid ₹24,500 via Dynamic UPI QR for Aarav Sharma. Rec #891. - APEX ACD", charCount: 71, deliveredAt: "Today • 10:46 AM", status: "DELIVERED" },
];

interface CommunicationViewProps {
  archetype: InstitutionalArchetype;
}

export default function CommunicationView({ archetype }: CommunicationViewProps) {
  const { activeSubTab, theme } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;

  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(SAMPLE_BROADCASTS);
  const [toastMessage, setToastMessage] = useState("");
  const [isComposeModal, setIsComposeModal] = useState(false);

  // New Circular Form State
  const [circularTitle, setCircularTitle] = useState("");
  const [circularAudience, setCircularAudience] = useState("All Parents");
  const [circularChannel, setCircularChannel] = useState<"WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal">("WhatsApp & SMS");
  const [circularContent, setCircularContent] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularContent.trim()) return;

    const newBroadcast: BroadcastRecord = {
      id: `bc-${Date.now().toString().slice(-4)}`,
      title: circularTitle,
      channel: circularChannel,
      targetAudience: circularAudience,
      timestamp: "Today • Just now",
      recipientsCount: 450,
      deliveryRate: "99.9%",
      content: circularContent,
      archetype,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsComposeModal(false);
    setCircularTitle("");
    setCircularContent("");
    triggerToast(`Broadcast '${newBroadcast.title}' dispatched to 450 recipients.`);
  };

  // Filter for active archetype
  const activeBroadcasts = broadcasts.filter((b) => b.archetype === archetype);
  const displayBroadcasts = activeBroadcasts.length > 0 ? activeBroadcasts : broadcasts.slice(0, 3);

  const activeTemplates = SAMPLE_WHATSAPP_TEMPLATES.filter((t) => t.archetype === archetype);
  const displayTemplates = activeTemplates.length > 0 ? activeTemplates : SAMPLE_WHATSAPP_TEMPLATES.slice(0, 2);

  const isWhatsappTab = activeSubTab === "whatsapp_pushes";
  const isDltTab = activeSubTab === "sms_dlt_logs";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <span>Omnichannel Broadcasts &amp; DLT Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {archetypeConfig.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {archetype === "K12_SCHOOL" && "Official WhatsApp Business API, TRAI DLT statutory SMS, and bus delay announcements."}
            {archetype === "DEGREE_COLLEGE" && "Placement drive bulletins, semester exam schedules, and departmental notices."}
            {archetype === "UNIVERSITY" && "Chancellor circulars, annual convocation notices, and campus security bulletins."}
            {archetype === "COACHING_ACADEMY" && "All-India Mock Test scorecards, top ranker leaderboards, and parent performance alerts."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsComposeModal(true)}
          style={{ backgroundColor: theme.primary }}
          className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>Compose New Circular</span>
        </button>
      </div>

      {/* KPI Metric Pods */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official WhatsApp Gateway</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 block mt-0.5 font-sans">
            99.8% Open Rate
          </span>
          <span className="text-[10px] text-emerald-600 mt-1 block">Meta Verified Tier 2</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Govt DLT SMS Header</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block mt-0.5 font-sans">
            #APXACD
          </span>
          <span className="text-[10px] text-blue-600 mt-1 block">TRAI PEID 140129384</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Messages Today</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            2,480
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">0 Failed Transmissions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DND / Quiet Hours</span>
          <span className="text-sm font-extrabold text-amber-800 block mt-1">
            08:00 PM - 07:00 AM
          </span>
          <span className="text-[10px] text-amber-600 mt-1 block">Staff Privacy Shielded</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 2: AUTOMATED WHATSAPP PUSHES
      ══════════════════════════════════════════════════════════════════════ */}
      {isWhatsappTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Meta Official WhatsApp Business API Templates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated event-triggered notifications with 99%+ read rates and zero phone number leakage.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              Meta Webhook Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayTemplates.map((wt) => (
              <div key={wt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{wt.name}</span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {wt.status}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200/60 shadow-2xs text-xs text-slate-800 font-sans space-y-1">
                  <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Trigger: {wt.triggerEvent}
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{wt.bodyPreview}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Language: {wt.language}</span>
                  <button
                    onClick={() => triggerToast(`Dispatched test template ping for ${wt.name}.`)}
                    className="text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    Test Template →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: GOVT DLT SMS LOGS
      ══════════════════════════════════════════════════════════════════════ */}
      {isDltTab && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-700" />
                <span>Statutory TRAI DLT SMS Gateway Logs</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Indian telecommunications mandate: Every transaction carries registered PEID and approved Template ID.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
              DLT Compliance 100%
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {SAMPLE_DLT_LOGS.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between px-2 hover:bg-slate-50 rounded-xl text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-900 text-xs">{log.headerSenderId}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-mono text-[11px]">{log.recipientPhone}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-0.5">{log.messageSnippet}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    {log.status}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                    {log.deliveredAt} • {log.charCount} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: EMERGENCY BROADCASTS ARCHIVE
      ══════════════════════════════════════════════════════════════════════ */}
      {(!isWhatsappTab && !isDltTab) && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif">Recent Institutional Broadcasts</h3>
              <span className="text-xs text-slate-500 font-mono">Transmission Ledger</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {displayBroadcasts.map((bc) => (
              <div key={bc.id} className="py-4 px-2 hover:bg-slate-50 rounded-2xl transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs block">{bc.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {bc.deliveryRate} Delivered ({bc.recipientsCount} recipients)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{bc.content}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target: {bc.targetAudience} • Channel: {bc.channel}</span>
                  <span className="font-mono">{bc.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          COMPOSE NEW CIRCULAR MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-slate-900 text-sm">Compose New Institutional Circular</h3>
              </div>
              <button onClick={() => setIsComposeModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Circular Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={circularTitle}
                  onChange={(e) => setCircularTitle(e.target.value)}
                  placeholder="e.g. Schedule for Annual Examinations"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={circularAudience}
                    onChange={(e) => setCircularAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="All Parents">All Parents</option>
                    <option value="Faculty & Staff">Faculty &amp; Staff</option>
                    <option value="Bus Commuters">Bus Route Commuters</option>
                    <option value="Final Year Students">Final Year Students</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Channel</label>
                  <select
                    value={circularChannel}
                    onChange={(e) => setCircularChannel(e.target.value as "WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="WhatsApp & SMS">WhatsApp &amp; SMS (Fallback)</option>
                    <option value="WhatsApp Only">WhatsApp Only</option>
                    <option value="Govt DLT SMS">Govt DLT SMS</option>
                    <option value="In-App Portal">In-App Portal Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={circularContent}
                  onChange={(e) => setCircularContent(e.target.value)}
                  placeholder="Enter official circular content..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Circular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
