"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  ShieldCheck,
  Building2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Lock,
  Palette,
  Check,
  Hash,
  Sliders,
  Layers,
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";
import {
  getTenantSettingsAction,
  updateTenantSettingsAction,
  verifyTenantDomainAction,
  updateIdNumberingConfigAction,
  applyIdNumberingToExistingStudentsAction,
  TenantDomainRecord,
} from "@/lib/actions/settingActions";
import {
  buildPrnString,
  buildRollNoString,
  DEFAULT_ID_NUMBERING_CONFIG,
  IdNumberingFormatConfig,
} from "@/lib/utils/idFormatUtils";

interface SettingsViewProps {
  archetype: InstitutionalArchetype;
}

export default function SettingsView({ archetype }: SettingsViewProps) {
  const { activeSubTab, brandColor, setBrandColor, theme, isDemoMode, setInstitutionName: setGlobalInstitutionName } = useAdmin();
  const archetypeConfig = ARCHETYPES[archetype] || ARCHETYPES.K12_SCHOOL;
  const terms = archetypeConfig.terms;

  const [institutionName, setInstitutionName] = useState(archetypeConfig.sampleInstituteName);
  const [affiliationCode, setAffiliationCode] = useState(archetypeConfig.affiliationExample);
  const [subdomain, setSubdomain] = useState("apex-academy");
  const [customCname, setCustomCname] = useState("portal.apexacademy.edu.in");
  const [isDnsVerified, setIsDnsVerified] = useState(true);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Profile details
  const [executiveHead, setExecutiveHead] = useState("Dr. M. S. Raghavan, Ph.D.");
  const [registeredAddress, setRegisteredAddress] = useState("Plot 42, Institutional Knowledge Park, Phase 1");
  const [domainsList, setDomainsList] = useState<TenantDomainRecord[]>([]);

  // Branding motto
  const [brandMotto, setBrandMotto] = useState("Excellence in Knowledge and Virtue");

  // ID Numbering Formats (Roll Number & PRN)
  const [idConfig, setIdConfig] = useState<IdNumberingFormatConfig>(DEFAULT_ID_NUMBERING_CONFIG);
  const [isApplyingIds, setIsApplyingIds] = useState(false);
  const [appliedResults, setAppliedResults] = useState<{
    count: number;
    samples: { admissionNo: string; oldRoll: string; newRoll: string; oldPrn: string; newPrn: string }[];
  } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Sync settings with PostgreSQL when not in demo mode
  useEffect(() => {
    if (isDemoMode) return;
    let isMounted = true;
    getTenantSettingsAction("apexacademy")
      .then((res) => {
        if (!isMounted || !res.success || !res.data) return;
        const d = res.data;
        if (d.name) setInstitutionName(d.name);
        if (d.affiliationNo) setAffiliationCode(d.affiliationNo);
        if (d.slug) setSubdomain(d.slug);
        if (d.customDomain) setCustomCname(d.customDomain);
        if (d.motto) setBrandMotto(d.motto);
        if (d.primaryColor) setBrandColor(d.primaryColor);
        if (d.executiveHead) setExecutiveHead(d.executiveHead);
        if (d.registeredAddress) setRegisteredAddress(d.registeredAddress);
        if (d.idNumberingConfig) setIdConfig(d.idNumberingConfig);
        setIsDnsVerified(d.domainVerified);
        if (d.domains) setDomainsList(d.domains);
      })
      .catch((err) => {
        console.warn("Could not load tenant settings from DB:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isDemoMode, setBrandColor]);

  const handleVerifyDns = async () => {
    setIsCheckingDns(true);
    if (!isDemoMode) {
      try {
        const res = await verifyTenantDomainAction({ domain: customCname, slug: "apexacademy" });
        setIsCheckingDns(false);
        if (res.success) {
          setIsDnsVerified(true);
          triggerToast(`CNAME ${customCname} verified! Cloudflare SSL certificate active.`);
        } else {
          triggerToast(`Verification failed: ${res.error || "DNS records pending propagation"}`);
        }
      } catch (err) {
        setIsCheckingDns(false);
        triggerToast(`DNS verification error: ${String(err)}`);
      }
    } else {
      setTimeout(() => {
        setIsCheckingDns(false);
        setIsDnsVerified(true);
        triggerToast(`CNAME ${customCname} verified! Cloudflare SSL certificate active.`);
      }, 1000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (!isDemoMode) {
      try {
        const res = await updateTenantSettingsAction({
          slug: "apexacademy",
          name: institutionName,
          affiliationNo: affiliationCode,
          motto: brandMotto,
          primaryColor: brandColor,
          executiveHead,
          registeredAddress,
        });
        setIsSaving(false);
        if (res.success) {
          if (setGlobalInstitutionName) {
            setGlobalInstitutionName(institutionName);
          }
          triggerToast("Updated institutional profile and settings successfully in database.");
        } else {
          triggerToast(`Failed to update settings: ${res.error}`);
        }
      } catch (err) {
        setIsSaving(false);
        triggerToast(`Error updating settings: ${String(err)}`);
      }
    } else {
      setTimeout(() => {
        setIsSaving(false);
        triggerToast("Updated institutional profile and settings successfully (Demo Mode).");
      }, 500);
    }
  };

  const handleSaveIdConfig = async () => {
    setIsSaving(true);
    try {
      const res = await updateIdNumberingConfigAction({ config: idConfig });
      setIsSaving(false);
      if (res.success) {
        triggerToast("Saved custom Roll No & PRN formatting successfully.");
      } else {
        triggerToast("Failed to save format: " + res.error);
      }
    } catch (err) {
      setIsSaving(false);
      triggerToast("Error saving format: " + String(err));
    }
  };

  const handleApplyToAllStudents = async () => {
    setIsApplyingIds(true);
    try {
      await updateIdNumberingConfigAction({ config: idConfig });
      const res = await applyIdNumberingToExistingStudentsAction("apexacademy");
      setIsApplyingIds(false);
      if (res.success) {
        setAppliedResults({
          count: res.updatedCount,
          samples: res.previewSamples,
        });
        triggerToast(`Applied format & updated ${res.updatedCount} students in database!`);
      } else {
        triggerToast("Failed to apply formatting: " + res.error);
      }
    } catch (err) {
      setIsApplyingIds(false);
      triggerToast("Error applying formats: " + String(err));
    }
  };

  const isBrandingTab = activeSubTab === "branding_theme";
  const isCnameTab = activeSubTab === "subdomain_cname";
  const isDpdpaTab = activeSubTab === "dpdpa_vault";
  const isNumberingTab = activeSubTab === "id_numbering_formats";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-1 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
          <span>Institutional Settings &amp; System Governance</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {archetypeConfig.name}
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {archetype === "K12_SCHOOL" && "Affiliation codes, school crest branding, and parental consent governance."}
          {archetype === "DEGREE_COLLEGE" && "Accreditation grades, university affiliation code, and custom CNAME domains."}
          {archetype === "UNIVERSITY" && "UGC recognition, DigiLocker ABC integration tokens, and data privacy settings."}
          {archetype === "COACHING_ACADEMY" && "Academy GSTIN, center franchise codes, test engine keys, and custom coaching portals."}
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* ══════════════════════════════════════════════════════════════════════
            SUB-TAB 2: BRANDING & LIVE THEME
        ══════════════════════════════════════════════════════════════════════ */}
        {isBrandingTab && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Palette className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm">Visual Identity &amp; Heraldic Branding</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Signature Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs uppercase"
                  />
                  <span className="text-[11px] text-slate-500">Royal Accent Color</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Institutional Motto</label>
                <input
                  type="text"
                  value={brandMotto}
                  onChange={(e) => setBrandMotto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ backgroundColor: brandColor }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{institutionName}</span>
                  <span className="text-[11px] text-slate-500 italic block mt-0.5">&quot;{brandMotto}&quot;</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                0ms Live Sync Active
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isSaving ? "Saving..." : "Save Branding"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SUB-TAB 3: SUBDOMAIN & CNAME DNS
        ══════════════════════════════════════════════════════════════════════ */}
        {isCnameTab && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Globe className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">Custom Domain &amp; Host-Based Routing</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Managed SaaS Subdomain</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-l-xl border border-r-0 border-slate-200 text-xs font-mono font-semibold"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-r-xl text-xs text-slate-500 font-mono">
                    .edusaas.com
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom CNAME Domain</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCname}
                    onChange={(e) => setCustomCname(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDns}
                    disabled={isCheckingDns}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? "animate-spin" : ""}`} />
                    <span>Check DNS</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>DNS CNAME points to <strong>proxy.edusaas.com</strong>. SSL certificate active.</span>
              </div>
              <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${isDnsVerified ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                {isDnsVerified ? "100% Verified" : "Pending DNS Propagation"}
              </span>
            </div>

            {domainsList.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Configured Host Domains in Database</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {domainsList.map((dom) => (
                    <div key={dom.id} className="p-3 bg-slate-50 flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-900">{dom.domain}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {dom.sslStatus} SSL
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SUB-TAB 4: DATA PRIVACY & GOVERNANCE
        ══════════════════════════════════════════════════════════════════════ */}
        {isDpdpaTab && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Data Privacy &amp; Governance</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                Parental Consent Active
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block text-xs">Parental Consent &amp; Student Data Protection</strong>
                <p className="text-[11px] leading-relaxed">
                  For minor students, audit records verify parental consent prior to academic profile processing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Encryption Standard</span>
                  <strong className="text-slate-900 font-mono text-xs">Encrypted At-Rest &amp; In-Transit</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Data Retention Policy</span>
                  <strong className="text-slate-700 font-mono text-xs">Automated Statutory Retention</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SUB-TAB: CUSTOMIZABLE ROLL NO & PRN FORMATS
        ══════════════════════════════════════════════════════════════════════ */}
        {isNumberingTab && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Roll Number &amp; Permanent Registration Number (PRN) Customizer
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Define the exact statutory and institutional naming structure for student identifiers. Select which segments are fixed, dynamic tokens, separators, and sequence padding.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveIdConfig}
                  disabled={isSaving}
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSaving ? "Saving..." : "Save Formats"}</span>
                </button>
              </div>

              {/* Grid with 2 Customizer Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
                {/* CARD 1: UNIVERSITY PRN FORMAT */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>1. University PRN Number Format</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      Permanent ID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Fixed Institutional Prefix</label>
                      <input
                        type="text"
                        value={idConfig.prn.prefix}
                        onChange={(e) =>
                          setIdConfig({
                            ...idConfig,
                            prn: { ...idConfig.prn, prefix: e.target.value.toUpperCase() },
                          })
                        }
                        placeholder="e.g. PRN or UNIV"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Delimiter / Separator</label>
                      <select
                        value={idConfig.prn.separator}
                        onChange={(e) =>
                          setIdConfig({
                            ...idConfig,
                            prn: { ...idConfig.prn, separator: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs cursor-pointer"
                      >
                        <option value="/">Slash ( / )</option>
                        <option value="-">Hyphen ( - )</option>
                        <option value=".">Dot ( . )</option>
                        <option value="">None (Concatenated)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 pt-1">
                        <input
                          type="checkbox"
                          checked={idConfig.prn.includeYear}
                          onChange={(e) =>
                            setIdConfig({
                              ...idConfig,
                              prn: { ...idConfig.prn, includeYear: e.target.checked },
                            })
                          }
                          className="rounded border-slate-300 text-blue-600"
                        />
                        <span>Include Academic Year</span>
                      </label>
                      {idConfig.prn.includeYear && (
                        <div className="flex items-center gap-2 pl-5 pt-1">
                          <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                            <input
                              type="radio"
                              name="yearFormat"
                              checked={idConfig.prn.yearFormat === "YYYY"}
                              onChange={() =>
                                setIdConfig({
                                  ...idConfig,
                                  prn: { ...idConfig.prn, yearFormat: "YYYY" },
                                })
                              }
                            />
                            <span>2026 (4-digit)</span>
                          </label>
                          <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                            <input
                              type="radio"
                              name="yearFormat"
                              checked={idConfig.prn.yearFormat === "YY"}
                              onChange={() =>
                                setIdConfig({
                                  ...idConfig,
                                  prn: { ...idConfig.prn, yearFormat: "YY" },
                                })
                              }
                            />
                            <span>26 (2-digit)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sequence Digits</label>
                      <select
                        value={idConfig.prn.seqDigits}
                        onChange={(e) =>
                          setIdConfig({
                            ...idConfig,
                            prn: { ...idConfig.prn, seqDigits: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs cursor-pointer"
                      >
                        <option value={3}>3 Digits (001 - 999)</option>
                        <option value={4}>4 Digits (0001 - 9999)</option>
                        <option value={5}>5 Digits (00001 - 99999)</option>
                        <option value={6}>6 Digits (000001 - 999999)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 mb-1">
                      <input
                        type="checkbox"
                        checked={idConfig.prn.includeDept}
                        onChange={(e) =>
                          setIdConfig({
                            ...idConfig,
                            prn: { ...idConfig.prn, includeDept: e.target.checked },
                          })
                        }
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Include Department / Program Code (e.g. CSE, ECE, MED)</span>
                    </label>
                  </div>

                  {/* Live PRN Preview Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      Live Generated PRN Sample:
                    </span>
                    <div className="text-sm font-mono font-extrabold text-slate-900 tracking-wider">
                      {buildPrnString(idConfig.prn, { year: 2026, dept: "CSE", seq: 1 })}
                    </div>
                  </div>
                </div>

                {/* CARD 2: STUDENT ROLL NUMBER FORMAT */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>2. Student Roll Number Format</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Class / Exam Seat
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Numbering Mode</label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setIdConfig({
                            ...idConfig,
                            rollNo: { ...idConfig.rollNo, mode: "NUMERIC" },
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          idConfig.rollNo.mode === "NUMERIC"
                            ? "bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block text-xs">Simple Numeric</span>
                        <span className="text-[10px] text-slate-500 block">Sequential: 1, 2, 3, 4...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setIdConfig({
                            ...idConfig,
                            rollNo: { ...idConfig.rollNo, mode: "FORMATTED" },
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          idConfig.rollNo.mode === "FORMATTED"
                            ? "bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block text-xs">Formatted Alphanumeric</span>
                        <span className="text-[10px] text-slate-500 block">Structured with Prefix &amp; Padding</span>
                      </button>
                    </div>
                  </div>

                  {idConfig.rollNo.mode === "FORMATTED" && (
                    <div className="space-y-3 pt-1 border-t border-slate-200/60 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Fixed Prefix</label>
                          <input
                            type="text"
                            value={idConfig.rollNo.prefix}
                            onChange={(e) =>
                              setIdConfig({
                                ...idConfig,
                                rollNo: { ...idConfig.rollNo, prefix: e.target.value.toUpperCase() },
                              })
                            }
                            placeholder="e.g. ROLL or SEAT"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Delimiter</label>
                          <select
                            value={idConfig.rollNo.separator}
                            onChange={(e) =>
                              setIdConfig({
                                ...idConfig,
                                rollNo: { ...idConfig.rollNo, separator: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs cursor-pointer"
                          >
                            <option value="/">Slash ( / )</option>
                            <option value="-">Hyphen ( - )</option>
                            <option value=".">Dot ( . )</option>
                            <option value="">None</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Sequence Digits</label>
                          <select
                            value={idConfig.rollNo.seqDigits}
                            onChange={(e) =>
                              setIdConfig({
                                ...idConfig,
                                rollNo: { ...idConfig.rollNo, seqDigits: Number(e.target.value) },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-xs cursor-pointer"
                          >
                            <option value={2}>2 Digits (01 - 99)</option>
                            <option value={3}>3 Digits (001 - 999)</option>
                            <option value={4}>4 Digits (0001 - 9999)</option>
                          </select>
                        </div>

                        <div className="pt-5">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={idConfig.rollNo.includeCohort}
                              onChange={(e) =>
                                setIdConfig({
                                  ...idConfig,
                                  rollNo: { ...idConfig.rollNo, includeCohort: e.target.checked },
                                })
                              }
                              className="rounded border-slate-300 text-blue-600"
                            />
                            <span>Include Cohort / Section</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Roll No Preview Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      Live Generated Roll Number Sample:
                    </span>
                    <div className="text-sm font-mono font-extrabold text-slate-900 tracking-wider">
                      {buildRollNoString(idConfig.rollNo, { year: 2026, cohort: "10-A", seq: 1 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar: Apply to All Enrolled Students */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <span>Batch Operations: Update student database records to conform to newly saved scheme.</span>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToAllStudents}
                  disabled={isApplyingIds}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isApplyingIds ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                  <span>{isApplyingIds ? "Applying to Database..." : "Apply & Generate for All Enrolled Students"}</span>
                </button>
              </div>

              {/* Sample Updated Table Preview */}
              {appliedResults && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Successfully Updated {appliedResults.count} Student Records in PostgreSQL</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">Live Database Synced</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-emerald-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Admission No</th>
                          <th className="py-2 px-3">Old Roll No</th>
                          <th className="py-2 px-3">Updated Roll No</th>
                          <th className="py-2 px-3">Old PRN</th>
                          <th className="py-2 px-3">Updated PRN Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {appliedResults.samples.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">{s.admissionNo}</td>
                            <td className="py-2 px-3 text-slate-400 line-through">{s.oldRoll}</td>
                            <td className="py-2 px-3 font-bold text-emerald-700">{s.newRoll}</td>
                            <td className="py-2 px-3 text-slate-400 line-through">{s.oldPrn}</td>
                            <td className="py-2 px-3 font-bold text-indigo-700">{s.newPrn}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            DEFAULT SUB-TAB: INSTITUTE LEGAL PROFILE & ACCREDITATION
        ══════════════════════════════════════════════════════════════════════ */}
        {(!isBrandingTab && !isCnameTab && !isDpdpaTab && !isNumberingTab) && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm">Institutional Identity &amp; Accreditation</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Legal Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Accreditation / Regulatory Code</label>
                <input
                  type="text"
                  value={affiliationCode}
                  onChange={(e) => setAffiliationCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Executive Head / {terms.leaderTitle}</label>
                <input
                  type="text"
                  value={executiveHead}
                  onChange={(e) => setExecutiveHead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registered Campus Address</label>
                <input
                  type="text"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: theme.primary }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isSaving ? "Saving..." : "Save Identity Profile"}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
