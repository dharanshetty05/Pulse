import { Building2, MessageSquare, Reply, ThumbsUp, CalendarCheck, TrendingUp } from "lucide-react";

function SkeletonStatCard({ icon: Icon, accent = "text-gray-500" }: { icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; accent?: string }) {
  const match = accent.match(/text-(\w+)-\d+/);
  const iconBg = match ? `bg-${match[1]}-50` : "bg-gray-100";

  return (
    <div className="relative rounded-xl border border-gray-100 bg-white px-5 py-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="h-2.75 w-3/4 bg-gray-200 rounded text-[11px] font-semibold text-gray-400 uppercase tracking-widest" />
          <div className="mt-2.5 h-8 w-1/2 bg-gray-200 rounded text-3xl font-semibold text-gray-900 tracking-tight leading-none tabular-nums" />
        </div>
        {Icon && (
          <div className={`shrink-0 mt-0.5 p-2 rounded-lg ${iconBg} ${accent}`}>
            <Icon className="w-4 h-4 opacity-50" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse mb-1" />
        <div className="h-7 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-1 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats section skeleton */}
      <div>
        <div className="h-3 w-1/5 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonStatCard icon={Building2} accent="text-gray-500" />
          <SkeletonStatCard icon={MessageSquare} accent="text-blue-500" />
          <SkeletonStatCard icon={Reply} accent="text-violet-500" />
          <SkeletonStatCard icon={ThumbsUp} accent="text-emerald-500" />
          <SkeletonStatCard icon={CalendarCheck} accent="text-amber-500" />
          <SkeletonStatCard icon={TrendingUp} accent="text-rose-500" />
        </div>
      </div>
    </div>
  );
}