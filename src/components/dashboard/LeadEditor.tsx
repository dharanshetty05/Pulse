"use client";

import { useState } from "react";
import { updateLeadAction } from "@/app/actions/updateLead";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  rowNumber: number;
  currentStatus: string;
  currentMeeting: string;
  currentNotes: string;
}

const STATUS_OPTIONS = [
  "New Lead",
  "Msg Sent",
  "Replied",
  "Interested",
  "Seen",
  "No reply",
  "Not interested",
  "Follow Up",
  "Follow Up 2",
];

const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5";

const selectClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100 appearance-none cursor-pointer";

const fieldWrapper = "relative";

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LeadEditor({
  rowNumber,
  currentStatus,
  currentMeeting,
  currentNotes,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [meeting, setMeeting] = useState(currentMeeting);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateLeadAction(rowNumber, status, meeting, notes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const isDirty =
    status !== currentStatus ||
    meeting !== currentMeeting ||
    notes !== currentNotes;

  return (
    <div className="space-y-4">
      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <div className={fieldWrapper}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>

      {/* Meeting Booked */}
      <div>
        <label className={labelClass}>Meeting Booked</label>
        <div className={fieldWrapper}>
          <select
            value={meeting}
            onChange={(e) => setMeeting(e.target.value)}
            className={selectClass}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <SelectChevron />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes about this lead…"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm outline-none transition-colors resize-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`
            flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150
            ${isDirty && !saving
              ? "bg-gray-900 text-white hover:bg-gray-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <AnimatePresence mode="wait" initial={false}>
            {saving ? (
              <motion.span
                key="saving"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </motion.span>
            ) : saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-2"
              >
                <Check className="h-3.5 w-3.5" />
                Saved
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                Save Changes
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {isDirty && !saving && !saved && (
            <motion.p
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-gray-400"
            >
              Unsaved changes
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}