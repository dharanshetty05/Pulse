"use client";

import { useState } from "react";
import { updateLeadAction } from "@/app/actions/updateLead";
import { useRouter } from "next/navigation";

interface Props {
  rowNumber: number;
  currentStatus: string;
  currentMeeting: string;
  currentNotes: string;
}

export default function LeadEditor({
  rowNumber,
  currentStatus,
  currentMeeting,
  currentNotes,
}: Props) {
  
  const router = useRouter();

  const [status, setStatus] =
    useState(currentStatus);

  const [meeting, setMeeting] =
    useState(currentMeeting);

  const [notes, setNotes] =
    useState(currentNotes);

  async function handleSave() {
    await updateLeadAction(
      rowNumber,
      status,
      meeting,
      notes
    );

    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <h2 className="text-xl font-semibold">
        Edit Lead
      </h2>

      <div>
        <label>Status</label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="mt-1 w-full border p-2 rounded"
        >
          <option>New Lead</option>
          <option>Msg Sent</option>
          <option>Replied</option>
          <option>Interested</option>
          <option>Seen</option>
          <option>No reply</option>
          <option>Not interested</option>
          <option>Follow Up</option>
          <option>Follow Up 2</option>
        </select>
      </div>

      <div>
        <label>Meeting Booked</label>

        <select
          value={meeting}
          onChange={(e) =>
            setMeeting(e.target.value)
          }
          className="mt-1 w-full border p-2 rounded"
        >
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <div>
        <label>Notes</label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          rows={4}
          className="mt-1 w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleSave}
        className="rounded-lg border px-4 py-2"
      >
        Save Changes
      </button>
    </div>
  );
}