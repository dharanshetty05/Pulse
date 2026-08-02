"use server";

import { bulkCreateImportQueue, deleteImportCompany, getImportQueue } from "@/lib/data/import";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function uploadToQueueAction(records: Record<string, any>[]) {
  const workspaceId = await requireWorkspace();
  await bulkCreateImportQueue(
    workspaceId,
    records.map((r) => ({
      businessName: r.businessName,
      website: r.website || null,
      instagram: r.instagram || null,
      email: r.email || null,
      phone: r.phone || null,
      city: r.city || null,
      importStatus: "PENDING",
    }))
  );
  revalidatePath("/dashboard/import-queue");
}

export async function approveSelectedAction(ids: string[], duplicateStrategy: "skip" | "update" | "force") {
  const workspaceId = await requireWorkspace();
  const queue = await getImportQueue(workspaceId);
  const selected = queue.filter(q => ids.includes(q.id));

  for (const item of selected) {
    let existingCompany = null;

    if (duplicateStrategy !== "force") {
      if (item.website) {
        existingCompany = await db.company.findFirst({
          where: { workspaceId, website: { equals: item.website, mode: "insensitive" } },
        });
      }
      if (!existingCompany && item.businessName && item.city) {
        existingCompany = await db.company.findFirst({
          where: {
            workspaceId,
            businessName: { equals: item.businessName, mode: "insensitive" },
            city: { equals: item.city, mode: "insensitive" }
          },
        });
      }
    }

    if (existingCompany) {
      if (duplicateStrategy === "skip") {
        await db.importCompany.update({
          where: { id: item.id },
          data: { importStatus: "SKIPPED", companyId: existingCompany.id },
        });
        continue;
      }
      if (duplicateStrategy === "update") {
        const updated = await db.company.update({
          where: { id: existingCompany.id },
          data: {
            website: item.website || existingCompany.website,
            instagram: item.instagram || existingCompany.instagram,
            email: item.email || existingCompany.email,
            phone: item.phone || existingCompany.phone,
            city: item.city || existingCompany.city,
          },
        });
        await db.importCompany.update({
          where: { id: item.id },
          data: { importStatus: "APPROVED", companyId: updated.id },
        });
        continue;
      }
    }

    // Create new
    const newCompany = await db.company.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        businessName: item.businessName,
        website: item.website,
        instagram: item.instagram,
        email: item.email,
        phone: item.phone,
        city: item.city,
      },
    });

    await db.importCompany.update({
      where: { id: item.id },
      data: { importStatus: "APPROVED", companyId: newCompany.id },
    });
  }

  revalidatePath("/dashboard/import-queue");
  revalidatePath("/companies");
}

export async function deleteImportItemAction(id: string) {
  const workspaceId = await requireWorkspace();
  await deleteImportCompany(workspaceId, id);
  revalidatePath("/dashboard/import-queue");
}
