import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getImportQueue(workspaceId: string) {
  return db.importCompany.findMany({
    where: { workspaceId, importStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function bulkCreateImportQueue(workspaceId: string, data: Omit<Prisma.ImportCompanyCreateManyInput, 'workspaceId'>[]) {
  const dataWithWorkspace = data.map(item => ({
    ...item,
    workspaceId
  }));
  return db.importCompany.createMany({
    data: dataWithWorkspace,
  });
}

export async function updateImportCompany(workspaceId: string, id: string, data: Omit<Prisma.ImportCompanyUpdateInput, 'workspace'>) {
  const existing = await db.importCompany.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.importCompany.update({
    where: { id },
    data,
  });
}

export async function deleteImportCompany(workspaceId: string, id: string) {
  const existing = await db.importCompany.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.importCompany.delete({
    where: { id },
  });
}
