"use server";

import { getCompanyById } from "@/lib/data/companies";
import { requireWorkspace } from "@/lib/session";

export async function getCompanyDetailsAction(id: string) {
  const workspaceId = await requireWorkspace();
  return await getCompanyById(workspaceId, id);
}
