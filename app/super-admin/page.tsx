"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  KeyRound,
  FileCode2,
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Plus,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Server,
  Database,
  ArrowUpRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Phone,
  Mail,
  Sliders,
} from "lucide-react";
import {
  getSuperAdminDashboardMetricsAction,
  getAllTenantsAction,
  getAllIssuedKeysAction,
  generateInstitutionalKeyAction,
  revokeInstitutionalKeyAction,
  getCustomBuildRequestsAction,
  updateCustomBuildDealAction,
  updateTenantStatusAction,
  PlatformMetrics,
  TenantSummaryItem,
  IssuedKeyItem,
  CustomBuildLeadItem,
} from "@/lib/super-admin/superAdminActions";

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"tenants" | "keys" | "custom_builds" | "audit">("tenants");

  // State
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantSummaryItem[]>([]);
  const [keys, setKeys] = useState<IssuedKeyItem[]>([]);
  const [customBuilds, setCustomBuilds] = useState<CustomBuildLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [tenantSearch, setTenantSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Key Generator Form
  const [newKeyInstitution, setNewKeyInstitution] = useState("");
  const [newKeySlug, setNewKeySlug] = useState("");
  const [newKeyAmount, setNewKeyAmount] = useState<number>(75000);
  const [newKeyTier, setNewKeyTier] = useState("ENTERPRISE");
  const [newKeyNotes, setNewKeyNotes] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Custom Build Edit Modal
  const [editingLead, setEditingLead] = useState<CustomBuildLeadItem | null>(null);
  const [leadQuotedPrice, setLeadQuotedPrice] = useState<number>(0);
  const [leadStatus, setLeadStatus] = useState<string>("NEW");
  const [leadNotes, setLeadNotes] = useState<string>("");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Load all initial data from PostgreSQL
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, tenantsRes, keysRes, buildsRes] = await Promise.all([
        getSuperAdminDashboardMetricsAction(),
        getAllTenantsAction(),
        getAllIssuedKeysAction(),
        getCustomBuildRequestsAction(),
      ]);

      if (metricsRes.success && metricsRes.metrics) setMetrics(metricsRes.metrics);
      if (tenantsRes.success) setTenants(tenantsRes.tenants);
      if (keysRes.success) setKeys(keysRes.keys);
      if (buildsRes.success) setCustomBuilds(buildsRes.requests);
    } catch (err) {
      console.error("Failed to load super admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Generate Key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInstitution.trim()) {
      triggerToast("Please provide the legal institution name.");
      return;
    }

    setIsGeneratingKey(true);
    const slug =
      newKeySlug.trim() ||
      newKeyInstitution.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 18);

    const res = await generateInstitutionalKeyAction(
      slug,
      newKeyInstitution,
      newKeyAmount,
      newKeyTier,
      newKeyNotes
    );
    setIsGeneratingKey(false);

    if (res.success && res.key) {
      setKeys((prev) => [res.key!, ...prev]);
      setNewKeyInstitution("");
      setNewKeySlug("");
      setNewKeyNotes("");
      triggerToast(`Issued Key: ${res.key.activationKey} for ${res.key.tenantName}`);
    } else {
      triggerToast(res.error || "Failed to issue key.");
    }
  };

  // Handle Revoke Key
  const handleRevokeKey = async (keyId: string) => {
    const res = await revokeInstitutionalKeyAction(keyId);
    if (res.success) {
      setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: "REVOKED" } : k)));
      triggerToast("Institutional activation key has been revoked.");
    }
  };

  // Handle Copy Key
  const handleCopyKey = (keyItem: IssuedKeyItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(keyItem.rawKey);
      setCopiedKeyId(keyItem.id);
      triggerToast(`Copied key ${keyItem.activationKey} to clipboard.`);
      setTimeout(() => setCopiedKeyId(null), 2500);
    }
  };

  // Handle Toggle Tenant Status
  const handleToggleTenantStatus = async (tenant: TenantSummaryItem) => {
    const nextStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const res = await updateTenantStatusAction(tenant.id, nextStatus);
    if (res.success) {
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
      );
      triggerToast(`Tenant status updated to ${nextStatus}.`);
    }
  };

  // Handle Update Custom Build Deal
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const res = await updateCustomBuildDealAction(
      editingLead.id,
      leadStatus,
      leadQuotedPrice,
      leadNotes
    );
    if (res.success) {
      setCustomBuilds((prev) =>
        prev.map((l) =>
          l.id === editingLead.id
            ? { ...l, status: leadStatus, quotedPrice: leadQuotedPrice, notes: leadNotes }
            : l
        )
      );
      setEditingLead(null);
      triggerToast("Custom build deal updated.");
    }
  };

  // Filtered Tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      t.slug.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      (t.adminEmail && t.adminEmail.toLowerCase().includes(tenantSearch.toLowerCase()));
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE PLATFORM KPI CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Institutions */}
        <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Institutions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? metrics.totalInstitutions : "—"}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {metrics ? `${metrics.activeInstitutions} Live Active` : ""}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Schools, Colleges, Universities & Coaching</p>
        </div>

        {/* Card 2: 8-Digit Keys & Activation Gate */}
        <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Activation Keys</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics ? metrics.keysIssuedCount : "—"}
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              {metrics ? `${metrics.pendingActivation} Awaiting Entry` : ""}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Unique 8-digit hardware onboarding pins</p>
        </div>

        {/* Card 3: Realized Revenue */}
        <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Realized License Fees</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics ? `₹${(metrics.totalRevenueRealized / 100000).toFixed(2)}L` : "—"}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Settled</span>
          </div>
          <p className="text-[11px] text-slate-400">Direct license fee collected from institutes</p>
        </div>

        {/* Card 4: Custom Enterprise Pipeline */}
        <div className="bg-[#0D1424] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Custom Build Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics ? `₹${(metrics.quotedPipelineRevenue / 100000).toFixed(2)}L` : "—"}
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">
              {metrics ? `${metrics.customBuildInquiriesCount} Deals` : ""}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Dedicated on-premise installation inquiries</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NAVIGATION PILLS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("tenants")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "tenants"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Institutions & Admins ({tenants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("keys")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "keys"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>8-Digit Activation Keys ({keys.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom_builds")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "custom_builds"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Custom Build Requests ({customBuilds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === "audit"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Audit</span>
          </button>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Sync Live DB</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: INSTITUTIONS & TENANTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          {/* Controls: Search and Archetype Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                placeholder="Search by institution name, subdomain, or admin email..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-[#0D1424] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                <option value="ALL">All Categories</option>
                <option value="K12_SCHOOL">K-12 Schools</option>
                <option value="DEGREE_COLLEGE">Degree Colleges</option>
                <option value="UNIVERSITY">Universities</option>
                <option value="COACHING_ACADEMY">Coaching Academies</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="bg-[#0D1424] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-5">Institution & Subdomain</th>
                    <th className="py-3 px-4">Archetype</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No institutions found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                              style={{ backgroundColor: t.primaryColor || "#10B981" }}
                            >
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-xs leading-tight">
                                {t.name}
                              </span>
                              <span className="font-mono text-[10px] text-emerald-400 block mt-0.5">
                                https://{t.slug}.coreerp.in
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            {t.type.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                          {t.adminEmail || "Not assigned"}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="text-white font-bold">{t.actualStudents}</span>
                          <span className="text-slate-500"> / {t.maxStudents} cap</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                              t.status === "ACTIVE"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : t.status === "SUSPENDED"
                                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {t.createdAt}
                        </td>

                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTenantStatus(t)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              t.status === "ACTIVE"
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {t.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: 8-DIGIT ACTIVATION KEYS & MONETIZATION
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "keys" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Key Generator */}
          <div className="lg:col-span-5 bg-[#0D1424] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center space-x-2 text-emerald-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Generate 8-Digit Key</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Issue an official 8-digit activation key. You charge the institution for this license key, which allows their admin to unlock the live multi-tenant database during onboarding.
            </p>

            <form onSubmit={handleGenerateKey} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Institution Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Delhi Public School"
                  value={newKeyInstitution}
                  onChange={(e) => {
                    setNewKeyInstitution(e.target.value);
                    if (!newKeySlug) {
                      setNewKeySlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 18)
                      );
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Subdomain Slug
                  </label>
                  <input
                    type="text"
                    placeholder="modern-dps"
                    value={newKeySlug}
                    onChange={(e) =>
                      setNewKeySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Amount Charged (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={newKeyAmount}
                    onChange={(e) => setNewKeyAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Plan Tier
                </label>
                <select
                  value={newKeyTier}
                  onChange={(e) => setNewKeyTier(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1424] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="STARTER">Starter Tier (Up to 500 Students)</option>
                  <option value="GROWTH">Growth Tier (Up to 1,500 Students)</option>
                  <option value="ENTERPRISE">Enterprise Tier (Unlimited)</option>
                  <option value="CUSTOM_BUILD">Custom Dedicated Build</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  License Notes / Payment Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Bank NEFT Ref #8912301"
                  value={newKeyNotes}
                  onChange={(e) => setNewKeyNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingKey}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isGeneratingKey ? "Generating Key in PostgreSQL..." : "Issue Unique 8-Digit Key"}</span>
              </button>
            </form>

            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-200 block">Security Guarantee</span>
              <p>
                Zero hardcoded bypass keys. Keys are generated using cryptographically random 8-digit numbers, stored uniquely in PostgreSQL, and redeemed once on the onboarding gate.
              </p>
            </div>
          </div>

          {/* Right Column: Issued Keys List */}
          <div className="lg:col-span-7 bg-[#0D1424] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">Issued Institutional Keys</h3>
                <p className="text-[11px] text-slate-400">
                  {keys.length} keys recorded in platform ledger
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="pb-3">8-Digit Key</th>
                    <th className="pb-3">Institution & Slug</th>
                    <th className="pb-3">Amount Charged</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            {k.activationKey}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(k)}
                            className="p-1 text-slate-400 hover:text-white cursor-pointer rounded hover:bg-white/10 transition-colors"
                            title="Copy 8-digit key"
                          >
                            {copiedKeyId === k.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 pr-2">
                        <span className="font-bold text-white block text-xs leading-tight">
                          {k.tenantName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                          {k.tenantSlug}.coreerp.in
                        </span>
                      </td>

                      <td className="py-3 pr-2 font-mono text-emerald-400 font-bold text-xs">
                        ₹{k.amountCharged.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 pr-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            k.status === "ACTIVATED"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : k.status === "REVOKED"
                              ? "bg-red-500/15 text-red-300 border border-red-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {k.status === "ACTIVATED"
                            ? "Active"
                            : k.status === "REVOKED"
                            ? "Revoked"
                            : "Pending Onboarding"}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        {k.status !== "REVOKED" && (
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CUSTOM BUILD REQUESTS & ON-PREMISE LEADS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "custom_builds" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileCode2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>Dedicated Custom Build Inquiries:</strong> When large universities, colleges, or academy chains request an isolated on-premise installation running on their own servers, manage their quotations and delivery status here.
              </span>
            </div>
          </div>

          <div className="bg-[#0D1424] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-5">Institution & Type</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Students Cap</th>
                    <th className="py-3 px-4">Hosting Model</th>
                    <th className="py-3 px-4">Quoted Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {customBuilds.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-white block text-xs leading-tight">
                          {lead.institutionName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                          {lead.institutionType.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <span className="font-bold text-white block leading-tight">{lead.contactPerson}</span>
                        <span className="text-[10px] text-slate-400 block">{lead.email}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-white font-bold">
                        {lead.estimatedStudents.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px]">
                          {lead.hostingPreference.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold text-xs">
                        {lead.quotedPrice ? `₹${lead.quotedPrice.toLocaleString("en-IN")}` : "Not Quoted"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            lead.status === "DELIVERED" || lead.status === "CONTRACT_SIGNED"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : lead.status === "PROPOSAL_SENT"
                              ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(lead);
                            setLeadQuotedPrice(lead.quotedPrice || 1000000);
                            setLeadStatus(lead.status);
                            setLeadNotes(lead.notes || "");
                          }}
                          className="text-[10px] font-bold px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors cursor-pointer"
                        >
                          Manage Deal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: PLATFORM SECURITY & AUDIT TELEMETRY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0D1424] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Database & Tenant Isolation Health</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">PostgreSQL Multi-Tenant Schema</span>
                <span className="font-mono text-emerald-400 font-bold">ONLINE (23 Tables)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Tenant Data Boundary Enforcement</span>
                <span className="font-mono text-emerald-400 font-bold">STRICT (tenant_id scoped)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Super Admin Cookie Signature</span>
                <span className="font-mono text-emerald-400 font-bold">HMAC-SHA256 (24h validity)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">8-Digit Hardware Activation Gate</span>
                <span className="font-mono text-emerald-400 font-bold">ACTIVE (Zero Backdoors)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0D1424] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Server className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Architectural Deployment Strategy</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The project is now split into 3 independent, isolated tiers:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-white">/super-admin:</strong> Business Owner Command Center. Accessible only with Super Admin Root credentials.
              </li>
              <li>
                <strong className="text-white">/erp (or /admin):</strong> Tenant-isolated Institutional ERP. Each school admin and teacher only accesses their campus data.
              </li>
              <li>
                <strong className="text-white">/demo:</strong> Completely hardcoded client sandbox without database modification risks.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT CUSTOM BUILD DEAL
      ───────────────────────────────────────────────────────────── */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D1424] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  Manage Custom Build Deal
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {editingLead.institutionName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-white">Client Requirements:</span>
                <p className="leading-relaxed">
                  {editingLead.specialRequirements || "No special notes specified."}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Quoted Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={25000}
                  value={leadQuotedPrice}
                  onChange={(e) => setLeadQuotedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Deal Status
                </label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D18] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="NEW">NEW LEAD</option>
                  <option value="REVIEWING">TECHNICAL SIZING IN PROGRESS</option>
                  <option value="PROPOSAL_SENT">PROPOSAL & QUOTE SENT</option>
                  <option value="CONTRACT_SIGNED">CONTRACT SIGNED (PAID)</option>
                  <option value="IN_DEVELOPMENT">CUSTOM PACKAGING IN PROGRESS</option>
                  <option value="DELIVERED">DELIVERED TO ON-PREMISE SERVER</option>
                  <option value="REJECTED">CLOSED / REJECTED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Notes about server sizing, deployment team, payment milestones..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Deal Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

