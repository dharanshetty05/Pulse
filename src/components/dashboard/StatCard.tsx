"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  /** Tailwind text color class — also used to derive icon bg tint, e.g. "text-blue-500" */
  accent?: string;
  /** Reserved for future use — kept for API compatibility */
  highlight?: boolean;
}

/** Map text-{color}-{shade} → bg-{color}-50 for a soft icon backdrop */
function accentToBg(accent: string): string {
  const match = accent.match(/text-(\w+)-\d+/);
  if (!match) return "bg-gray-100";
  return `bg-${match[1]}-50`;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "text-gray-500",
  highlight: _highlight = false,
}: StatCardProps) {
  const iconBg = accentToBg(accent);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 16px 0 rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="relative rounded-xl border border-gray-100 bg-white px-5 py-5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Text */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest truncate">
            {title}
          </p>
          <p className="mt-2.5 text-3xl font-semibold text-gray-900 tracking-tight leading-none tabular-nums">
            {value}
          </p>
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`shrink-0 mt-0.5 p-2 rounded-lg ${iconBg} ${accent}`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}