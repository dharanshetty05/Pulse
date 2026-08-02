"use server";

import { deleteCompany } from "@/lib/data/companies";
import { requireWorkspace } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function deleteCompanyAction(id: string) {
  const workspaceId = await requireWorkspace();
  await deleteCompany(workspaceId, id);
  revalidatePath("/companies");
}
