"use server";

import { createGroup, deleteGroup, updateGroup } from "@/lib/data/groups";
import { requireWorkspace } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createGroupAction(name: string) {
  const workspaceId = await requireWorkspace();
  await createGroup(workspaceId, { name });
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}

export async function updateGroupAction(id: string, name: string) {
  const workspaceId = await requireWorkspace();
  await updateGroup(workspaceId, id, { name });
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}

export async function deleteGroupAction(id: string) {
  const workspaceId = await requireWorkspace();
  await deleteGroup(workspaceId, id);
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}
