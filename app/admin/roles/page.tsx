"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Hash,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ShieldCheck,
  X,
  Save,
} from "lucide-react";
import {
  ROLE_DEFINITIONS,
  RoleConfig,
  SYSTEM_MODULES,
  INITIAL_USER_ACCOUNTS,
  ManagedUserAccount,
  registerCustomRole,
} from "@/lib/auth/roles";

export default function AdminRolesPage() {
  // Active Tab: "roles_matrix" | "user_pins" | "security_policies"
  const [activeTab, setActiveTab] = useState<"roles_matrix" | "user_pins" | "security_policies">("roles_matrix");

  // Local state for all roles (starts from ROLE_DEFINITIONS)
  const [roles, setRoles] = useState<Record<string, RoleConfig>>({ ...ROLE_DEFINITIONS });
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("ADMIN");

  // Local state for user accounts & PINs
  const [userAccounts, setUserAccounts] = useState<ManagedUserAccount[]>([...INITIAL_USER_ACCOUNTS]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Modals state
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);

  // Edit User Form State
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [newPinVal, setNewPinVal] = useState("");
  const [showModalPin, setShowModalPin] = useState(false);
  const [mustResetVal, setMustResetVal] = useState(false);
  const [statusVal, setStatusVal] = useState<"ACTIVE" | "PENDING_FIRST_LOGIN" | "LOCKED">("ACTIVE");

  // New Role Form State
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleCategory, setNewRoleCategory] = useState<"staff" | "student" | "parent" | "custom">("staff");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleRoute, setNewRoleRoute] = useState("");
  const [newRoleModules, setNewRoleModules] = useState<string[]>(["academics"]);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Toggle module access for a specific role
  const handleToggleModuleForRole = (roleKey: string, moduleId: string) => {
    setRoles((prev) => {
      const currentRole = prev[roleKey];
      if (!currentRole) return prev;

      const exists = currentRole.allowedModules.includes(moduleId);
      const updatedModules = exists
        ? currentRole.allowedModules.filter((m) => m !== moduleId)
        : [...currentRole.allowedModules, moduleId];

      const updated = {
        ...prev,
        [roleKey]: {
          ...currentRole,
          allowedModules: updatedModules,
        },
      };

      // Also sync to global registry
      ROLE_DEFINITIONS[roleKey] = updated[roleKey];
      return updated;
    });

    triggerToast(`Updated module permissions for ${roleKey}`);
  };

  // Open Edit User Modal
  const openEditUser = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setNewPasswordVal(user.defaultPassword || "");
    setNewPinVal(user.pin);
    setShowModalPin(false);
    setMustResetVal(user.mustChangePinOnLogin);
    setStatusVal(user.status);
    setIsEditUserModalOpen(true);
  };

  // Save User Password & 4-Digit PIN
  const handleSaveUserCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!newPinVal || !/^\d{4}$/.test(newPinVal)) {
      alert("Error: Security PIN must be strictly 4 numeric digits.");
      return;
    }

    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === editingUser.id) {
          return {
            ...acc,
            pin: newPinVal,
            defaultPassword: newPasswordVal,
            status: statusVal,
            mustChangePinOnLogin: mustResetVal,
          };
        }
        return acc;
      })
    );

    setIsEditUserModalOpen(false);
    triggerToast(`Saved new Password & 4-Digit PIN (${newPinVal}) for ${editingUser.name}`);
  };

  // Create New Custom Role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedKey = newRoleKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    if (!formattedKey || !newRoleLabel) {
      alert("Please provide a valid Role Key and Label.");
      return;
    }

    const createdRole: RoleConfig = {
      key: formattedKey,
      label: newRoleLabel,
      category: newRoleCategory,
      description: newRoleDesc || "Custom institutional role configured by administrator.",
      authStrategy: "email_password_pin",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      defaultRoute: newRoleRoute || "/staff/dashboard",
      iconName: "Shield",
      isCustom: true,
      permissions: newRoleModules.map((m) => `${m}:*`),
      allowedModules: newRoleModules,
    };

    // Register into memory and update UI
    registerCustomRole(createdRole);
    setRoles((prev) => ({
      ...prev,
      [formattedKey]: createdRole,
    }));

    setIsNewRoleModalOpen(false);
    setSelectedRoleKey(formattedKey);
    setNewRoleKey("");
    setNewRoleLabel("");
    setNewRoleDesc("");
    triggerToast(`Successfully registered new role: ${newRoleLabel} (${formattedKey})`);
  };

  const filteredUsers = userAccounts.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roleKey.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Admin Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              O
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">OCCO Core</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Administrator Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Apex International Academy • Access & PIN Governance</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>3-Tier Auth Mandate: Email + Password + 4-Digit PIN Active</span>
          </div>
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Portal Login</span>
          </Link>
        </div>
      </header>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center space-x-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Title & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-700" />
              <span>Role Permissions, Module Access & 4-Digit PIN Governance</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure system roles, granular module permissions, and manage user passwords and 4-digit PINs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsNewRoleModalOpen(true)}
              className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-xl">
          <button
            type="button"
            onClick={() => setActiveTab("roles_matrix")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "roles_matrix"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Role & Module Access Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("user_pins")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "user_pins"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Users, Passwords & 4-Digit PINs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security_policies")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "security_policies"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security Policies</span>
          </button>
        </div>

        {/* TAB 1: ROLE & MODULE ACCESS MATRIX */}
        {activeTab === "roles_matrix" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Role Selector List */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Configured Roles ({Object.keys(roles).length})
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Extensible Engine
                </span>
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {Object.values(roles).map((role) => {
                  const isSelected = selectedRoleKey === role.key;
                  return (
                    <div
                      key={role.key}
                      onClick={() => setSelectedRoleKey(role.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{role.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${role.badgeColor}`}>
                          {role.key}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{role.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                        <span>Modules: <strong className="text-slate-700">{role.allowedModules.length}</strong>/11</span>
                        <span className="capitalize text-slate-400">{role.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Granular Module Access Control for Selected Role */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              {roles[selectedRoleKey] && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {roles[selectedRoleKey].label}
                        </h2>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${roles[selectedRoleKey].badgeColor}`}>
                          {selectedRoleKey}
                        </span>
                        {roles[selectedRoleKey].isCustom && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                            Custom Role
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {roles[selectedRoleKey].description}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400">Default Route:</span>{" "}
                      <code className="text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">
                        {roles[selectedRoleKey].defaultRoute}
                      </code>
                    </div>
                  </div>

                  {/* Module Toggle Matrix */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Authorized System Modules ({roles[selectedRoleKey].allowedModules.length} Active)
                      </h3>
                      <span className="text-[11px] text-slate-500">Click any module to grant or revoke access</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SYSTEM_MODULES.map((mod) => {
                        const isGranted = roles[selectedRoleKey].allowedModules.includes(mod.id);
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleToggleModuleForRole(selectedRoleKey, mod.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                              isGranted
                                ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300"
                                : "bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}}
                              className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {mod.name}
                                </h4>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {mod.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {mod.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER ACCOUNTS, PASSWORDS & 4-DIGIT PIN DIRECTORY */}
        {activeTab === "user_pins" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Institutional Users, Passwords & 4-Digit Security PIN Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every user must present their Email + Password + 4-Digit PIN to unlock their portal. Administrators can reset passwords and update PINs at any time.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user, email or role..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* User Directory Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Mandatory 4-Digit PIN</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Module Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          ROLE_DEFINITIONS[user.roleKey]?.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {user.roleKey}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-slate-800 tracking-widest">
                            {user.pin}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">✓ Active</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : user.status === "PENDING_FIRST_LOGIN"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <strong>{user.allowedModules.length}</strong> modules enabled
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditUser(user)}
                          className="py-1 px-3 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-700 hover:text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Manage Password & PIN →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INSTITUTIONAL SECURITY POLICIES */}
        {activeTab === "security_policies" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Institutional Credential & 4-Digit PIN Security Policies
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure tenant-wide access rules adhering to DPDPA 2023, CBSE IT mandates, and ISO 27001 zero-trust controls.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-blue-900">
                    Mandatory 4-Digit Security PIN on All Logins
                  </h3>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    When active, no staff, student, or parent can sign in using only email and password. A valid 4-digit numeric PIN is strictly required to unlock any portal session.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-full shrink-0">
                  ENFORCED
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Auto-Lock Account after 3 Failed PIN Attempts
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Protects against brute-force attacks. After 3 consecutive incorrect PIN entries, the account status switches to LOCKED and requires an administrator reset.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full shrink-0">
                  ACTIVE
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Cryptographic PIN Storage (Argon2id Hashing)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    All 4-digit PINs are salted with tenant-specific HMAC keys and hashed using Argon2id before storage in PostgreSQL, preventing exposure during database backups.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full shrink-0">
                  COMPLIANT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: EDIT USER PASSWORD & 4-DIGIT PIN */}
        {isEditUserModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manage Credentials & 4-Digit PIN
                  </h3>
                  <p className="text-xs text-slate-500">{editingUser.name} ({editingUser.email})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserCredentials} className="space-y-4 text-xs">
                {/* Change Password */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Set User Password
                  </label>
                  <input
                    type="text"
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="New account password..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
                    required
                  />
                </div>

                {/* Change 4-Digit Security PIN */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-blue-900 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-blue-700" />
                      <span>4-Digit Security PIN *</span>
                    </label>
                    <span className="text-[10px] font-bold text-blue-700 font-mono">Exactly 4 Digits</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showModalPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={newPinVal}
                      onChange={(e) => setNewPinVal(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="e.g. 2468"
                      className="w-full pl-3 pr-10 py-2 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-lg tracking-widest text-center"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPin(!showModalPin)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showModalPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-blue-800">
                    The user must enter this exact 4-digit PIN when signing into their portal.
                  </p>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as ManagedUserAccount["status"])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized to Sign In)</option>
                    <option value="PENDING_FIRST_LOGIN">PENDING FIRST LOGIN (Must complete onboarding)</option>
                    <option value="LOCKED">LOCKED (Temporarily Disabled)</option>
                  </select>
                </div>

                {/* Force Reset Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mustResetVal}
                      onChange={(e) => setMustResetVal(e.target.checked)}
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span className="text-[11px] text-slate-700">
                      Force user to change password and PIN upon their next login
                    </span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditUserModalOpen(false)}
                    className="py-2 px-3 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Password & PIN</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE NEW CUSTOM ROLE */}
        {isNewRoleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Register New Custom Institutional Role
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define custom roles (e.g. Lab Incharge, Dean of Research, Trustee Auditor).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomRole} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Role Code / Identifier *
                    </label>
                    <input
                      type="text"
                      value={newRoleKey}
                      onChange={(e) => setNewRoleKey(e.target.value)}
                      placeholder="e.g. LAB_HEAD"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Role Display Title *
                    </label>
                    <input
                      type="text"
                      value={newRoleLabel}
                      onChange={(e) => setNewRoleLabel(e.target.value)}
                      placeholder="e.g. Laboratory Incharge"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Portal Category
                    </label>
                    <select
                      value={newRoleCategory}
                      onChange={(e) =>
                        setNewRoleCategory(
                          e.target.value as "staff" | "student" | "parent" | "custom"
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    >
                      <option value="staff">Staff / Faculty</option>
                      <option value="student">Student Portal</option>
                      <option value="parent">Parent Portal</option>
                      <option value="custom">Custom Portal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Default Dashboard Route
                    </label>
                    <input
                      type="text"
                      value={newRoleRoute}
                      onChange={(e) => setNewRoleRoute(e.target.value)}
                      placeholder="/staff/lab-inventory"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role Description
                  </label>
                  <input
                    type="text"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Brief summary of duties and responsibilities..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                {/* Module selection for new role */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Authorized Modules for this Role
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {SYSTEM_MODULES.map((m) => {
                      const isChecked = newRoleModules.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setNewRoleModules(newRoleModules.filter((x) => x !== m.id));
                              } else {
                                setNewRoleModules([...newRoleModules, m.id]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewRoleModalOpen(false)}
                    className="py-2 px-3 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Role in Registry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OCCO Core Systems Inc. Enterprise Grade Multi-Tenant Academic OS. Role & PIN Governance Console.
      </footer>
    </div>
  );
}
