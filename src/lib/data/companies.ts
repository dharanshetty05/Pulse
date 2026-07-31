import { db } from "@/lib/db";
import { Prisma, Status } from "@prisma/client";

export async function getCompanies() {
  return db.company.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCompanyById(id: string) {
  return db.company.findUnique({
    where: { id },
  });
}

export async function createCompany(data: Prisma.CompanyCreateInput) {
  return db.company.create({
    data,
  });
}

export async function updateCompany(id: string, data: Prisma.CompanyUpdateInput) {
  return db.company.update({
    where: { id },
    data,
  });
}

export async function deleteCompany(id: string) {
  return db.company.delete({
    where: { id },
  });
}
