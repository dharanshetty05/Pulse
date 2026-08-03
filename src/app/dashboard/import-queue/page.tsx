export const dynamic = "force-dynamic";

import { getImportQueue } from "@/lib/data/import";
import ImportClient from "./ImportClient";
import { requireWorkspace } from "@/lib/session";

export default async function ImportQueuePage() {
  const workspaceId = await requireWorkspace();

  const queue = await getImportQueue(workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Outreach OS
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Import Queue
          </h1>
        </div>
      </div>
      <div className="h-px bg-gray-100" />

      <ImportClient initialQueue={queue} />
    </div>
  );
}
