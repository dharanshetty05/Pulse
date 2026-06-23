"use client";

import { useMemo, useState } from "react";
import { Lead } from "@/types/lead";
import LeadsTable from "./LeadsTable";
import { parseLeadDate, isToday, isThisWeek, isThisMonth } from "@/lib/date";
import { Search, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  leads: Lead[];
}

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

export default function LeadsSearch({ leads }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [filter, setFilter] = useState("week");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.businessName
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCity = city === "All" || lead.city === city;
      const leadDate = parseLeadDate(lead.dateContacted);
      let matchesDate = true;
      if (filter === "today") matchesDate = isToday(leadDate);
      if (filter === "week") matchesDate = isThisWeek(leadDate);
      if (filter === "month") matchesDate = isThisMonth(leadDate);
      return matchesSearch && matchesCity && matchesDate;
    });
  }, [leads, query, city, filter]);

  const cities = ["All", ...new Set(leads.map((lead) => lead.city))];

  const hasActiveFilters = query !== "" || city !== "All";

  return (
    <div className="space-y-4">
      {/* Date filter tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {DATE_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`
              relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
              ${filter === value
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {filter === value && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-md bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Search + City row */}
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by business name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full rounded-lg border border-gray-200 bg-white
              py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400
              shadow-sm outline-none
              transition-colors duration-150
              focus:border-gray-400 focus:ring-2 focus:ring-gray-100
            "
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* City select */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="
              appearance-none rounded-lg border border-gray-200 bg-white
              py-2.5 pl-9 pr-8 text-sm text-gray-700
              shadow-sm outline-none cursor-pointer
              transition-colors duration-150
              focus:border-gray-400 focus:ring-2 focus:ring-gray-100
            "
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Cities" : c}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <svg
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Results meta row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 tabular-nums">
          <span className="font-medium text-gray-600">{filteredLeads.length}</span>
          {" "}
          {filteredLeads.length === 1 ? "lead" : "leads"}
        </p>
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
              onClick={() => { setQuery(""); setCity("All"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <LeadsTable leads={filteredLeads} />
    </div>
  );
}