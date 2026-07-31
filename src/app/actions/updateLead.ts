"use server";

import { updateCompany } from "@/lib/data/companies";
import { Status } from "@prisma/client";

export async function updateLeadAction(
  id: string,
  status: string,
  notes: string
) {
  await updateCompany(id, {
    status: status as Status,
    notes,
  });
}