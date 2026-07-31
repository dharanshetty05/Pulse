"use server";

import { updateCompany } from "@/lib/data/companies";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateCompanyAction(
  id: string,
  status: string,
  notes?: string
) {
  const data: any = { status: status as Status };
  if (notes !== undefined) {
    data.notes = notes;
  }
  await updateCompany(id, data);
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}
