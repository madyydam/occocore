"use client";

import React, { useState } from "react";
import {
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
import { useDemo } from "@/lib/demo/demoContext";

export default function DemoRolesView() {
  const { activeSubTab, theme } = useDemo();

  const activeTab: "roles_matrix" | "user_pins" | "security_policies" =
    activeSubTab === "user_pins" || activeSubTab === "security_policies"
      ? activeSubTab
      : "roles_matrix";

  const [roles, setRoles] = useState<Record<string, RoleConfig>>({ ...ROLE_DEFINITIONS });
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("ADMIN");

  const [userAccounts, setUserAccounts] = useState<ManagedUserAccount[]>([...INITIAL_USER_ACCOUNTS]);
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
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const [toastMessage, setToastMessage] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const selectedRole = roles[selectedRoleKey] || roles.ADMIN;

  const handleToggleModule = (moduleId: string) => {
    const isCurrentlyAllowed = selectedRole.allowedModules.includes(moduleId);
    const updatedModules = isCurrentlyAllowed
      ? selectedRole.allowedModules.filter((m) => m !== moduleId)
      : [...selectedRole.allowedModules, moduleId];

    setRoles((prev) => ({
      ...prev,
      [selectedRoleKey]: {
        ...prev[selectedRoleKey],
        allowedModules: updatedModules,
      },
    }));
  };

  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleKey || !newRoleLabel) return;

    const formattedKey = newRoleKey.toUpperCase().replace(/\s+/g, "_");
    const newConfig: RoleConfig = {
      key: formattedKey,
      label: newRoleLabel,
      category: "staff",
      description: newRoleDesc || "Custom institutional role with bespoke module permissions.",
      authStrategy: "email_password_pin",
      badgeColor: "bg-emerald-50 text-emerald-800",
      defaultRoute: "/demo",
      iconName: "UserCheck",
      permissions: ["academics:*"],
      allowedModules: ["academics"],
    };

    registerCustomRole(newConfig);
    setRoles((prev) => ({ ...prev, [formattedKey]: newConfig }));
    setSelectedRoleKey(formattedKey);
    setIsNewRoleModalOpen(false);
    setNewRoleKey("");
    setNewRoleLabel("");
    setNewRoleDesc("");
    triggerToast(`New role "${newRoleLabel}" registered successfully.`);
  };

  const handleOpenEditUser = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setNewPasswordVal("");
    setNewPinVal(user.pin || "");
    setMustResetVal(user.mustChangePinOnLogin);
    setStatusVal(user.status);
    setIsEditUserModalOpen(true);
  };

  const handleSaveUserCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUserAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === editingUser.id) {
          return {
            ...acc,
            pin: newPinVal || acc.pin,
            mustChangePinOnLogin: mustResetVal,
            status: statusVal,
          };
        }
        return acc;
      })
    );

    setIsEditUserModalOpen(false);
    triggerToast(`Credentials updated for ${editingUser.name} (${editingUser.email}).`);
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
          className="fixed top-20 right-6 z-50 text-white px-4 py-2.5 rounded-2xl shadow-xl border text-xs flex items-center gap-2 animate-in slide-in-from-top"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUB-TAB 1: ROLES & ACCESS MATRIX */}
      {activeTab === "roles_matrix" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Defined System Roles</h3>
                <p className="text-[11px] text-slate-500">Select a role to inspect permissions</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(true)}
                style={{ backgroundColor: theme.primary }}
                className="p-1.5 rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                title="Create New Role"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {Object.values(roles).map((r) => {
                const isSelected = selectedRoleKey === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRoleKey(r.key)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: theme.sidebarActive,
                            borderColor: theme.sidebarActiveBorder,
                            color: "#ffffff",
                          }
                        : {}
                    }
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "text-white shadow-xs"
                        : "bg-slate-50 border-slate-100 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block leading-tight">{r.label}</span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSelected ? "text-emerald-200" : "text-slate-500"
                        }`}
                      >
                        {r.allowedModules.length} Modules Authorized
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {r.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{selectedRole.label}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedRole.key}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
              </div>

              <button
                type="button"
                onClick={() => triggerToast(`Permissions policy saved for ${selectedRole.label}.`)}
                style={{ backgroundColor: theme.primary }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Matrix</span>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Module Authorization Matrix
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEM_MODULES.map((mod) => {
                  const isChecked = selectedRole.allowedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-slate-50 border-slate-200/60 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-colors ${
                          isChecked
                            ? "bg-emerald-700 border-emerald-700 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-slate-900 block leading-tight">
                          {mod.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">
                          {mod.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USERS, PASSWORDS & 4-DIGIT PINS */}
      {activeTab === "user_pins" && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                User Accounts &amp; 4-Digit Security PINs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage access credentials, unlock accounts, and reset POS counter 4-digit PINs.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff, students, or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Account Holder</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">4-Digit PIN</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block leading-tight">{u.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          {u.email}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {u.roleKey}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold tracking-wider text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {u.pin || "••••"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : u.status === "LOCKED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="px-3 py-1 rounded-xl font-bold text-[11px] border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          Edit Credentials
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

      {/* SUB-TAB 3: SECURITY & LOCKOUT POLICIES */}
      {activeTab === "security_policies" && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Security, Password &amp; Lockout Thresholds
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory zero-trust safeguards and automated brute-force protection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">
                4-Digit Counter PIN Lockout
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Accounts lock automatically for 15 minutes after 5 consecutive incorrect PIN entries on the fee collection counter POS.
              </p>
              <div className="pt-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Enforced (5 Attempts)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">
                Mandatory First-Time Reset
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                New faculty and student credentials require an immediate password change and 4-digit PIN setup on their initial login.
              </p>
              <div className="pt-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active (DPDPA 2023 Compliant)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CREDENTIALS */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Update User Credentials</h3>
                <span className="text-[11px] text-slate-500">{editingUser.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserCredentials} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep existing"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  4-Digit Security PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="e.g. 5812"
                  value={newPinVal}
                  onChange={(e) => setNewPinVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-center tracking-widest text-base font-bold border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as "ACTIVE" | "PENDING_FIRST_LOGIN" | "LOCKED")}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_FIRST_LOGIN">PENDING_FIRST_LOGIN</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mustReset"
                  checked={mustResetVal}
                  onChange={(e) => setMustResetVal(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="mustReset" className="font-semibold text-slate-700 text-xs">
                  Require password reset on next login
                </label>
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
                  type="submit"
                  style={{ backgroundColor: theme.primary }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ROLE */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
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
                    Role Label
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
                    Role Key
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
