import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export const requireWorkspace = cache(async () => {
  const user = await requireUser();
  
  const workspace = await db.workspace.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!workspace) {
    throw new Error("User has no workspace.");
  }
  
  return workspace.id;
});
