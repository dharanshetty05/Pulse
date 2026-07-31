"use server";

import { createNote, deleteNote, updateNote } from "@/lib/data/notes";
import { revalidatePath } from "next/cache";

export async function createNoteAction(companyId: string, content: string) {
  const note = await createNote({
    content,
    company: { connect: { id: companyId } },
  });
  revalidatePath("/companies");
  return note;
}

export async function updateNoteAction(id: string, content: string) {
  const note = await updateNote(id, { content });
  revalidatePath("/companies");
  return note;
}

export async function deleteNoteAction(id: string) {
  await deleteNote(id);
  revalidatePath("/companies");
}
