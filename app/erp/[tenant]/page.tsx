import React, { Suspense } from "react";
import AdminDashboardPage from "@/app/admin/page";

export default async function TenantErpDashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-mono text-xs">Loading campus portal...</div>}>
      <div data-tenant={resolvedParams.tenant}>
        <AdminDashboardPage />
      </div>
    </Suspense>
  );
}
