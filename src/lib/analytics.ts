import { Company } from "@prisma/client";
import { isToday } from "./date";

export function getStats(companies: Company[]) {
  const totalLeads = companies.length;

  const dmsSent = companies.filter(
    (company) => company.status !== "NEW"
  ).length;

  const messagedToday = companies.filter(
    (company) => isToday(company.createdAt)
  ).length;

  const replies = companies.filter(
    (company) =>
      company.status === "INTERESTED" ||
      company.status === "MEETING_BOOKED" ||
      company.status === "CLIENT" ||
      company.status === "CONTACTED" ||
      company.status === "FOLLOW_UP"
  ).length;

  const interested = companies.filter(
    (company) =>
      company.status === "INTERESTED"
  ).length;

  const meetings = companies.filter(
    (company) =>
      company.status === "MEETING_BOOKED"
  ).length;

  const replyRate =
    dmsSent > 0
      ? Number(((replies / dmsSent) * 100).toFixed(1))
      : 0;

  return {
    totalLeads,
    messagedToday,
    replies,
    interested,
    meetings,
    replyRate,
  };
}