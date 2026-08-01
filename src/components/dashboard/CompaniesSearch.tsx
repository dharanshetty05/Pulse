"use client";

import { useMemo, useState, useEffect, useCallback, useTransition } from "react";
import { Company, Group, Tag, SavedView } from "@prisma/client";
import CompaniesTable from "./CompaniesTable";
import { isToday, isThisWeek, isThisMonth } from "@/lib/date";
import { Search, MapPin, X, Filter, ArrowUpDown, Play, Tags, Bookmark, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { startSessionAction } from "@/app/actions/sessions";
import CompanyPreviewPanel from "./CompanyPreviewPanel";
import TagManagementModal from "./TagManagementModal";
import SaveViewModal from "./SaveViewModal";

interface CompanyWithGroupsAndTags extends Company {
  groups: Group[];
  tags: Tag[];
}

interface Props {
  companies: CompanyWithGroupsAndTags[];
  groups: (Group & { _count: { companies: number } })[];
  tags: (Tag & { _count?: { companies: number } })[];
  savedViews: SavedView[];
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

export default function CompaniesSearch({ companies, groups, tags, savedViews }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read from URL
  const urlQuery = searchParams.get("query") || "";
  const urlCity = searchParams.get("city") || "All";
  const urlStatus = searchParams.get("status") || "All";
  const urlDate = searchParams.get("date") || "all"; 
  const urlSort = searchParams.get("sort") || "newest";
  const urlGroup = searchParams.get("group") || "All";
  const urlPreview = searchParams.get("preview");
  const urlFollowup = searchParams.get("followup");
  const urlTags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [];

  const [localQuery, setLocalQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const [isStartingWorkQueue, setIsStartingWorkQueue] = useState(false);
  
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [showSaveView, setShowSaveView] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);

  // Sync local query when URL changes (e.g. back button)
  useEffect(() => {
    setLocalQuery(urlQuery);
  }, [urlQuery]);

  // Sync query to URL with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== urlQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (localQuery) params.set("query", localQuery);
        else params.delete("query");
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, urlQuery, pathname, router, searchParams]);

  const updateUrl = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const toggleTagFilter = (tagName: string) => {
    const nextTags = new Set(urlTags);
    if (nextTags.has(tagName)) nextTags.delete(tagName);
    else nextTags.add(tagName);
    
    if (nextTags.size > 0) {
      updateUrl("tags", Array.from(nextTags).join(","));
    } else {
      updateUrl("tags", null);
    }
  };

  const filteredAndSortedCompanies = useMemo(() => {
    let result = companies.filter((company) => {
      const lowerQuery = urlQuery.toLowerCase();
      const matchesSearch = 
        company.businessName.toLowerCase().includes(lowerQuery) ||
        (company.website && company.website.toLowerCase().includes(lowerQuery)) ||
        (company.instagram && company.instagram.toLowerCase().includes(lowerQuery)) ||
        (company.email && company.email.toLowerCase().includes(lowerQuery)) ||
        (company.phone && company.phone.toLowerCase().includes(lowerQuery)) ||
        (company.city && company.city.toLowerCase().includes(lowerQuery));

      const matchesCity = urlCity === "All" || company.city === urlCity;
      const matchesStatus = urlStatus === "All" || company.status === urlStatus;
      const matchesGroup = urlGroup === "All" || company.groups.some(g => g.name === urlGroup);
      const matchesTags = urlTags.length === 0 || urlTags.some(t => company.tags.some(ct => ct.name === t));
      
      const compDate = company.createdAt;
      let matchesDate = true;
      if (urlDate === "today") matchesDate = isToday(compDate);
      if (urlDate === "week") matchesDate = isThisWeek(compDate);
      if (urlDate === "month") matchesDate = isThisMonth(compDate);

      let matchesFollowup = true;
      if (urlFollowup) {
        if (!company.followUpDate) {
          matchesFollowup = false;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const fDate = new Date(company.followUpDate);
          fDate.setHours(0,0,0,0);
          
          if (urlFollowup === "today") matchesFollowup = fDate.getTime() === today.getTime();
          else if (urlFollowup === "tomorrow") matchesFollowup = fDate.getTime() === tomorrow.getTime();
          else if (urlFollowup === "overdue") matchesFollowup = fDate.getTime() < today.getTime();
          else if (urlFollowup === "upcoming") matchesFollowup = fDate.getTime() > today.getTime();
        }
      }
      
      return matchesSearch && matchesCity && matchesStatus && matchesDate && matchesGroup && matchesFollowup && matchesTags;
    });

    result.sort((a, b) => {
      switch (urlSort) {
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
  }, [companies, urlQuery, urlCity, urlStatus, urlDate, urlSort, urlGroup, urlFollowup]);

  const cities = ["All", ...new Set(companies.map((c) => c.city).filter(Boolean) as string[])];
  const hasActiveFilters = urlQuery !== "" || urlCity !== "All" || urlStatus !== "All" || urlGroup !== "All" || urlDate !== "all" || !!urlFollowup || urlTags.length > 0;

  const clearFilters = () => {
    setLocalQuery("");
    router.push(pathname, { scroll: false });
  };

  const handleEnterWorkQueue = async () => {
    if (filteredAndSortedCompanies.length === 0) return;
    setIsStartingWorkQueue(true);
    const session = await startSessionAction(
      filteredAndSortedCompanies.map(c => c.id),
      window.location.search
    );
    if (session) {
      router.push(`/session/${session.id}`);
    } else {
      setIsStartingWorkQueue(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Group Navigation Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateUrl("group", "All")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            urlGroup === "All" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Companies
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => updateUrl("group", group.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              urlGroup === group.name ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Date filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          {DATE_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updateUrl("date", value)}
              className={`
                relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                ${urlDate === value
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {urlDate === value && (
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveView(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            Save View
          </button>

          <button
            onClick={handleEnterWorkQueue}
            disabled={isStartingWorkQueue || filteredAndSortedCompanies.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isStartingWorkQueue ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                <Play className="w-4 h-4" fill="currentColor" />
                Work Queue
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search + Filters row */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search name, website, email, phone, city..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="
              w-full rounded-lg border border-gray-200 bg-white
              py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400
              shadow-sm outline-none
              transition-colors duration-150
              focus:border-gray-400 focus:ring-2 focus:ring-gray-100
            "
          />
          <AnimatePresence>
            {localQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={() => setLocalQuery("")}
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
            value={urlCity}
            onChange={(e) => updateUrl("city", e.target.value)}
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
            value={urlStatus}
            onChange={(e) => updateUrl("status", e.target.value)}
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
            value={urlSort}
            onChange={(e) => updateUrl("sort", e.target.value)}
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

        {/* Tags filter */}
        <div className="relative z-10">
          <button
            onClick={() => setShowTagSelect(!showTagSelect)}
            className={`
              flex items-center justify-between rounded-lg border py-2.5 pl-3 pr-2 text-sm
              shadow-sm outline-none transition-colors duration-150 min-w-[140px]
              ${urlTags.length > 0 ? "border-gray-400 bg-gray-50 text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}
            `}
          >
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              <span>{urlTags.length > 0 ? `${urlTags.length} tags selected` : "Filter by Tags"}</span>
            </div>
            <svg className="h-3.5 w-3.5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showTagSelect && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowTagSelect(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden py-1"
                >
                  <div className="max-h-60 overflow-y-auto px-1">
                    {tags.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-500 text-center">No tags exist.</div>
                    ) : (
                      tags.map(t => (
                        <button
                          key={t.id}
                          onClick={() => toggleTagFilter(t.name)}
                          className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <span className="text-sm text-gray-700">{t.name}</span>
                          {urlTags.includes(t.name) && <Check className="w-3.5 h-3.5 text-gray-900" />}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-2 mt-1">
                    <button
                      onClick={() => { setShowTagSelect(false); setShowTagManagement(true); }}
                      className="w-full text-center text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-1.5 rounded transition-colors"
                    >
                      Manage Tags
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
        groups={groups}
        tags={tags}
        isSearchActive={hasActiveFilters}
      />

      <AnimatePresence>
        {urlPreview && (
          <CompanyPreviewPanel 
            previewId={urlPreview} 
            companyIds={filteredAndSortedCompanies.map(c => c.id)} 
            tags={tags}
          />
        )}
      </AnimatePresence>
      
      {showTagManagement && (
        <TagManagementModal tags={tags} onClose={() => setShowTagManagement(false)} />
      )}
      
      {showSaveView && (
        <SaveViewModal currentFilters={window.location.search} onClose={() => setShowSaveView(false)} />
      )}
    </div>
  );
}
