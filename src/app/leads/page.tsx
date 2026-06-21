import { getLeads } from "@/lib/sheets";
import LeadsTable from "@/components/dashboard/LeadsTable";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        Leads
      </h1>

      <LeadsTable leads={leads} />
    </div>
  );
}