import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getGroups(workspaceId: string) {
  return db.group.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { companies: true }
      }
    }
  });
}

export async function getGroupById(workspaceId: string, id: string) {
  return db.group.findFirst({
    where: { id, workspaceId },
  });
}

export async function createGroup(workspaceId: string, data: Omit<Prisma.GroupCreateInput, 'workspace'>) {
  return db.group.create({
    data: {
      ...data,
      workspace: { connect: { id: workspaceId } }
    },
  });
}

export async function updateGroup(workspaceId: string, id: string, data: Omit<Prisma.GroupUpdateInput, 'workspace'>) {
  const existing = await db.group.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.group.update({
    where: { id },
    data,
  });
}

export async function deleteGroup(workspaceId: string, id: string) {
  const existing = await db.group.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.group.delete({
    where: { id },
  });
}
