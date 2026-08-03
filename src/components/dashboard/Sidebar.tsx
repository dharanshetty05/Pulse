import { getGroups } from "@/lib/data/groups";
import { getPinnedCompanies } from "@/lib/data/companies";
import { getSavedViews } from "@/lib/data/savedViews";
import SidebarClient from "./SidebarClient";
import { requireWorkspace } from "@/lib/session";

export default async function Sidebar() {
  const workspaceId = await requireWorkspace();

  const [groups, pinnedCompanies, savedViews] = await Promise.all([
    getGroups(workspaceId),
    getPinnedCompanies(workspaceId),
    getSavedViews(workspaceId)
  ]);
  return <SidebarClient groups={groups} pinnedCompanies={pinnedCompanies} savedViews={savedViews} />;
}