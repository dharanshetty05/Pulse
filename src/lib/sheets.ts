import { google } from "googleapis";
import { Lead } from "@/types/lead";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function getLeads(): Promise<Lead[]> {
  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Whatsapp!A:N",
  });

  const rows = response.data.values || [];

  const dataRows = rows.slice(1);


  return dataRows.map((row, index) => ({
    rowNumber: index + 2,
    leadId: row[0] || "",
    businessName: row[1] || "",
    city: row[2] || "",
    instagramId: row[3] || "",
    website: row[4] || "",
    dateContacted: row[5] || "",
    coldDmSent: row[6] || "",
    responseStatus: row[7] || "",
    followUp1: row[8] || "",
    followUp2: row[9] || "",
    objection: row[10] || "",
    meetingBooked: row[11] || "",
    meetingDateTime: row[12] || "",
    notes: row[13] || "",
  }));
}

export async function updateLead(
  rowNumber: number,
  responseStatus: string,
  meetingBooked: string,
  notes: string
) {
  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        {
          range: `Whatsapp!H${rowNumber}`,
          values: [[responseStatus]],
        },
        {
          range: `Whatsapp!L${rowNumber}`,
          values: [[meetingBooked]],
        },
        {
          range: `Whatsapp!N${rowNumber}`,
          values: [[notes]],
        },
      ],
    },
  });
}

export async function createLead(
  lead: {
    businessName: string;
    city: string;
    instagramId: string;
    website: string;
  }
) {

  const leads = await getLeads();

const lastLead = leads[leads.length - 1];

const nextLeadId = (
  Number(lastLead.leadId) + 1
).toString();

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const today = new Date();

  const formattedDate =
    `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Whatsapp!A:N",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        nextLeadId,
        lead.businessName,
        lead.city,
        lead.instagramId,
        lead.website,

        formattedDate, // Date Contacted

        "Yes",         // Cold DM Sent

        "Msg Sent",    // Response Status

        "",            // Follow Up 1

        "",            // Follow Up 2

        "",            // Objection

        "",          // Meeting Booked

        "",            // Meeting Date

        ""             // Notes
      ]]
    }
  });
}