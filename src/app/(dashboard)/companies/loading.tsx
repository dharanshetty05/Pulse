import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function CompaniesLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-end justify-between">
        <div>
          <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-7 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Quick stats & actions skeleton */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="h-6 w-10 bg-gray-200 rounded animate-pulse ml-auto" />
            <div className="mt-1 h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-right">
            <div className="h-6 w-10 bg-gray-200 rounded animate-pulse ml-auto" />
            <div className="mt-1 h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Search / filter bar skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" strokeWidth={1.5} />
          <div className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        </div>
        <div className="relative w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" strokeWidth={1.5} />
          <div className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        </div>
        <div className="relative w-44">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" strokeWidth={1.5} />
          <div className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        </div>
      </div>

      {/* Results meta skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Company", "Contact", "Links", "City", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded" />
                      <div className="h-3 w-36 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="space-y-1.5">
                      <div className="h-3 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="space-y-1.5">
                      <div className="h-3 w-36 bg-gray-200 rounded" />
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-6 bg-gray-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}