import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getNotes(companyId: string) {
  return db.note.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(data: Prisma.NoteCreateInput) {
  return db.note.create({
    data,
  });
}

export async function updateNote(id: string, data: Prisma.NoteUpdateInput) {
  return db.note.update({
    where: { id },
    data,
  });
}

export async function deleteNote(id: string) {
  return db.note.delete({
    where: { id },
  });
}
