import { getLeads } from "@/lib/sheets";

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const leads = await getLeads();

  const lead = leads.find(
    (lead) => lead.leadId === id
  );

  if (!lead) {
    return <div>Lead not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {lead.businessName}
      </h1>

      <div className="space-y-4">
        <p>
          <strong>City:</strong>{" "}
          {lead.city}
        </p>

        <p>
          <strong>Instagram:</strong>{" "}
          {lead.instagramId}
        </p>

        <p>
          <strong>Website:</strong>{" "}
          {lead.website}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {lead.responseStatus}
        </p>

        <p>
          <strong>Date Contacted:</strong>{" "}
          {lead.dateContacted}
        </p>

        <p>
          <strong>Follow Up 1:</strong>{" "}
          {lead.followUp1}
        </p>

        <p>
          <strong>Follow Up 2:</strong>{" "}
          {lead.followUp2}
        </p>

        <p>
          <strong>Meeting:</strong>{" "}
          {lead.meetingBooked}
        </p>

        <p>
          <strong>Notes:</strong>{" "}
          {lead.notes}
        </p>

                <p>
  <strong>Row:</strong>{" "}
  {lead.rowNumber}
</p>
      </div>
    </div>
  );
}