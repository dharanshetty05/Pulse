export function parseLeadDate(dateString: string) {
  const [day, month, year] = dateString
    .split("/")
    .map(Number);

  return new Date(year, month - 1, day);
}

export function isToday(date: Date) {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isThisWeek(date: Date) {
  const today = new Date();

  const weekAgo = new Date();

  weekAgo.setDate(today.getDate() - 7);

  return date >= weekAgo;
}

export function isThisMonth(date: Date) {
  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}