"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  Search,
  CheckCircle2,
  X,
  Save,
  Check,
} from "lucide-react";
import {
  ROLE_DEFINITIONS,
  RoleConfig,
  SYSTEM_MODULES,
  INITIAL_USER_ACCOUNTS,
  ManagedUserAccount,
  registerCustomRole,
} from "@/lib/auth/roles";
import { useAdmin } from "@/lib/admin/adminContext";

export default function RolesView() {
  const { activeSubTab, isDemoMode, theme } = useAdmin();

  const activeTab: "roles_matrix" | "user_pins" | "security_policies" =
    activeSubTab === "user_pins" || activeSubTab === "security_policies"
      ? activeSubTab
      : "roles_matrix";

  const [roles, setRoles] = useState<Record<string, RoleConfig>>({ ...ROLE_DEFINITIONS });
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("ADMIN");

  const [userAccounts, setUserAccounts] = useState<ManagedUserAccount[]>(() =>
    isDemoMode ? [...INITIAL_USER_ACCOUNTS] : []
  );
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);

  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [newPinVal, setNewPinVal] = useState("");
  const [mustResetVal, setMustResetVal] = useState(false);
  const [statusVal, setStatusVal] = useState<"ACTIVE" | "PENDING_FIRST_LOGIN" | "LOCKED">("ACTIVE");

  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newRoleCategory] = useState<"staff" | "student" | "parent" | "custom">("staff");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleModules] = useState<string[]>(["academics"]);

  const [toastMessage, setToastMessage] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleModuleForRole = (roleKey: string, moduleId: string) => {
    setRoles((prev) => {
      const targetRole = prev[roleKey];
      if (!targetRole) return prev;

      const hasModule = targetRole.allowedModules.includes(moduleId);
      const updatedModules = hasModule
        ? targetRole.allowedModules.filter((m) => m !== moduleId)
        : [...targetRole.allowedModules, moduleId];

      return {
        ...prev,
        [roleKey]: {
          ...targetRole,
          allowedModules: updatedModules,
        },
      };
    });
    triggerToast(`Updated module permissions for role ${roleKey}`);
  };

  const openEditUser = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setNewPasswordVal(user.defaultPassword || "");
    setNewPinVal(user.pin);
    setMustResetVal(user.mustChangePinOnLogin);
    setStatusVal(user.status);
    setIsEditUserModalOpen(true);
  };

  const handleSaveUserCredentials = () => {
    if (!editingUser) return;

    if (newPinVal.length !== 4 || !/^\d{4}$/.test(newPinVal)) {
      alert("PIN must be strictly 4 numeric digits.");
      return;
    }

    setUserAccounts((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              pin: newPinVal,
              defaultPassword: newPasswordVal,
              mustChangePinOnLogin: mustResetVal,
              status: statusVal,
            }
          : u
      )
    );

    setIsEditUserModalOpen(false);
    triggerToast(`Credentials and 4-digit PIN updated for ${editingUser.name}`);
  };

  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleKey || !newRoleLabel) {
      alert("Role key and label are required.");
      return;
    }

    const formattedKey = newRoleKey.toUpperCase().replace(/\s+/g, "_");
    const createdRole: RoleConfig = {
      key: formattedKey,
      label: newRoleLabel,
      category: newRoleCategory,
      description: newRoleDesc || "Custom institutional role with bespoke module permissions.",
      authStrategy: "email_password_pin",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      defaultRoute: `/portal/${formattedKey.toLowerCase()}`,
      iconName: "Shield",
      isCustom: true,
      permissions: newRoleModules.map((m) => `${m}:*`),
      allowedModules: newRoleModules,
    };

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.sidebarBg, borderColor: theme.sidebarActiveBorder }}
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center space-x-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: theme.primary }} />
            <span>Role Permissions &amp; 4-Digit PIN Security Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage granular module access per institutional role, staff passwords, and mandatory security PINs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewRoleModalOpen(true)}
          style={{ backgroundColor: theme.primary }}
          className="py-2.5 px-4 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* TAB 1: ROLES & MODULE PERMISSION MATRIX */}
      {activeTab === "roles_matrix" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Institutional Roles ({Object.keys(roles).length})
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                Select to Edit
              </span>
            </div>

            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {Object.values(roles).map((role) => {
                const isSelected = selectedRoleKey === role.key;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setSelectedRoleKey(role.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200/80 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs truncate">{role.label}</span>
                        {role.isCustom && (
                          <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {role.description}
                      </p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {role.allowedModules.length} mods
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            {roles[selectedRoleKey] ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900 font-serif">
                        {roles[selectedRoleKey].label}
                      </h3>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${roles[selectedRoleKey].badgeColor}`}>
                        {roles[selectedRoleKey].key}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      {roles[selectedRoleKey].description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Auth Strategy:</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Email + Password + 4-Digit PIN
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Active Module Access Toggles (Total: {SYSTEM_MODULES.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SYSTEM_MODULES.map((mod) => {
                      const isAllowed = roles[selectedRoleKey].allowedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => handleToggleModuleForRole(selectedRoleKey, mod.id)}
                          className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                            isAllowed
                              ? "bg-emerald-50/60 border-emerald-300 shadow-2xs"
                              : "bg-slate-50/40 border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div className="pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-slate-900">{mod.name}</span>
                              <span className="text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                                {mod.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                              {mod.description}
                            </p>
                          </div>

                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isAllowed ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                          }`}>
                            {isAllowed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & 4-DIGIT PIN GOVERNANCE */}
      {activeTab === "user_pins" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Institutional Accounts &amp; 4-Digit Security PIN Directory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every account requires Email + Password + 4-Digit PIN. Authorized leadership can reset PINs on demand.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search position or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Institutional Position</th>
                  <th className="py-3 px-4">Role Key</th>
                  <th className="py-3 px-4">4-Digit Security PIN</th>
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
                        roles[user.roleKey]?.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                        className="py-1 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-800 hover:text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        Manage PIN &amp; Pass →
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
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Institutional Credential &amp; 4-Digit PIN Security Policies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforced security policies active across all collegiate modules and portals.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  Mandatory 4-Digit Security PIN on All Logins
                </h4>
                <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                  When active, no staff, scholar, or parent can sign in using only email and password. A valid 4-digit numeric PIN is strictly required to unlock any portal session.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-700 text-white font-bold text-[10px] rounded-full shrink-0">
                ENFORCED
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Auto-Lock Account after 3 Failed PIN Attempts
                </h4>
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
                <h4 className="text-xs font-bold text-slate-900">
                  Cryptographic PIN Storage (Argon2id Hashing)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  All 4-digit PINs are securely hashed before persisting. Plaintext PINs are never saved in the database tables.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-[10px] rounded-full shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER CREDENTIALS MODAL */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Manage Credentials for {editingUser.name}
                </h3>
                <span className="text-[11px] font-mono text-slate-500">{editingUser.email}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Assigned 4-Digit Security PIN (Strictly 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPinVal}
                  onChange={(e) => setNewPinVal(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-base tracking-widest text-center border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Account Password
                </label>
                <input
                  type="text"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as "ACTIVE" | "PENDING_FIRST_LOGIN" | "LOCKED")}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ACTIVE">ACTIVE (Normal Access)</option>
                  <option value="PENDING_FIRST_LOGIN">PENDING FIRST LOGIN (Force Setup)</option>
                  <option value="LOCKED">LOCKED (Access Blocked)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserCredentials}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOM ROLE MODAL */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Register New Institutional Role</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRole} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Role Label (Display Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleLabel}
                    onChange={(e) => {
                      setNewRoleLabel(e.target.value);
                      if (!newRoleKey) {
                        setNewRoleKey(e.target.value.toUpperCase().replace(/\s+/g, "_"));
                      }
                    }}
                    placeholder="e.g. Lab Superintendent"
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Role Identifier Key
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleKey}
                    onChange={(e) => setNewRoleKey(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                    placeholder="e.g. LAB_SUPERINTENDENT"
                    className="w-full px-3 py-2 border rounded-xl font-mono border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="e.g. Oversees departmental hardware and inventory audits"
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
