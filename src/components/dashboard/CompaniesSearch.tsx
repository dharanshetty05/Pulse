"use client";

import { useMemo, useState } from "react";
import { Company } from "@prisma/client";
import CompaniesTable from "./CompaniesTable";
import { isToday, isThisWeek, isThisMonth } from "@/lib/date";
import { Search, MapPin, X, Filter, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  companies: Company[];
}

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

const STATUS_FILTERS = [
  "All",
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "INTERESTED",
  "MEETING_BOOKED",
  "CLIENT",
  "CLOSED",
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
  { label: "Recently Updated", value: "updated" },
];

export default function CompaniesSearch({ companies }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("week");
  const [sortOption, setSortOption] = useState("newest");

  const filteredAndSortedCompanies = useMemo(() => {
    let result = companies.filter((company) => {
      const lowerQuery = query.toLowerCase();
      const matchesSearch = 
        company.businessName.toLowerCase().includes(lowerQuery) ||
        (company.website && company.website.toLowerCase().includes(lowerQuery)) ||
        (company.instagram && company.instagram.toLowerCase().includes(lowerQuery)) ||
        (company.city && company.city.toLowerCase().includes(lowerQuery));

      const matchesCity = city === "All" || company.city === city;
      const matchesStatus = statusFilter === "All" || company.status === statusFilter;
      
      const compDate = company.createdAt;
      let matchesDate = true;
      if (dateFilter === "today") matchesDate = isToday(compDate);
      if (dateFilter === "week") matchesDate = isThisWeek(compDate);
      if (dateFilter === "month") matchesDate = isThisMonth(compDate);
      
      return matchesSearch && matchesCity && matchesStatus && matchesDate;
    });

    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "name_asc":
          return a.businessName.localeCompare(b.businessName);
        case "name_desc":
          return b.businessName.localeCompare(a.businessName);
        case "updated":
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [companies, query, city, statusFilter, dateFilter, sortOption]);

  const cities = ["All", ...new Set(companies.map((c) => c.city).filter(Boolean) as string[])];

  const hasActiveFilters = query !== "" || city !== "All" || statusFilter !== "All";

  return (
    <div className="space-y-4">
      {/* Date filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          {DATE_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setDateFilter(value)}
              className={`
                relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                ${dateFilter === value
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {dateFilter === value && (
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
      </div>

      {/* Search + Filters row */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search name, website, city..."
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
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Status select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              appearance-none rounded-lg border border-gray-200 bg-white
              py-2.5 pl-9 pr-8 text-sm text-gray-700
              shadow-sm outline-none cursor-pointer
              transition-colors duration-150
              focus:border-gray-400 focus:ring-2 focus:ring-gray-100
            "
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s.replace("_", " ")}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Sort select */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="
              appearance-none rounded-lg border border-gray-200 bg-white
              py-2.5 pl-9 pr-8 text-sm text-gray-700
              shadow-sm outline-none cursor-pointer
              transition-colors duration-150
              focus:border-gray-400 focus:ring-2 focus:ring-gray-100
            "
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Results meta row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 tabular-nums">
          <span className="font-medium text-gray-600">{filteredAndSortedCompanies.length}</span>
          {" "}
          {filteredAndSortedCompanies.length === 1 ? "company" : "companies"}
        </p>
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
              onClick={() => { setQuery(""); setCity("All"); setStatusFilter("All"); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <CompaniesTable 
        companies={filteredAndSortedCompanies} 
        isSearchActive={hasActiveFilters}
      />
    </div>
  );
}
