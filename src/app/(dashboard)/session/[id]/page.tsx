import { getSessionById } from "@/lib/data/sessions";
import { notFound } from "next/navigation";
import SessionWorkspaceClient from "./SessionWorkspaceClient";
import { requireWorkspace } from "@/lib/session";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspaceId = await requireWorkspace();

  const session = await getSessionById(workspaceId, id);

  if (!session) return notFound();

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex">
      <SessionWorkspaceClient initialSession={session} />
    </div>
  );
}