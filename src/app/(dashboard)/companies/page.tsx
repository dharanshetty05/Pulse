export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCompanies } from "@/lib/data/companies";
import { getGroups } from "@/lib/data/groups";
import { getTags } from "@/lib/data/tags";
import { getSavedViews } from "@/lib/data/savedViews";
import CompaniesSearch from "@/components/dashboard/CompaniesSearch";
import NewCompanyButton from "@/components/dashboard/NewCompanyButton";
import { isToday } from "@/lib/date";
import { requireWorkspace } from "@/lib/session";

export default async function CompaniesPage() {
  const workspaceId = await requireWorkspace();

  const [companies, groups, tags, savedViews] = await Promise.all([
    getCompanies(workspaceId),
    getGroups(workspaceId),
    getTags(workspaceId),
    getSavedViews(workspaceId)
  ]);

  const totalCompanies = companies.length;
  const contactedToday = companies.filter((c) => isToday(c.createdAt)).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Outreach OS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Companies
          </h1>
        </div>

        {/* Quick stats & Actions */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums text-gray-900">{totalCompanies}</p>
            <p className="text-xs text-gray-400">Total companies</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums text-gray-900">{contactedToday}</p>
            <p className="text-xs text-gray-400">Contacted today</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <NewCompanyButton />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      <Suspense fallback={<div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
        <CompaniesSearch companies={companies} groups={groups} tags={tags} savedViews={savedViews} />
      </Suspense>
    </div>
  );
}
