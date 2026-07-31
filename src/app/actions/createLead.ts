"use server";

import { createCompany } from "@/lib/data/companies";
import { createCompanySchema } from "@/lib/validations/company";
import { redirect } from "next/navigation";

export async function createLeadAction(formData: FormData) {
  const result = createCompanySchema.safeParse({
    businessName: formData.get("businessName"),
    city: formData.get("city"),
    instagram: formData.get("instagramId"),
    website: formData.get("website"),
  });

  if (!result.success) {
    throw new Error(result.error.message);
  }

  await createCompany({
    businessName: result.data.businessName,
    city: result.data.city,
    instagram: result.data.instagram,
    website: result.data.website,
  });

  redirect("/leads");
}