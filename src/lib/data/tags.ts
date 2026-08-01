import { db } from "@/lib/db";

export async function getTags() {
  return db.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { companies: true }
      }
    }
  });
}

export async function createTag(name: string, color: string) {
  return db.tag.create({
    data: { name, color }
  });
}

export async function updateTag(id: string, data: { name?: string, color?: string }) {
  return db.tag.update({
    where: { id },
    data
  });
}

export async function deleteTag(id: string) {
  return db.tag.delete({
    where: { id }
  });
}
