"use server";

import { deleteCompany } from "@/lib/data/companies";

import { revalidatePath } from "next/cache";

export async function deleteCompanyAction(id: string) {
  await deleteCompany(id);
  revalidatePath("/companies");
}
