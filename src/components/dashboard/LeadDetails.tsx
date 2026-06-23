"use client";

import { useState } from "react";
import { Lead } from "@/types/lead";
import LeadEditor from "./LeadEditor";
import StatusBadge from "./StatusBadge";
import {
  MapPin,
  Globe,
  Calendar,
  MessageSquare,
  Building2,
  Pencil,
  X,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  lead: Lead;
}

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}

function FieldRow({ icon, label, value, children }: FieldRowProps) {
  const isEmpty = !value && !children;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-gray-300 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
          {label}
        </p>
        {children ?? (
          <p className={isEmpty ? "text-sm text-gray-300" : "text-sm text-gray-800"}>
            {isEmpty ? "—" : value}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LeadDetails({ lead }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Building2 className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 leading-tight">
              {lead.businessName}
            </h1>
            <div className="mt-1">
              <StatusBadge status={lead.responseStatus} />
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Edit Lead
            </p>
            <LeadEditor
              rowNumber={lead.rowNumber}
              currentStatus={lead.responseStatus}
              currentMeeting={lead.meetingBooked}
              currentNotes={lead.notes}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {/* Contact info section */}
        <div className="px-4 py-2">
          <FieldRow icon={<MapPin className="h-4 w-4" strokeWidth={1.5} />} label="City" value={lead.city} />

          <FieldRow icon={<Heart className="h-4 w-4" strokeWidth={1.5} />} label="Instagram">
            {lead.instagramId ? (
              <a
                href={lead.instagramId}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Open Instagram ↗
              </a>
            ) : (
              <p className="text-sm text-gray-300">—</p>
            )}
          </FieldRow>

          <FieldRow icon={<Globe className="h-4 w-4" strokeWidth={1.5} />} label="Website">
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Visit Website ↗
              </a>
            ) : (
              <p className="text-sm text-gray-300">—</p>
            )}
          </FieldRow>
        </div>

        {/* Timeline section */}
        <div className="px-4 py-2">
          <FieldRow icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />} label="Date Contacted" value={lead.dateContacted} />
          <FieldRow icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />} label="Follow Up 1" value={lead.followUp1} />
          <FieldRow icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />} label="Follow Up 2" value={lead.followUp2} />
          <FieldRow icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />} label="Meeting Booked" value={lead.meetingBooked} />
        </div>

        {/* Notes section */}
        <div className="px-4 py-2">
          <FieldRow icon={<MessageSquare className="h-4 w-4" strokeWidth={1.5} />} label="Notes" value={lead.notes} />
        </div>
      </div>
    </div>
  );
}