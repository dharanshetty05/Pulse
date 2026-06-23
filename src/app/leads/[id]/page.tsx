export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/sheets";
import LeadDetails from "@/components/dashboard/LeadDetails";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leads = await getLeads();
  const lead = leads.find((lead) => lead.leadId === id);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-gray-900">Lead not found</p>
        <p className="text-xs text-gray-400">This lead may have been removed or the link is incorrect.</p>
        <Link
          href="/leads"
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leads
      </Link>

      <LeadDetails lead={lead} />
    </div>
  );
}