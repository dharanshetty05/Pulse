import { Lead } from "@/types/lead";
import { parseLeadDate, isToday } from "./date";

export function getStats(leads: Lead[]) {
  const totalLeads = leads.length;

  const dmsSent = leads.filter(
    (lead) => lead.coldDmSent === "Yes"
  ).length;

  const messagedToday = leads.filter(
    (lead) =>
      isToday(
        parseLeadDate(
          lead.dateContacted
        )
      )
  ).length;

  const replies = leads.filter(
    (lead) =>
      lead.responseStatus === "Replied" ||
      lead.responseStatus === "Interested"
  ).length;

  const interested = leads.filter(
    (lead) =>
      lead.responseStatus === "Interested"
  ).length;

  const meetings = leads.filter(
    (lead) =>
      lead.meetingBooked === "Yes"
  ).length;

  const replyRate =
    dmsSent > 0
      ? ((replies / dmsSent) * 100).toFixed(1)
      : "0";

  return {
    totalLeads,
    messagedToday,
    replies,
    interested,
    meetings,
    replyRate,
  };
}