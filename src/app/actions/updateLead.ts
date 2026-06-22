"use server";

import { updateLead } from "@/lib/sheets";

export async function updateLeadAction(
  rowNumber: number,
  responseStatus: string,
  meetingBooked: string,
  notes: string
) {
  await updateLead(
    rowNumber,
    responseStatus,
    meetingBooked,
    notes
  );
}