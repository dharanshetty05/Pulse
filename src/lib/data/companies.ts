import { db } from "@/lib/db";
import { Prisma, Status } from "@prisma/client";

export async function getCompanies(workspaceId: string) {
  return db.company.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      groups: true,
      tags: true
    }
  });
}

export async function getCompanyById(workspaceId: string, id: string) {
  return db.company.findFirst({
    where: { id, workspaceId },
    include: {
      groups: true,
      tags: true,
      timelineNotes: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function getPinnedCompanies(workspaceId: string) {
  return db.company.findMany({
    where: { workspaceId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: { groups: true }
  });
}

export async function createCompany(workspaceId: string, data: Omit<Prisma.CompanyCreateInput, 'workspace'>) {
  return db.company.create({
    data: {
      ...data,
      workspace: { connect: { id: workspaceId } }
    },
  });
}

export async function updateCompany(workspaceId: string, id: string, data: Omit<Prisma.CompanyUpdateInput, 'workspace'>) {
  const existing = await db.company.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.company.update({
    where: { id },
    data,
  });
}

export async function deleteCompany(workspaceId: string, id: string) {
  const existing = await db.company.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.company.delete({
    where: { id },
  });
}
