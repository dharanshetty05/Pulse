import { db } from "@/lib/db";

export async function getSavedViews() {
  return db.savedView.findMany({
    orderBy: { position: 'asc' }
  });
}

export async function createSavedView(name: string, filters: string, icon?: string, position?: number) {
  const count = position ?? await db.savedView.count();
  return db.savedView.create({
    data: {
      name,
      filters,
      icon,
      position: count
    }
  });
}

export async function updateSavedView(id: string, data: { name?: string, filters?: string, icon?: string, position?: number }) {
  return db.savedView.update({
    where: { id },
    data
  });
}

export async function deleteSavedView(id: string) {
  return db.savedView.delete({
    where: { id }
  });
}
