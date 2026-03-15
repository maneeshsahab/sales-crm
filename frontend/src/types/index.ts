export type Stage =
  | "New Lead"
  | "Discovery"
  | "Demo"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export const STAGES: Stage[] = [
  "New Lead",
  "Discovery",
  "Demo",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export const STAGE_COLORS: Record<Stage, string> = {
  "New Lead": "bg-gray-100 text-gray-800",
  Discovery: "bg-blue-100 text-blue-800",
  Demo: "bg-purple-100 text-purple-800",
  Proposal: "bg-yellow-100 text-yellow-800",
  Negotiation: "bg-orange-100 text-orange-800",
  "Closed Won": "bg-green-100 text-green-800",
  "Closed Lost": "bg-red-100 text-red-800",
};

export interface Lead {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  linkedin_url: string;
  phone: string;
  source: string;
  owner: string;
  stage: Stage;
  notes: string;
  deal_value: number;
  created_date: string;
}

export interface Task {
  id: string;
  lead_id: string;
  task_title: string;
  due_date: string;
  assigned_user: string;
  status: "Pending" | "In Progress" | "Done";
  created_date: string;
}

export interface Meeting {
  id: string;
  lead_id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  attendees: string;
  meet_link: string;
  notes: string;
  created_date: string;
}

export interface EmailLog {
  id: string;
  lead_id: string;
  to: string;
  subject: string;
  body: string;
  sent_date: string;
  sent_by: string;
}

export interface DashboardStats {
  totalLeads: number;
  dealsWon: number;
  dealsLost: number;
  meetingsScheduled: number;
  pipelineValue: number;
  leadsByStage: Record<Stage, number>;
}

export const TEAM_MEMBERS = [
  "Alice Johnson",
  "Bob Smith",
  "Carol Davis",
  "Dan Wilson",
  "Eve Martinez",
];

export const LEAD_SOURCES = [
  "Website",
  "LinkedIn",
  "Referral",
  "Cold Outreach",
  "Conference",
  "Advertisement",
  "Other",
];
