"use server";

import { revalidatePath } from "next/cache";
import { createSavedView, updateSavedView, deleteSavedView } from "@/lib/data/savedViews";

export async function createSavedViewAction(name: string, filters: string, icon?: string) {
  try {
    const view = await createSavedView(name, filters, icon);
    revalidatePath("/companies");
    return { success: true, view };
  } catch (error: any) {
    return { error: "Failed to create saved view." };
  }
}

export async function updateSavedViewAction(id: string, data: { name?: string, filters?: string, icon?: string, position?: number }) {
  try {
    const view = await updateSavedView(id, data);
    revalidatePath("/companies");
    return { success: true, view };
  } catch (error: any) {
    return { error: "Failed to update saved view." };
  }
}

export async function deleteSavedViewAction(id: string) {
  try {
    await deleteSavedView(id);
    revalidatePath("/companies");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete saved view." };
  }
}
