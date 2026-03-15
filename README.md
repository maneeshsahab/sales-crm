# SalesCRM

A free, lightweight Sales CRM for small teams. All data lives in Google Sheets, the API runs on Google Apps Script, and the frontend deploys to Vercel — **$0 total cost**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-34A853?logo=google-sheets)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

| Feature | Description |
|---------|-------------|
| **Lead Management** | Add, edit, and filter leads with 12 fields per record |
| **Pipeline Board** | Drag-and-drop Kanban across 7 stages |
| **Lead Detail** | Full profile view with tasks, emails, and meetings |
| **Task Management** | Create tasks, cycle statuses, overdue alerts |
| **Email Sending** | Send emails via Gmail API, auto-logged |
| **Meeting Scheduling** | Create Google Calendar events with Meet links |
| **Dashboard** | Key metrics, pipeline chart, deal values |
| **Filters** | Filter by stage, owner, source, and free-text search |

## Architecture

```
┌──────────────┐     POST /exec      ┌────────────────────┐     Read/Write     ┌───────────────┐
│  Next.js App │ ──────────────────▶  │  Google Apps Script │ ────────────────▶  │ Google Sheets │
│  (Vercel)    │ ◀──────────────────  │  (Web App)         │ ◀────────────────  │ (Database)    │
└──────────────┘     JSON response    └────────┬───────────┘                    └───────────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                              ┌─────▼─────┐        ┌─────▼──────┐
                              │ Gmail API │        │ Calendar   │
                              │ (send)    │        │ API (meet) │
                              └───────────┘        └────────────┘
```

## Quick Start

### 1. Set Up Google Sheets

1. Create a new Google Sheet
2. Copy the **Spreadsheet ID** from the URL

### 2. Deploy Apps Script Backend

1. Open the Sheet → **Extensions → Apps Script**
2. Replace `Code.gs` with [`backend-apps-script/Code.gs`](backend-apps-script/Code.gs)
3. Set `SPREADSHEET_ID` to your Sheet ID
4. Run `setupSheets` to initialize tabs and headers
5. **Deploy → New deployment → Web app** (Execute as: Me, Access: Anyone)
6. Copy the deployment URL

### 3. Run the Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_APPS_SCRIPT_URL

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
cd frontend
npx vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and set the root directory to `frontend`.

Add the environment variable in Vercel dashboard:
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

> See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide.

## Project Structure

```
sales-crm/
├── README.md
├── DEPLOYMENT.md
├── LICENSE
├── .gitignore
│
├── backend-apps-script/
│   ├── Code.gs              # API endpoints, Gmail, Calendar integration
│   └── appsscript.json      # OAuth scopes
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── .eslintrc.json
    ├── .gitignore
    │
    └── src/
        ├── types/index.ts           # TypeScript interfaces
        ├── lib/api.ts               # Apps Script API client
        ├── lib/utils.ts             # Formatting helpers
        ├── hooks/useApi.ts          # Data fetching hook
        │
        ├── components/
        │   ├── ui/                  # Button, Input, Select, Modal, Badge, Card, Textarea
        │   ├── layout/              # Sidebar, Header, AppShell
        │   ├── dashboard/           # StatCard, PipelineChart
        │   ├── leads/               # LeadForm, LeadsFilter
        │   ├── pipeline/            # PipelineBoard (drag-and-drop Kanban)
        │   ├── tasks/               # TaskForm
        │   ├── email/               # SendEmailForm
        │   └── meetings/            # ScheduleMeetingForm
        │
        └── app/
            ├── page.tsx             # Landing page
            ├── layout.tsx           # Root layout
            ├── globals.css          # Tailwind base styles
            ├── dashboard/page.tsx   # Metrics dashboard
            ├── leads/page.tsx       # Leads table with filters
            ├── pipeline/page.tsx    # Kanban pipeline board
            ├── lead/[id]/page.tsx   # Lead detail page
            └── tasks/page.tsx       # Task list
```

## Google Sheets Schema

### Leads
| Column | Type | Description |
|--------|------|-------------|
| id | string | Auto-generated UUID |
| company | string | Company name |
| contact_name | string | Primary contact |
| email | string | Contact email |
| linkedin_url | string | LinkedIn profile URL |
| phone | string | Phone number |
| source | string | Lead source (Website, LinkedIn, Referral, etc.) |
| owner | string | Assigned team member |
| stage | string | Pipeline stage |
| notes | string | Free-text notes |
| deal_value | number | Deal value in USD |
| created_date | string | Date created (YYYY-MM-DD) |

### Tasks
| Column | Type | Description |
|--------|------|-------------|
| id | string | Auto-generated UUID |
| lead_id | string | Associated lead |
| task_title | string | Task description |
| due_date | string | Due date (YYYY-MM-DD) |
| assigned_user | string | Assigned team member |
| status | string | Pending / In Progress / Done |
| created_date | string | Date created |

### Meetings
| Column | Type | Description |
|--------|------|-------------|
| id | string | Auto-generated UUID |
| lead_id | string | Associated lead |
| title | string | Meeting title |
| date | string | Meeting date |
| time | string | Start time (HH:MM) |
| duration | number | Duration in minutes |
| attendees | string | Comma-separated emails |
| meet_link | string | Google Meet URL (auto-generated) |
| notes | string | Meeting notes |
| created_date | string | Date created |

### Email_Log
| Column | Type | Description |
|--------|------|-------------|
| id | string | Auto-generated UUID |
| lead_id | string | Associated lead |
| to | string | Recipient email |
| subject | string | Email subject |
| body | string | Email body |
| sent_date | string | Date sent |
| sent_by | string | Sender name |

## API Endpoints

All endpoints are called via `POST` to the Apps Script web app URL with a JSON body containing an `action` field:

| Action | Parameters | Description |
|--------|-----------|-------------|
| `getLeads` | — | List all leads |
| `getLead` | `id` | Get single lead |
| `createLead` | `lead` | Create new lead |
| `updateLead` | `id`, `updates` | Update lead fields |
| `updateLeadStage` | `id`, `stage` | Move lead to new stage |
| `getTasks` | `lead_id?` | List tasks (optionally by lead) |
| `createTask` | `task` | Create new task |
| `updateTask` | `id`, `updates` | Update task |
| `getMeetings` | `lead_id?` | List meetings |
| `scheduleMeeting` | `meeting` | Schedule meeting + Calendar event |
| `sendEmail` | `email` | Send email via Gmail + log it |
| `getEmails` | `lead_id?` | List sent emails |
| `getDashboardStats` | — | Aggregated dashboard metrics |

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14, React 18, Tailwind CSS | — |
| Hosting | Vercel (Hobby plan) | Free |
| Database | Google Sheets | Free |
| Backend API | Google Apps Script | Free |
| Email | Gmail API | Free |
| Meetings | Google Calendar API | Free |
| Drag & Drop | @hello-pangea/dnd | — |
| Icons | Lucide React | — |
| **Total** | | **$0** |

## Limits

- Google Apps Script: 20,000 executions/day
- Gmail: 100 emails/day (consumer), 1,500/day (Workspace)
- Google Sheets: 10 million cells
- Designed for: 5 users, up to 2,000 leads

## License

[MIT](LICENSE)
