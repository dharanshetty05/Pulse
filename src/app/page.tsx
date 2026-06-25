import { getLeads } from "@/lib/sheets";
import DashboardPage from "./dashboard/page";
import { getStats } from "@/lib/analytics";

export default async function Home() {
  const leads = await getLeads();
  const stats = getStats(leads);


  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <DashboardPage />
    </main>
  );
}