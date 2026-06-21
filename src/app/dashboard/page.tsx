import { getLeads } from "@/lib/sheets";
import { getStats } from "@/lib/analytics";

import StatCard from "@/components/dashboard/StatCard";

export default async function DashboardPage() {
  const leads = await getLeads();

  const stats = getStats(leads);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
        />

        <StatCard
          title="DMs Sent"
          value={stats.dmsSent}
        />

        <StatCard
          title="Replies"
          value={stats.replies}
        />

        <StatCard
          title="Interested"
          value={stats.interested}
        />

        <StatCard
          title="Meetings"
          value={stats.meetings}
        />

        <StatCard
          title="Reply Rate"
          value={`${stats.replyRate}%`}
        />
      </div>
    </div>
  );
}