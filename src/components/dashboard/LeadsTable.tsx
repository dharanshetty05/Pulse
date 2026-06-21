import { Lead } from "@/types/lead";
import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface Props {
  leads: Lead[];
}

export default function LeadsTable({
  leads,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-4 text-left">
              Business
            </th>

            <th className="p-4 text-left">
              City
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-left">
              DM Sent
            </th>

            <th className="p-4 text-left">
              Meeting
            </th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.leadId}
              className="border-b"
            >
              <td className="p-4">
                <Link
                    href={`/leads/${lead.leadId}`}
                    className="font-medium hover:underline"
                    >
                    {lead.businessName}
                </Link>
              </td>

              <td className="p-4">
                {lead.city}
              </td>

              <td className="p-4">
                <StatusBadge
                  status={
                    lead.responseStatus
                  }
                />
              </td>

              <td className="p-4">
                {lead.coldDmSent}
              </td>

              <td className="p-4">
                {lead.meetingBooked}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}