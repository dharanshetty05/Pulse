import { getCompanies } from "@/lib/data/companies";
import DashboardPage from "./dashboard/page";
import { getStats } from "@/lib/analytics";

export default async function Home() {
  const leads = await getCompanies();
  const stats = getStats(leads);


  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <DashboardPage />
    </main>
  );
}