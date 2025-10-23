import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const bodyObj = body as Record<string, unknown>;
    const { title, url, description, tags, imageUrl } = bodyObj;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    // Get credentials from environment variables
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!credentials || !spreadsheetId) {
      return NextResponse.json(
        { error: "Google Sheets not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SHEET_ID environment variables." },
        { status: 500 }
      );
    }

    // Parse credentials
    let credentialsObj;
    try {
      credentialsObj = JSON.parse(credentials);
    } catch {
      return NextResponse.json({ error: "Invalid Google credentials format" }, { status: 500 });
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: credentialsObj,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Prepare row data
    const tagsString = Array.isArray(tags) ? tags.join(", ") : String(tags || "");
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      String(title),
      String(url),
      String(description || ""),
      tagsString,
      String(imageUrl || ""),
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:F", // Adjust sheet name if needed
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return NextResponse.json({ success: true, message: "Project saved to Google Sheets" }, { status: 200 });
  } catch (err: unknown) {
    console.error("Google Sheets error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save to Google Sheets" },
      { status: 500 }
    );
  }
}
