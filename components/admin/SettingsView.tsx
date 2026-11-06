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
} from "lucide-react";
import { InstitutionalArchetype, ARCHETYPES } from "@/lib/terminology";
import { useAdmin } from "@/lib/admin/adminContext";
import {
  getTenantSettingsAction,
  updateTenantSettingsAction,
  verifyTenantDomainAction,
  TenantDomainRecord,
} from "@/lib/actions/settingActions";

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

  const isBrandingTab = activeSubTab === "branding_theme";
  const isCnameTab = activeSubTab === "subdomain_cname";
  const isDpdpaTab = activeSubTab === "dpdpa_vault";

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
            DEFAULT SUB-TAB: INSTITUTE LEGAL PROFILE & ACCREDITATION
        ══════════════════════════════════════════════════════════════════════ */}
        {(!isBrandingTab && !isCnameTab && !isDpdpaTab) && (
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
