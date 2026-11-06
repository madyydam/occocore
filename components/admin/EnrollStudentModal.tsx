"use client";

import React, { useState } from "react";
import { UserPlus, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { quickAddStudentAction, bulkImportStudentsAction, StudentInputPayload } from "@/lib/actions/studentActions";

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function EnrollStudentModal({ isOpen, onClose, onSuccess }: EnrollStudentModalProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Single Student Form State
  const [singleStudent, setSingleStudent] = useState<StudentInputPayload>({
    admissionNo: "",
    rollNo: 1,
    firstName: "",
    lastName: "",
    gender: "MALE",
    guardianName: "",
    emergencyPhone: "",
  });

  // Bulk Import State
  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState<StudentInputPayload[]>([]);

  // Parse CSV text whenever it changes
  const handleParseCsv = (text: string) => {
    setRawText(text);
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const parsed: StudentInputPayload[] = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        // format: roll, admission, first, last, gender, phone
        const roll = parseInt(parts[0], 10) || undefined;
        const adm = parts[1] || `ADM-${Date.now().toString().slice(-4)}`;
        const first = parts[2] || "Scholar";
        const last = parts[3] || "";
        const gender = (parts[4]?.toUpperCase() === "FEMALE" ? "FEMALE" : "MALE") as "MALE" | "FEMALE";
        const phone = parts[5] || "";

        parsed.push({
          rollNo: roll,
          admissionNo: adm,
          firstName: first,
          lastName: last,
          gender,
          emergencyPhone: phone,
        });
      }
    });

    setParsedRows(parsed);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleStudent.admissionNo || !singleStudent.firstName) {
      setErrorMessage("Admission Number and First Name are mandatory.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await quickAddStudentAction(singleStudent);
      if (res.success) {
        onSuccess(`Enrolled scholar ${singleStudent.firstName} (${singleStudent.admissionNo}) into PostgreSQL!`);
        onClose();
        setSingleStudent({
          admissionNo: "",
          rollNo: 1,
          firstName: "",
          lastName: "",
          gender: "MALE",
          guardianName: "",
          emergencyPhone: "",
        });
      } else {
        setErrorMessage(res.error || "Failed to enroll student.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (parsedRows.length === 0) {
      setErrorMessage("No valid student records found in paste box.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await bulkImportStudentsAction(parsedRows);
      if (res.success) {
        onSuccess(`Successfully imported ${res.count} scholars into PostgreSQL database!`);
        onClose();
      } else {
        setErrorMessage(res.error || "Bulk import failed.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error executing bulk import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-serif">
                Enroll Scholars to Section
              </h3>
              <p className="text-xs text-slate-500">
                Data persists directly into PostgreSQL <code className="text-indigo-600 font-mono">students</code> table.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "single"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Single Scholar Quick Add
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("bulk");
              if (parsedRows.length === 0) handleParseCsv(rawText);
            }}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bulk"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk CSV / Excel Copy-Paste</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Single Scholar Form */}
        {activeTab === "single" && (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Roll Number</label>
                <input
                  type="number"
                  value={singleStudent.rollNo || ""}
                  onChange={(e) => setSingleStudent({ ...singleStudent, rollNo: parseInt(e.target.value, 10) || undefined })}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Admission / Scholar ID *</label>
                <input
                  type="text"
                  required
                  value={singleStudent.admissionNo}
                  onChange={(e) => setSingleStudent({ ...singleStudent, admissionNo: e.target.value })}
                  placeholder="e.g. SCH/2026/0491"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">First Name *</label>
                <input
                  type="text"
                  required
                  value={singleStudent.firstName}
                  onChange={(e) => setSingleStudent({ ...singleStudent, firstName: e.target.value })}
                  placeholder="e.g. Vihaan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={singleStudent.lastName}
                  onChange={(e) => setSingleStudent({ ...singleStudent, lastName: e.target.value })}
                  placeholder="e.g. Deshmukh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Gender</label>
                <select
                  value={singleStudent.gender}
                  onChange={(e) => setSingleStudent({ ...singleStudent, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Guardian Contact Phone</label>
                <input
                  type="tel"
                  value={singleStudent.emergencyPhone || ""}
                  onChange={(e) => setSingleStudent({ ...singleStudent, emergencyPhone: e.target.value })}
                  placeholder="e.g. +91 98201 11223"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Enrolling..." : "Save to Database"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bulk CSV / Copy-Paste */}
        {activeTab === "bulk" && (
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Paste CSV or Excel Rows (Roll, AdmissionNo, FirstName, LastName, Gender, Phone):
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder="1, ADM/2026/001, John, Doe, MALE, 9876543210"
                className="w-full font-mono text-[11px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Live Parse Preview Table */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Verified Rows Preview:</span>
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {parsedRows.length} valid scholars ready
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">Roll</th>
                      <th className="py-1.5 px-2">Admission No</th>
                      <th className="py-1.5 px-2">Full Name</th>
                      <th className="py-1.5 px-2">Gender</th>
                      <th className="py-1.5 px-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 font-mono font-bold text-slate-600">{r.rollNo}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-800">{r.admissionNo}</td>
                        <td className="py-1.5 px-2 font-bold text-slate-900">{r.firstName} {r.lastName}</td>
                        <td className="py-1.5 px-2 text-slate-600">{r.gender}</td>
                        <td className="py-1.5 px-2 text-slate-600 font-mono">{r.emergencyPhone || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isSubmitting || parsedRows.length === 0}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Importing..." : `Import ${parsedRows.length} Scholars to DB`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

