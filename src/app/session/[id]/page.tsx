import { getSessionById } from "@/lib/data/sessions";
import { notFound } from "next/navigation";
import SessionWorkspaceClient from "./SessionWorkspaceClient";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getSessionById(id);

  if (!session) return notFound();

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex">
      <SessionWorkspaceClient initialSession={session} />
    </div>
  );
}