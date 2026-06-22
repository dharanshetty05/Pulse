"use server";

import { createLead } from "@/lib/sheets";
import { redirect } from "next/navigation";

export async function createLeadAction(
    formData: FormData
    ) {
    await createLead({
        businessName:
        formData.get("businessName") as string,

        city:
        formData.get("city") as string,

        instagramId:
        formData.get("instagramId") as string,

        website:
        formData.get("website") as string,
    });

    redirect("/leads");
}