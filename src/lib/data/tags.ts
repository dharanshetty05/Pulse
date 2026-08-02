import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getTags(workspaceId: string) {
  return db.tag.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { companies: true }
      }
    }
  });
}

export async function createTag(workspaceId: string, name: string, color: string) {
  return db.tag.create({
    data: { 
      name, 
      color,
      workspace: { connect: { id: workspaceId } }
    }
  });
}

export async function updateTag(workspaceId: string, id: string, data: { name?: string, color?: string }) {
  const existing = await db.tag.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.tag.update({
    where: { id },
    data
  });
}

export async function deleteTag(workspaceId: string, id: string) {
  const existing = await db.tag.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.tag.delete({
    where: { id }
  });
}
