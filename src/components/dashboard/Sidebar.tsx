import { getGroups } from "@/lib/data/groups";
import { getPinnedCompanies } from "@/lib/data/companies";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
  const groups = await getGroups();
  const pinnedCompanies = await getPinnedCompanies();
  return <SidebarClient groups={groups} pinnedCompanies={pinnedCompanies} />;
}