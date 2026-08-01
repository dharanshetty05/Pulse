"use server";

import { updateCompany } from "@/lib/data/companies";
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
    isPinned?: boolean;
    followUpDate?: Date | null;
    connectGroup?: string;
    disconnectGroup?: string;
    connectTag?: string;
    disconnectTag?: string;
  }
) {
  const data: any = {};
  if (updates.status !== undefined) data.status = updates.status as Status;
  if (updates.notes !== undefined) data.notes = updates.notes;
  if (updates.city !== undefined) data.city = updates.city;
  if (updates.website !== undefined) data.website = updates.website;
  if (updates.instagram !== undefined) data.instagram = updates.instagram;
  if (updates.email !== undefined) data.email = updates.email;
  if (updates.phone !== undefined) data.phone = updates.phone;
  if (updates.isPinned !== undefined) data.isPinned = updates.isPinned;
  if (updates.followUpDate !== undefined) data.followUpDate = updates.followUpDate;

  if (updates.connectGroup) {
    data.groups = { connect: { id: updates.connectGroup } };
  }
  if (updates.disconnectGroup) {
    data.groups = { disconnect: { id: updates.disconnectGroup } };
  }
  
  if (updates.connectTag) {
    data.tags = { connect: { id: updates.connectTag } };
  }
  if (updates.disconnectTag) {
    data.tags = { disconnect: { id: updates.disconnectTag } };
  }

  await updateCompany(id, data);
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}
