"use server";

import { createNote, deleteNote, updateNote } from "@/lib/data/notes";
import { requireWorkspace } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createNoteAction(companyId: string, content: string) {
  const workspaceId = await requireWorkspace();
  const note = await createNote(workspaceId, {
    content,
    company: { connect: { id: companyId } },
  });
  revalidatePath("/companies");
  return note;
}

export async function updateNoteAction(id: string, content: string) {
  const workspaceId = await requireWorkspace();
  const note = await updateNote(workspaceId, id, { content });
  revalidatePath("/companies");
  return note;
}

export async function deleteNoteAction(id: string) {
  const workspaceId = await requireWorkspace();
  await deleteNote(workspaceId, id);
  revalidatePath("/companies");
}
