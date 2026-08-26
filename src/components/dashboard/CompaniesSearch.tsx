"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Company } from "@prisma/client";
import CompaniesTable from "./CompaniesTable";
import { Search, X, Filter, ArrowUpDown, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, usePathname } from "next/navigation";

interface Props {
  companies: Company[];
}

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize local state from URL (for shareable links / direct navigation)
  const [query, setQuery] = useState(() => searchParams.get("query") || "");
  const [status, setStatus] = useState(() => searchParams.get("status") || "All");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");

  // Sync URL to local state on popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("query") || "");
      setStatus(params.get("status") || "All");
      setSort(params.get("sort") || "newest");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update URL without navigation (no RSC refetch)
  const updateUrl = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "All" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== window.location.href) {
      window.history.pushState(null, "", newUrl);
    }
  }, [pathname]);

  const filteredAndSortedCompanies = useMemo(() => {
    const result = companies.filter((company) => {
      const lowerQuery = query.toLowerCase();
      const matchesSearch = 
        company.businessName.toLowerCase().includes(lowerQuery) ||
        (company.website && company.website.toLowerCase().includes(lowerQuery)) ||
        (company.instagram && company.instagram.toLowerCase().includes(lowerQuery)) ||
        (company.email && company.email.toLowerCase().includes(lowerQuery)) ||
        (company.phone && company.phone.toLowerCase().includes(lowerQuery)) ||
        (company.city && company.city.toLowerCase().includes(lowerQuery));

      const matchesStatus = status === "All" || company.status === status;
      
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sort) {
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
  }, [companies, query, status, sort]);

  const hasActiveFilters = query !== "" || status !== "All";

  const clearFilters = () => {
    setQuery("");
    setStatus("All");
    setSort("newest");
    window.history.pushState(null, "", pathname);
  };

  return (
    <div className="space-y-4">

      {/* Search + Filters row */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search name, website, email, phone, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-colors duration-150 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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

        {/* Status select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateUrl("status", e.target.value);
            }}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm text-gray-700 shadow-sm outline-none cursor-pointer transition-colors duration-150 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateUrl("sort", e.target.value);
            }}
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
              onClick={clearFilters}
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
