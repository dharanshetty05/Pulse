"use server";

import { revalidatePath } from "next/cache";
import { createSavedView, updateSavedView, deleteSavedView } from "@/lib/data/savedViews";
import { requireWorkspace } from "@/lib/session";

export async function createSavedViewAction(name: string, filters: string, icon?: string) {
  try {
    const workspaceId = await requireWorkspace();
    const view = await createSavedView(workspaceId, name, filters, icon);
    revalidatePath("/companies");
    return { success: true, view };
  } catch (error: any) {
    return { error: "Failed to create saved view." };
  }
}

export async function updateSavedViewAction(id: string, data: { name?: string, filters?: string, icon?: string, position?: number }) {
  try {
    const workspaceId = await requireWorkspace();
    const view = await updateSavedView(workspaceId, id, data);
    revalidatePath("/companies");
    return { success: true, view };
  } catch (error: any) {
    return { error: "Failed to update saved view." };
  }
}

export async function deleteSavedViewAction(id: string) {
  try {
    const workspaceId = await requireWorkspace();
    await deleteSavedView(workspaceId, id);
    revalidatePath("/companies");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete saved view." };
  }
}
