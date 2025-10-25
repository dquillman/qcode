# Data Storage Guide

## Where Your Projects Are Stored

Your Code Q projects are stored in **browser localStorage** under the key: `qcode-projects`

### Important: localStorage is Origin-Specific

localStorage is tied to the **exact origin** (protocol + domain + port):
- `http://localhost:3000` - separate storage
- `http://localhost:3001` - separate storage
- `https://yoursite.com` - separate storage

**This means:** Projects saved on one port won't appear on another port!

## Always Use the Same Port

To avoid losing access to your projects, **always run on port 3000**:

```bash
npm run dev
```

If port 3000 is in use, **kill the process first**:

### Windows:
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill //PID <PID> //F

# Then start dev server
npm run dev
```

### Mac/Linux:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Then start dev server
npm run dev
```

## Backup Your Projects

### Manual Backup via Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage** → **http://localhost:3000**
3. Find the key `qcode-projects`
4. Right-click the value → Copy
5. Save to a `.json` file

### Restore from Backup

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Paste and run:
   ```javascript
   localStorage.setItem('qcode-projects', 'YOUR_COPIED_JSON_HERE')
   ```
4. Refresh the page

## Migration Between Origins

If you saved projects on the wrong port/domain:

1. Open the **old origin** (e.g., `localhost:3001`)
2. Open DevTools Console
3. Copy your data:
   ```javascript
   copy(localStorage.getItem('qcode-projects'))
   ```
4. Open the **new origin** (e.g., `localhost:3000`)
5. Open DevTools Console
6. Paste the data:
   ```javascript
   localStorage.setItem('qcode-projects', 'PASTE_HERE')
   ```
7. Refresh the page

## Google Sheets Backup (Recommended)

To never lose your projects:

1. Set up Google Sheets integration (see main README)
2. When adding projects, check "Also save to Google Sheets"
3. Your projects will be backed up to the cloud
4. On fresh install, projects will load from Google Sheets

## Production Deployment

When deploying to production:
- Projects in development (`localhost`) won't transfer to production
- Either re-add projects in production, OR
- Use Google Sheets sync for automatic synchronization

## Storage Limits

- **localStorage limit:** ~5-10MB per origin
- **Images:** Max 500KB each to prevent quota issues
- **Recommended:** Use image URLs instead of uploading files

## What Happens If localStorage Fills Up?

The app will show an alert with tips to reduce storage:
- Use smaller images (under 500KB)
- Use image URLs instead of uploads
- Delete old projects
- Use Google Sheets integration for backup
