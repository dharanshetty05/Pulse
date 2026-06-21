interface Props {
  status: string;
}

export default function StatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    Interested:
      "bg-green-100 text-green-700",

    Replied:
      "bg-blue-100 text-blue-700",

    "No reply":
      "bg-gray-100 text-gray-700",

    "Not interested":
      "bg-red-100 text-red-700",

    Seen:
      "bg-yellow-100 text-yellow-700",

    "Msg Sent":
      "bg-purple-100 text-purple-700",

    "New Lead":
      "bg-slate-100 text-slate-700",

    "Follow Up":
      "bg-orange-100 text-orange-700",

    "Follow Up 2":
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}