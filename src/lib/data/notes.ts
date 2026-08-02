import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getNotes(workspaceId: string, companyId: string) {
  // We can just query notes for this company that also belong to the workspace
  return db.note.findMany({
    where: { companyId, workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(workspaceId: string, data: Omit<Prisma.NoteCreateInput, 'workspace'>) {
  return db.note.create({
    data: {
      ...data,
      workspace: { connect: { id: workspaceId } }
    },
  });
}

export async function updateNote(workspaceId: string, id: string, data: Omit<Prisma.NoteUpdateInput, 'workspace'>) {
  const existing = await db.note.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.note.update({
    where: { id },
    data,
  });
}

export async function deleteNote(workspaceId: string, id: string) {
  const existing = await db.note.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.note.delete({
    where: { id },
  });
}
