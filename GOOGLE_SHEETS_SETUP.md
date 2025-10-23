# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration to save projects directly to a spreadsheet.

## Prerequisites

- A Google account
- A Google Sheet where you want to save projects

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Give your project a name (e.g., "QCode Projects")
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Name: `qcode-sheets-service`
   - Description: "Service account for QCode project management"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Create and Download Service Account Key

1. In the "Credentials" page, find your service account under "Service Accounts"
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create" - this will download a JSON file

## Step 5: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "QCode Projects")
4. Add headers in the first row (optional but recommended):
   - A1: `Timestamp`
   - B1: `Title`
   - C1: `URL`
   - D1: `Description`
   - E1: `Tags`
   - F1: `Image URL`
5. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 6: Share Sheet with Service Account

1. In your Google Sheet, click the "Share" button
2. Paste the service account email (from the JSON file, field `client_email`)
3. Give it "Editor" permissions
4. Click "Send" (uncheck "Notify people" if you don't want an email)

## Step 7: Configure Environment Variables

1. Open the JSON key file you downloaded in Step 4
2. Copy the entire contents (it should be a single line of JSON)
3. Create a `.env.local` file in your project root if it doesn't exist
4. Add these environment variables:

```env
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

GOOGLE_SHEET_ID=your_spreadsheet_id_here
```

**Important Notes:**
- The `GOOGLE_SERVICE_ACCOUNT_KEY` should be the entire JSON content wrapped in single quotes
- Replace `your_spreadsheet_id_here` with your actual Spreadsheet ID from Step 5
- Never commit the `.env.local` file to git (it's already in `.gitignore`)

## Step 8: Restart Your Development Server

1. Stop your current dev server (Ctrl+C)
2. Restart it with `npm run dev`
3. The Google Sheets integration should now work!

## Usage

When adding a new project:
1. Fill in the project form
2. Check the "Also save to Google Sheets" checkbox
3. Click "Save Project"
4. The project will be saved both locally and to your Google Sheet

## Troubleshooting

### Error: "Google Sheets not configured"
- Make sure both environment variables are set in `.env.local`
- Restart your dev server after adding environment variables

### Error: "Invalid Google credentials format"
- Ensure the JSON is properly formatted in the environment variable
- Make sure you're using single quotes around the JSON value

### Error: "Permission denied" or "404"
- Verify you shared the sheet with the service account email
- Double-check the Spreadsheet ID is correct

### Error: "Invalid grant"
- The service account key might be invalid
- Try creating a new service account key

## Sheet Name Configuration

By default, data is appended to "Sheet1". To use a different sheet name:

1. Open `src/app/api/sheets/route.ts`
2. Find the line: `range: "Sheet1!A:F"`
3. Change "Sheet1" to your sheet name

## Data Format

Each project creates a new row with:
- Column A: Timestamp (ISO 8601 format)
- Column B: Title
- Column C: URL
- Column D: Description
- Column E: Tags (comma-separated)
- Column F: Image URL
