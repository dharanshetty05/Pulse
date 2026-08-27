import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getCompanies(workspaceId: string) {
  return db.company.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCompanyById(workspaceId: string, id: string) {
  return db.company.findFirst({
    where: { id, workspaceId },
  });
}

export async function getStats(workspaceId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    totalCompanies,
    dmsSent,
    messagedToday,
    replies,
    interested,
    meetings,
  ] = await Promise.all([
    db.company.count({ where: { workspaceId } }),
    db.company.count({ where: { workspaceId, status: { not: "NEW" } } }),
    db.company.count({
      where: {
        workspaceId,
        createdAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
    db.company.count({
      where: {
        workspaceId,
        status: {
          in: [
            "INTERESTED",
            "MEETING_BOOKED",
            "CLIENT",
            "CONTACTED",
            "FOLLOW_UP",
          ],
        },
      },
    }),
    db.company.count({ where: { workspaceId, status: "INTERESTED" } }),
    db.company.count({ where: { workspaceId, status: "MEETING_BOOKED" } }),
  ]);

  const replyRate = dmsSent > 0 ? Number(((replies / dmsSent) * 100).toFixed(1)) : 0;

  return {
    totalCompanies,
    messagedToday,
    replies,
    interested,
    meetings,
    replyRate,
  };
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
