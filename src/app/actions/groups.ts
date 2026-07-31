"use server";

import { createGroup, deleteGroup, updateGroup } from "@/lib/data/groups";
import { revalidatePath } from "next/cache";

export async function createGroupAction(name: string) {
  await createGroup({ name });
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}

export async function updateGroupAction(id: string, name: string) {
  await updateGroup(id, { name });
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}

export async function deleteGroupAction(id: string) {
  await deleteGroup(id);
  revalidatePath("/companies");
  revalidatePath("/dashboard");
}
