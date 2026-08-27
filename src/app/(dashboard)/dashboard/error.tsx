"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
          <AlertTriangle className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-gray-900">
          Something went wrong loading your overview
        </p>
        <p className="max-w-sm text-xs text-gray-400">
          We couldn&apos;t load your outreach statistics. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}