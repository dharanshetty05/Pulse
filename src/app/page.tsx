import { getLeads } from "@/lib/sheets";

export default async function Home() {
  const leads = await getLeads();

  const totalLeads = leads.length;

  const dmsSent = leads.filter(
    (lead) => lead.coldDmSent === "Yes"
  ).length;

  const replies = leads.filter(
    (lead) => lead.responseStatus === "Replied"
  ).length;

  const interested = leads.filter(
    (lead) => lead.responseStatus === "Interested"
  ).length;

  const meetings = leads.filter(
    (lead) => lead.meetingBooked === "Yes"
  ).length;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Outreach Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="border p-4 rounded">
          <h2>Total Leads</h2>
          <p className="text-3xl">{totalLeads}</p>
        </div>

        <div className="border p-4 rounded">
          <h2>DMs Sent</h2>
          <p className="text-3xl">{dmsSent}</p>
        </div>

        <div className="border p-4 rounded">
          <h2>Replies</h2>
          <p className="text-3xl">{replies}</p>
        </div>

        <div className="border p-4 rounded">
          <h2>Meetings</h2>
          <p className="text-3xl">{meetings}</p>
        </div>
      </div>
    </main>
  );
}