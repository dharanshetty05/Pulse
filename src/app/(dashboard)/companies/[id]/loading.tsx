import { Building2, MapPin, Globe, Calendar, MessageSquare, Mail, Phone, Heart } from "lucide-react";

function SkeletonFieldRow({ icon: Icon }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 animate-pulse">
      <div className="mt-0.5 text-gray-300 shrink-0">
        <Icon className="h-4 w-4 opacity-50" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-2.5 w-1/4 bg-gray-200 rounded mb-0.5" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function CompanyLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 animate-pulse">
            <Building2 className="h-5 w-5 text-gray-400 opacity-50" strokeWidth={1.5} />
          </div>
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="mt-1 h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Edit panel placeholder (collapsed) - just empty space */}

      {/* Info card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {/* Contact info section */}
        <div className="px-4 py-2 space-y-4">
          <SkeletonFieldRow icon={MapPin} />
          <SkeletonFieldRow icon={Mail} />
          <SkeletonFieldRow icon={Phone} />
          <SkeletonFieldRow icon={Heart} />
          <SkeletonFieldRow icon={Globe} />
        </div>

        {/* Timeline section */}
        <div className="px-4 py-2 space-y-4">
          <SkeletonFieldRow icon={Calendar} />
          <SkeletonFieldRow icon={Calendar} />
        </div>

        {/* Notes section */}
        <div className="px-4 py-2 space-y-4">
          <SkeletonFieldRow icon={MessageSquare} />
        </div>
      </div>
    </div>
  );
}