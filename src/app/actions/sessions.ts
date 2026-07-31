"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSession, getActiveSession, updateSessionStatus, updateSessionCurrentCompany } from "@/lib/data/sessions";
import { SessionCompanyState, SessionStatus, Status } from "@prisma/client";

export async function startSessionAction(companyIds: string[], filtersSnapshot: string) {
  if (companyIds.length === 0) return null;
  const existingActive = await getActiveSession();
  if (existingActive) {
    await updateSessionStatus(existingActive.id, "DISCARDED");
  }
  const session = await createSession(companyIds, filtersSnapshot);
  revalidatePath("/companies");
  return session;
}

export async function discardSessionAction(sessionId: string) {
  await updateSessionStatus(sessionId, "DISCARDED");
  revalidatePath("/companies");
}

export async function processSessionCompanyAction(
  sessionId: string,
  companyId: string,
  state: SessionCompanyState,
  updates?: {
    status?: Status;
    followUpDate?: Date | null;
  },
  noteContent?: string
) {
  // Use a transaction for atomic update
  await db.$transaction(async (tx) => {
    // 1. Update OutreachSessionCompany state
    await tx.outreachSessionCompany.update({
      where: { sessionId_companyId: { sessionId, companyId } },
      data: {
        state,
        completedAt: new Date()
      }
    });

    // 2. Update Company if needed
    if (updates && (updates.status || updates.followUpDate !== undefined)) {
      await tx.company.update({
        where: { id: companyId },
        data: {
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.followUpDate !== undefined ? { followUpDate: updates.followUpDate } : {})
        }
      });
    }

    // 3. Create Note if provided
    if (noteContent) {
      await tx.note.create({
        data: {
          content: noteContent,
          companyId: companyId
        }
      });
    }

    // 4. Advance Session to next pending company
    const nextCompany = await tx.outreachSessionCompany.findFirst({
      where: { sessionId, state: "PENDING" },
      orderBy: { queuePosition: "asc" }
    });

    if (nextCompany) {
      await tx.outreachSession.update({
        where: { id: sessionId },
        data: { currentCompanyId: nextCompany.companyId }
      });
      await tx.outreachSessionCompany.update({
        where: { id: nextCompany.id },
        data: { state: "CURRENT" }
      });
    } else {
      await tx.outreachSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED", completedAt: new Date(), currentCompanyId: null }
      });
    }
  });

  revalidatePath("/session");
  revalidatePath(`/session/${sessionId}`);
  revalidatePath("/companies");
}
