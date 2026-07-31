"use server";

import { createCompany } from "@/lib/data/companies";
import { createCompanySchema } from "@/lib/validations/company";
import { redirect } from "next/navigation";

export async function createCompanyAction(prevState: any, formData: FormData) {
  const result = createCompanySchema.safeParse({
    businessName: formData.get("businessName")?.toString() || "",
    city: formData.get("city")?.toString() || "",
    instagram: formData.get("instagramId")?.toString() || "",
    website: formData.get("website")?.toString() || "",
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  await createCompany({
    businessName: result.data.businessName,
    city: result.data.city,
    instagram: result.data.instagram,
    website: result.data.website,
  });

  redirect("/companies");
}
