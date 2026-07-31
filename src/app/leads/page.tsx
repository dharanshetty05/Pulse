export const dynamic = "force-dynamic";

import { getCompanies } from "@/lib/data/companies";
import LeadsSearch from "@/components/dashboard/LeadsSearch";
import { isToday } from "@/lib/date";

export default async function LeadsPage() {
  const leads = await getCompanies();

  const totalLeads = leads.length;
  const contactedToday = leads.filter((l) => isToday(l.createdAt)).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Outreach OS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Leads
          </h1>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums text-gray-900">{totalLeads}</p>
            <p className="text-xs text-gray-400">Total leads</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums text-gray-900">{contactedToday}</p>
            <p className="text-xs text-gray-400">Contacted today</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      <LeadsSearch leads={leads} />
    </div>
  );
}