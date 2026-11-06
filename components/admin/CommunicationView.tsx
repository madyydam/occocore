"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import {
  DEMO_BROADCASTS,
  DEMO_WHATSAPP_TEMPLATES,
  DEMO_DLT_LOGS,
} from "@/lib/demo/demoMockData";
import {
  getBroadcastsAction,
  createBroadcastAction,
  getRealDltSmsLogsAction,
} from "@/lib/actions/communicationActions";

export interface BroadcastRecord {
  id: string;
  title: string;
  channel: "WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal";
  targetAudience: string;
  timestamp: string;
  recipientsCount: number;
  deliveryRate: string;
  content: string;
  archetype: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  bodyPreview: string;
  language: string;
  status: "APPROVED (Meta Verified)" | "PENDING_REVIEW";
  archetype: InstitutionalArchetype;
}

export interface DltSmsLog {
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

interface CommunicationViewProps {
  archetype: InstitutionalArchetype;
}

export default function CommunicationView({ archetype }: CommunicationViewProps) {
  const { activeSubTab, theme, isDemoMode } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;

  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(() =>
    isDemoMode ? (DEMO_BROADCASTS as BroadcastRecord[]) : []
  );
  const [dltLogs, setDltLogs] = useState<DltSmsLog[]>(() =>
    isDemoMode ? (DEMO_DLT_LOGS as DltSmsLog[]) : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isComposeModal, setIsComposeModal] = useState(false);

  // New Circular Form State
  const [circularTitle, setCircularTitle] = useState("");
  const [circularAudience, setCircularAudience] = useState("All Parents & Guardians");
  const [circularChannel, setCircularChannel] = useState<
    "WhatsApp & SMS" | "WhatsApp Only" | "Govt DLT SMS" | "In-App Portal"
  >("WhatsApp & SMS");
  const [circularContent, setCircularContent] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const refreshBroadcasts = useCallback(() => {
    if (isDemoMode) {
      setBroadcasts(DEMO_BROADCASTS as BroadcastRecord[]);
      setDltLogs(DEMO_DLT_LOGS as DltSmsLog[]);
      return;
    }

    setIsLoading(true);
    Promise.all([
      getBroadcastsAction(archetype),
      getRealDltSmsLogsAction(),
    ])
      .then(([bcRes, dltRes]) => {
        if (bcRes.success) setBroadcasts(bcRes.broadcasts as BroadcastRecord[]);
        if (dltRes.success) setDltLogs(dltRes.logs as DltSmsLog[]);
      })
      .catch((err) => {
        console.error("Failed to load communication records:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isDemoMode, archetype]);

  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;

    Promise.all([
      getBroadcastsAction(archetype),
      getRealDltSmsLogsAction(),
    ])
      .then(([bcRes, dltRes]) => {
        if (isMounted) {
          if (bcRes.success) setBroadcasts(bcRes.broadcasts as BroadcastRecord[]);
          if (dltRes.success) setDltLogs(dltRes.logs as DltSmsLog[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load communication records:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, archetype]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularContent.trim()) return;

    if (isDemoMode) {
      const newBroadcast: BroadcastRecord = {
        id: `bc-${broadcasts.length + 101}`,
        title: circularTitle,
        channel: circularChannel,
        targetAudience: circularAudience,
        timestamp: "Today • Just now",
        recipientsCount: 48,
        deliveryRate: "99.9%",
        content: circularContent,
        archetype,
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setIsComposeModal(false);
      setCircularTitle("");
      setCircularContent("");
      triggerToast(`Broadcast '${newBroadcast.title}' dispatched to ${newBroadcast.recipientsCount} recipients.`);
      return;
    }

    const res = await createBroadcastAction({
      title: circularTitle,
      channel: circularChannel,
      targetAudience: circularAudience,
      content: circularContent,
    });

    if (res.success) {
      setIsComposeModal(false);
      setCircularTitle("");
      setCircularContent("");
      triggerToast(`Broadcast '${circularTitle}' recorded and dispatched via PostgreSQL.`);
      refreshBroadcasts();
    } else {
      alert(res.error || "Failed to dispatch broadcast");
    }
  };

  // Filter for active broadcasts
  const displayBroadcasts = broadcasts;

  const activeTemplates = isDemoMode
    ? DEMO_WHATSAPP_TEMPLATES.filter((t) => t.archetype === archetype)
    : [];
  const displayTemplates = isDemoMode
    ? (activeTemplates.length > 0 ? activeTemplates : DEMO_WHATSAPP_TEMPLATES.slice(0, 2))
    : [];

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
            {!isDemoMode && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 text-blue-800 border border-blue-200">
                PostgreSQL Live
              </span>
            )}
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

      {isLoading && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
          Connecting to institution communication gateway and audit trail...
        </div>
      )}

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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Broadcasts Sent</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5 font-sans">
            {broadcasts.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Active Circulars</span>
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
                Pre-approved statutory communication templates automatically dispatched on critical triggers.
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              Verified Webhook Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayTemplates.map((wt) => (
              <div key={wt.id} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900">{wt.name}</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {wt.status}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Trigger: {wt.triggerEvent}</span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{wt.bodyPreview}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-medium">
                  <span>Language: {wt.language}</span>
                  <button
                    onClick={() => triggerToast(`Dispatched test WhatsApp push for ${wt.name}`)}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Test Push →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUB-TAB 3: GOVT TRAI DLT SMS AUDIT LOGS
      ══════════════════════════════════════════════════════════════════════ */}
      {isDltTab && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-700" />
                <span>Statutory Govt TRAI DLT SMS Dispatch Audit Logs</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every outgoing transactional SMS is cryptographically stamped with Principal Entity ID (PEID) and Telemarketer Chain.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Header: #APXACD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Header / Sender ID</th>
                  <th className="py-3.5 px-6">DLT Template ID</th>
                  <th className="py-3.5 px-6">Recipient Phone</th>
                  <th className="py-3.5 px-6">SMS Body Snippet</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">DLT Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dltLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {row.headerSenderId}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">
                      {row.templateId}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-800">
                      {row.recipientPhone}
                    </td>
                    <td className="py-4 px-6 text-slate-700 max-w-xs truncate">
                      {row.messageSnippet}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {row.deliveredAt}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT SUB-TAB: ACTIVE CIRCULARS & BROADCASTS FEED
      ══════════════════════════════════════════════════════════════════════ */}
      {!isWhatsappTab && !isDltTab && (
        <div className="space-y-3">
          {displayBroadcasts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Audience: {item.targetAudience} • {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    {item.channel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
                    {item.recipientsCount} Recipients
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Delivery Success Rate: {item.deliveryRate}</span>
                </span>

                <div className="flex items-center gap-2">
                  {/* Quick WhatsApp Share */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${item.title}\n\n${item.content}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <span>Share on WhatsApp →</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: COMPOSE NEW CIRCULAR
      ══════════════════════════════════════════════════════════════════════ */}
      {isComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">Compose Omnichannel Circular</h3>
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
                  placeholder="e.g. Schedule for Annual Sports Meet 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                    <option value="All Parents & Guardians">All Parents & Guardians</option>
                    <option value="Class 10 & 12 Board Batches">Class 10 & 12 Board Batches</option>
                    <option value="Hostel Residents">Hostel Residents</option>
                    <option value="Transport Bus Commuters">Transport Bus Commuters</option>
                    <option value="All Faculty & Staff">All Faculty & Staff</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dispatch Gateway</label>
                  <select
                    value={circularChannel}
                    onChange={(e) => setCircularChannel(e.target.value as BroadcastRecord["channel"])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="WhatsApp & SMS">WhatsApp & SMS</option>
                    <option value="WhatsApp Only">WhatsApp Only</option>
                    <option value="Govt DLT SMS">Govt DLT SMS</option>
                    <option value="In-App Portal">In-App Portal Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Circular Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={circularContent}
                  onChange={(e) => setCircularContent(e.target.value)}
                  placeholder="Type official message body..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs cursor-pointer hover:opacity-90 flex items-center gap-1.5"
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
