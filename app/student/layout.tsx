import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal • OCCO Core Education ERP",
  description: "Official institutional student portal for attendance tracking, academic timetables, fee payments, and report cards.",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900 antialiased font-sans">
      {children}
    </div>
  );
}
