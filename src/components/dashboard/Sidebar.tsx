import { getGroups } from "@/lib/data/groups";
import SidebarClient from "./SidebarClient";

export default async function Sidebar() {
  const groups = await getGroups();
  return <SidebarClient groups={groups} />;
}