import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getImportQueue() {
  return db.importCompany.findMany({
    where: { importStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function bulkCreateImportQueue(data: Prisma.ImportCompanyCreateManyInput[]) {
  return db.importCompany.createMany({
    data,
  });
}

export async function updateImportCompany(id: string, data: Prisma.ImportCompanyUpdateInput) {
  return db.importCompany.update({
    where: { id },
    data,
  });
}

export async function deleteImportCompany(id: string) {
  return db.importCompany.delete({
    where: { id },
  });
}
