export const TAG_COLORS = [
  { id: "gray", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  { id: "red", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { id: "orange", bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { id: "amber", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { id: "green", bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { id: "emerald", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { id: "teal", bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  { id: "cyan", bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  { id: "blue", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { id: "indigo", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { id: "violet", bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { id: "purple", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { id: "fuchsia", bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  { id: "pink", bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { id: "rose", bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
];

export function getTagColorClasses(colorId: string) {
  const color = TAG_COLORS.find(c => c.id === colorId) || TAG_COLORS[0];
  return `${color.bg} ${color.text} ${color.border}`;
}
