"use server";

import { updateCompany } from "@/lib/data/companies";
import { requireWorkspace } from "@/lib/session";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateCompanyAction(
  id: string,
  updates: {
    status?: string;
    notes?: string;
    city?: string;
    website?: string;
    instagram?: string;
    email?: string;
    phone?: string;
    followUpDate?: Date | null;
  }
) {
  const workspaceId = await requireWorkspace();
  const data: Parameters<typeof updateCompany>[2] = {};
  if (updates.status !== undefined) data.status = updates.status as Status;
  if (updates.notes !== undefined) data.notes = updates.notes;
  if (updates.city !== undefined) data.city = updates.city;
  if (updates.website !== undefined) data.website = updates.website;
  if (updates.instagram !== undefined) data.instagram = updates.instagram;
  if (updates.email !== undefined) data.email = updates.email;
  if (updates.phone !== undefined) data.phone = updates.phone;
  if (updates.followUpDate !== undefined) data.followUpDate = updates.followUpDate;

  await updateCompany(workspaceId, id, data);
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}
