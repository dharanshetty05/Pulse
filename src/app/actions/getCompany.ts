"use server";

import { getCompanyById } from "@/lib/data/companies";

export async function getCompanyDetailsAction(id: string) {
  return await getCompanyById(id);
}
