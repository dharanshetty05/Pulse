"use server";

import { revalidatePath } from "next/cache";
import { createTag, updateTag, deleteTag } from "@/lib/data/tags";

export async function createTagAction(name: string, color: string) {
  try {
    const tag = await createTag(name, color);
    revalidatePath("/companies");
    return { success: true, tag };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Tag name already exists." };
    return { error: "Failed to create tag." };
  }
}

export async function updateTagAction(id: string, data: { name?: string, color?: string }) {
  try {
    const tag = await updateTag(id, data);
    revalidatePath("/companies");
    return { success: true, tag };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Tag name already exists." };
    return { error: "Failed to update tag." };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await deleteTag(id);
    revalidatePath("/companies");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete tag." };
  }
}
