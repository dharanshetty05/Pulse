export const dynamic = "force-dynamic";

import { getLeads } from "@/lib/sheets";
import { getStats } from "@/lib/analytics";
import StatsGrid from "@/components/dashboard/StatsGrid";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const leads = await getLeads();
  const stats = getStats(leads);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
          {getFormattedDate()}
        </p>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's how your outreach is performing.
        </p>
      </div>

      {/* Stats section */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
          Overview
        </p>
        <StatsGrid stats={stats} />
      </div>
    </div>
  );
}