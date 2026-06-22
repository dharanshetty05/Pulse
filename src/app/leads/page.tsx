export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/sheets";

import LeadsSearch from "@/components/dashboard/LeadsSearch";

export default async function LeadsPage() {
  const leads = await getLeads();

  console.log(
    "LEADS PAGE RENDERED:",
    leads.length
  );


  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        Leads
      </h1>

      <LeadsSearch leads={leads} />
    </div>
  );
}