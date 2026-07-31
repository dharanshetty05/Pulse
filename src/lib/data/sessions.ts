import { db } from "@/lib/db";
import { Prisma, SessionCompanyState, SessionStatus } from "@prisma/client";

export async function createSession(companyIds: string[], filtersSnapshot: string) {
  const session = await db.outreachSession.create({
    data: {
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

export async function getActiveSession() {
  return db.outreachSession.findFirst({
    where: { status: "ACTIVE" },
    include: {
      companies: {
        orderBy: { queuePosition: 'asc' },
        include: { company: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSessionById(id: string) {
  return db.outreachSession.findUnique({
    where: { id },
    include: {
      companies: {
        orderBy: { queuePosition: 'asc' },
        include: { company: true }
      }
    }
  });
}

export async function updateSessionStatus(id: string, status: SessionStatus) {
  return db.outreachSession.update({
    where: { id },
    data: { 
      status, 
      completedAt: status === "COMPLETED" ? new Date() : null 
    }
  });
}

export async function updateSessionCurrentCompany(sessionId: string, companyId: string | null) {
  return db.outreachSession.update({
    where: { id: sessionId },
    data: { currentCompanyId: companyId }
  });
}
