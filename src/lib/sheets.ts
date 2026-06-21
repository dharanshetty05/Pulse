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

  return dataRows.map((row) => ({
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