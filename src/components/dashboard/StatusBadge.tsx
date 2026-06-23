interface Props {
  status: string;
}

type BadgeConfig = {
  container: string;
  dot: string;
  label: string;
};

const STATUS_STYLES: Record<string, BadgeConfig> = {
  "New Lead": {
    container: "bg-slate-100 border-slate-200",
    dot: "bg-slate-400",
    label: "text-slate-600",
  },
  "Msg Sent": {
    container: "bg-violet-50 border-violet-200",
    dot: "bg-violet-400",
    label: "text-violet-700",
  },
  Seen: {
    container: "bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
    label: "text-amber-700",
  },
  Replied: {
    container: "bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
    label: "text-blue-700",
  },
  Interested: {
    container: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-400",
    label: "text-emerald-700",
  },
  "Follow Up": {
    container: "bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
    label: "text-orange-700",
  },
  "Follow Up 2": {
    container: "bg-rose-50 border-rose-200",
    dot: "bg-rose-400",
    label: "text-rose-700",
  },
  "No reply": {
    container: "bg-gray-100 border-gray-200",
    dot: "bg-gray-400",
    label: "text-gray-500",
  },
  "Not interested": {
    container: "bg-red-50 border-red-200",
    dot: "bg-red-400",
    label: "text-red-700",
  },
};

const FALLBACK: BadgeConfig = {
  container: "bg-gray-100 border-gray-200",
  dot: "bg-gray-400",
  label: "text-gray-500",
};

export default function StatusBadge({ status }: Props) {
  const { container, dot, label } = STATUS_STYLES[status] ?? FALLBACK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 ${container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      <span className={`text-[11px] font-semibold tracking-wide ${label}`}>
        {status}
      </span>
    </span>
  );
}