import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getSavedViews(workspaceId: string) {
  return db.savedView.findMany({
    where: { workspaceId },
    orderBy: { position: 'asc' }
  });
}

export async function createSavedView(workspaceId: string, name: string, filters: string, icon?: string, position?: number) {
  const count = position ?? await db.savedView.count({ where: { workspaceId } });
  return db.savedView.create({
    data: {
      workspace: { connect: { id: workspaceId } },
      name,
      filters,
      icon,
      position: count
    }
  });
}

export async function updateSavedView(workspaceId: string, id: string, data: { name?: string, filters?: string, icon?: string, position?: number }) {
  const existing = await db.savedView.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.savedView.update({
    where: { id },
    data
  });
}

export async function deleteSavedView(workspaceId: string, id: string) {
  const existing = await db.savedView.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.savedView.delete({
    where: { id }
  });
}
