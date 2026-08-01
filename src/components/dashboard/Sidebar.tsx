import { getGroups } from "@/lib/data/groups";
import { getPinnedCompanies } from "@/lib/data/companies";
import { getSavedViews } from "@/lib/data/savedViews";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
  const [groups, pinnedCompanies, savedViews] = await Promise.all([
    getGroups(),
    getPinnedCompanies(),
    getSavedViews()
  ]);
  return <SidebarClient groups={groups} pinnedCompanies={pinnedCompanies} savedViews={savedViews} />;
}