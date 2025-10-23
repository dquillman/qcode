# 📊 Google Sheets Setup Guide

Follow these steps to enable saving your projects to Google Sheets.

---

## 🎯 Step 1: Create a Google Cloud Project

1. Go to: **https://console.cloud.google.com/**
2. Click the dropdown next to "Google Cloud" at the top
3. Click **"New Project"**
4. Name it: **"Code Q Projects"** (or whatever you prefer)
5. Click **"Create"**
6. Wait for it to create (you'll see a notification)

---

## 🔌 Step 2: Enable Google Sheets API

1. Make sure your new project is selected (top dropdown)
2. Click the **☰ menu** (top left)
3. Go to: **APIs & Services** → **Library**
4. Search for: **"Google Sheets API"**
5. Click on **"Google Sheets API"**
6. Click **"Enable"**

---

## 🤖 Step 3: Create a Service Account

1. Click the **☰ menu** (top left)
2. Go to: **APIs & Services** → **Credentials**
3. Click **"+ Create Credentials"** at the top
4. Choose **"Service Account"**
5. Fill in the form:
   - **Service account name**: `codeq-sheets`
   - **Service account ID**: (auto-fills)
   - **Description**: `Service account for Code Q project management`
6. Click **"Create and Continue"**
7. Skip the optional steps (just click **"Continue"** then **"Done"**)

---

## 🔑 Step 4: Download Service Account Key

1. You should be on the **Credentials** page
2. Look for **"Service Accounts"** section at the bottom
3. Click on the email address of the service account you just created
   - It looks like: `codeq-sheets@your-project.iam.gserviceaccount.com`
4. Click the **"Keys"** tab
5. Click **"Add Key"** → **"Create new key"**
6. Select **JSON** format
7. Click **"Create"**
8. A JSON file will download - **SAVE THIS FILE!** You'll need it soon

---

## 📄 Step 5: Create Your Google Sheet

1. Go to: **https://sheets.google.com**
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **"Code Q Projects"** (top left)
4. **(Optional but recommended)** Add headers in row 1:
   - A1: `Timestamp`
   - B1: `Title`
   - C1: `URL`
   - D1: `Description`
   - E1: `Tags`
   - F1: `Image URL`
5. **Copy the Spreadsheet ID** from the URL:
   - Your URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy just the `SPREADSHEET_ID_HERE` part (between `/d/` and `/edit`)
   - **Save this ID** - you'll need it!

---

## 🔐 Step 6: Share Sheet with Service Account

1. In your Google Sheet, click the **"Share"** button (top right)
2. Open the JSON file you downloaded in Step 4
3. Find the `"client_email"` field - it looks like:
   ```
   "client_email": "codeq-sheets@your-project.iam.gserviceaccount.com"
   ```
4. Copy that entire email address
5. Paste it into the "Share" dialog
6. Make sure **"Editor"** permission is selected
7. **Uncheck** "Notify people" (no need to send email)
8. Click **"Share"** or **"Send"**

---

## ⚙️ Step 7: Configure Environment Variables

1. In your project folder, look for a file called **`.env.local`**
   - If it doesn't exist, create it
   - **Windows**: Right-click in folder → New → Text Document → rename to `.env.local`
   - **Make sure** it's `.env.local` not `.env.local.txt`

2. Open the `.env.local` file in a text editor

3. Open the JSON file from Step 4 in a text editor

4. Copy the **ENTIRE contents** of the JSON file (it's one long line)

5. Add these two lines to your `.env.local` file:

```env
GOOGLE_SERVICE_ACCOUNT_KEY='PASTE_YOUR_ENTIRE_JSON_HERE'
GOOGLE_SHEET_ID=PASTE_YOUR_SPREADSHEET_ID_HERE
```

### Example:
```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"codeq-12345","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n","client_email":"codeq-sheets@codeq-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/codeq-sheets%40codeq-12345.iam.gserviceaccount.com"}'

GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
```

**IMPORTANT:**
- Wrap the JSON in **single quotes** `'...'`
- Replace `PASTE_YOUR_ENTIRE_JSON_HERE` with the actual JSON content
- Replace `PASTE_YOUR_SPREADSHEET_ID_HERE` with your Sheet ID from Step 5

---

## 🚀 Step 8: Restart Your Development Server

1. Stop your dev server: Press **Ctrl+C** in the terminal
2. Start it again: `npm run dev`
3. Wait for it to say "Ready"

---

## ✅ Step 9: Test It!

1. Go to your website: **http://localhost:3000**
2. Login as admin
3. Click **"Add Project"**
4. Fill in the project details
5. Check the box: **"Also save to Google Sheets"**
6. Click **"Save Project"**
7. You should see: **"✓ Saved to Google Sheets!"**
8. Check your Google Sheet - you should see a new row!

---

## 🆘 Troubleshooting

### Error: "Google Sheets not configured"
- Make sure both environment variables are set in `.env.local`
- Restart your dev server after adding them

### Error: "Invalid Google credentials format"
- Check that the JSON is wrapped in single quotes `'...'`
- Make sure you copied the entire JSON (starts with `{` ends with `}`)
- No extra spaces or line breaks inside the quotes

### Error: "Permission denied" or "404"
- Did you share the sheet with the service account email?
- Is the Spreadsheet ID correct?
- Try copying the ID from the URL again

### Error: "Invalid grant"
- The service account key might be old or invalid
- Try creating a new key (Step 4)

### Nothing happens when I check the box
- Check the browser console (F12) for errors
- Make sure the dev server restarted after adding environment variables

---

## 📝 Notes

- The `.env.local` file is in `.gitignore` - it won't be committed to git
- **Never share** your service account JSON file publicly
- The session lasts 24 hours, then you need to login again
- Each project creates one row in your sheet

---

## 🎉 You're Done!

Your projects will now be saved to Google Sheets automatically when you check the box!

Need help? Check the main README or create an issue on GitHub.
