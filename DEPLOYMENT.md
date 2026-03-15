# SalesCRM - Deployment Guide

## Architecture

```
Browser (Next.js on Vercel) → Google Apps Script API → Google Sheets
                                    ↓
                              Gmail API (send emails)
                              Google Calendar API (schedule meetings)
```

---

## Step 1: Set Up Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it **"SalesCRM Database"**
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
4. The Apps Script setup function will create the required tabs automatically (see Step 2)

### Sheet Structure

| Tab | Columns |
|-----|---------|
| **Leads** | id, company, contact_name, email, linkedin_url, phone, source, owner, stage, notes, deal_value, created_date |
| **Tasks** | id, lead_id, task_title, due_date, assigned_user, status, created_date |
| **Meetings** | id, lead_id, title, date, time, duration, attendees, meet_link, notes, created_date |
| **Email_Log** | id, lead_id, to, subject, body, sent_date, sent_by |

---

## Step 2: Deploy the Apps Script Backend

1. Open your Google Sheet from Step 1
2. Go to **Extensions > Apps Script**
3. Delete the default `Code.gs` content
4. Copy the entire contents of `backend-apps-script/Code.gs` and paste it
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID
6. Click the **appsscript.json** file in the sidebar (click the gear icon > Show "appsscript.json" manifest file)
7. Replace its contents with the contents of `backend-apps-script/appsscript.json`

### Initialize the Sheets

8. In the Apps Script editor, select `setupSheets` from the function dropdown
9. Click **Run**
10. Grant the required permissions when prompted (Sheets, Gmail, Calendar)
11. Verify that your spreadsheet now has 4 tabs with headers

### Deploy as Web App

12. Click **Deploy > New deployment**
13. Click the gear icon next to "Select type" and choose **Web app**
14. Set:
    - Description: `SalesCRM API v1`
    - Execute as: **Me**
    - Who has access: **Anyone**
15. Click **Deploy**
16. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`)

### Set Up Task Reminders (Optional)

17. In Apps Script, go to **Triggers** (clock icon in sidebar)
18. Click **+ Add Trigger**
19. Set:
    - Function: `sendTaskReminders`
    - Event source: Time-driven
    - Type: Day timer
    - Time: 8am - 9am
20. Save

---

## Step 3: Connect Frontend to Apps Script

1. Navigate to the `frontend/` directory
2. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Set the Apps Script URL:
   ```
   NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

---

## Step 4: Run Locally (Development)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Step 5: Deploy to Vercel

### Option A: Via Vercel CLI

```bash
npm install -g vercel
cd frontend
vercel
```

Follow the prompts. When asked about environment variables, add:
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### Option B: Via GitHub + Vercel Dashboard

1. Push the `frontend/` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New > Project**
4. Import your GitHub repository
5. Set the **Root Directory** to `frontend`
6. Add the environment variable:
   - Key: `NEXT_PUBLIC_APPS_SCRIPT_URL`
   - Value: your Apps Script Web App URL
7. Click **Deploy**

---

## Step 6: Connect a Custom Domain (Optional)

1. In your Vercel project dashboard, go to **Settings > Domains**
2. Add your domain (e.g., `crm.yourdomain.com`)
3. Follow Vercel's instructions to update your DNS records:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
4. SSL is provisioned automatically

---

## Troubleshooting

### CORS Issues
Google Apps Script Web Apps handle CORS automatically for `doPost` when accessed via `fetch`. If you encounter issues:
- Ensure the Web App access is set to "Anyone"
- The frontend sends `Content-Type: text/plain` to avoid preflight requests

### Apps Script Errors
- Check the Apps Script execution log: **Executions** in the sidebar
- Verify the Spreadsheet ID is correct
- Ensure all 4 tabs exist with correct headers

### Rate Limits
- Google Apps Script: 20,000 calls/day (free tier)
- Gmail: 100 emails/day (free tier)
- For 5 users and 2,000 leads, this is more than sufficient

---

## Cost

| Service | Cost |
|---------|------|
| Google Sheets | Free |
| Google Apps Script | Free |
| Gmail API | Free |
| Google Calendar API | Free |
| Vercel (Hobby) | Free |
| **Total** | **$0** |
