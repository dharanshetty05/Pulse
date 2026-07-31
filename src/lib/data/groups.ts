import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getGroups() {
  return db.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { companies: true }
      }
    }
  });
}

export async function getGroupById(id: string) {
  return db.group.findUnique({
    where: { id },
  });
}

export async function createGroup(data: Prisma.GroupCreateInput) {
  return db.group.create({
    data,
  });
}

export async function updateGroup(id: string, data: Prisma.GroupUpdateInput) {
  return db.group.update({
    where: { id },
    data,
  });
}

export async function deleteGroup(id: string) {
  return db.group.delete({
    where: { id },
  });
}
