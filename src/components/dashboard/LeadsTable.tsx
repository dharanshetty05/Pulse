"use client";

import { Lead } from "@/types/lead";
import StatusBadge from "./StatusBadge";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Inbox } from "lucide-react";

interface Props {
  leads: Lead[];
}

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.2,
      ease: "easeOut",
    },
  }),
};

export default function LeadsTable({ leads }: Props) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-8">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              Business
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              City
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              Date Contacted
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <Inbox className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-gray-500">No leads yet</p>
                    <p className="text-xs text-gray-400">Add your first lead to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead, i) => (
                <motion.tr
                  key={lead.leadId}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariants}
                  onClick={() => router.push(`/leads/${lead.leadId}`)}
                  className={`
                    group relative cursor-pointer border-b border-gray-100 transition-colors
                    hover:bg-gray-50/80
                    ${i === leads.length - 1 ? "border-b-0" : ""}
                  `}
                >
                  {/* Subtle left accent on hover */}
                  <td className="px-4 py-3 text-xs text-gray-300 tabular-nums">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />
                      <span className="font-medium text-gray-900 leading-tight">
                        {lead.businessName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0 text-gray-300" strokeWidth={1.5} />
                      <span>{lead.city}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.responseStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums">
                    {lead.dateContacted || <span className="text-gray-300">—</span>}
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}