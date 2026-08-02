import { db } from "@/lib/db";
import { Prisma, SessionCompanyState, SessionStatus } from "@prisma/client";

export async function createSession(workspaceId: string, companyIds: string[], filtersSnapshot: string) {
  const session = await db.outreachSession.create({
    data: {
      workspace: { connect: { id: workspaceId } },
      filtersSnapshot,
      currentCompanyId: companyIds[0] || null,
      companies: {
        create: companyIds.map((id, index) => ({
          companyId: id,
          queuePosition: index,
          state: index === 0 ? "CURRENT" : "PENDING"
        }))
      }
    },
    include: {
      companies: true
    }
  });
  return session;
}

export async function getActiveSession(workspaceId: string) {
  return db.outreachSession.findFirst({
    where: { workspaceId, status: "ACTIVE" },
    include: {
      companies: {
        orderBy: { queuePosition: 'asc' },
        include: { company: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSessionById(workspaceId: string, id: string) {
  return db.outreachSession.findFirst({
    where: { id, workspaceId },
    include: {
      companies: {
        orderBy: { queuePosition: 'asc' },
        include: { company: true }
      }
    }
  });
}

export async function updateSessionStatus(workspaceId: string, id: string, status: SessionStatus) {
  const existing = await db.outreachSession.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.outreachSession.update({
    where: { id },
    data: { 
      status, 
      completedAt: status === "COMPLETED" ? new Date() : null 
    }
  });
}

export async function updateSessionCurrentCompany(workspaceId: string, sessionId: string, companyId: string | null) {
  const existing = await db.outreachSession.findFirst({ where: { id: sessionId, workspaceId } });
  if (!existing) throw new Error("Unauthorized or not found");

  return db.outreachSession.update({
    where: { id: sessionId },
    data: { currentCompanyId: companyId }
  });
}
