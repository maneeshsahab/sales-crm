import {
  Lead,
  Task,
  Meeting,
  EmailLog,
  DashboardStats,
  Stage,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

async function apiCall<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...params }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data as T;
}

// --- Leads ---

export async function getLeads(): Promise<Lead[]> {
  return apiCall<Lead[]>("getLeads");
}

export async function getLead(id: string): Promise<Lead> {
  return apiCall<Lead>("getLead", { id });
}

export async function createLead(lead: Omit<Lead, "id" | "created_date">): Promise<Lead> {
  return apiCall<Lead>("createLead", { lead });
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  return apiCall<Lead>("updateLead", { id, updates });
}

export async function updateLeadStage(id: string, stage: Stage): Promise<Lead> {
  return apiCall<Lead>("updateLeadStage", { id, stage });
}

// --- Tasks ---

export async function getTasks(leadId?: string): Promise<Task[]> {
  return apiCall<Task[]>("getTasks", leadId ? { lead_id: leadId } : {});
}

export async function createTask(task: Omit<Task, "id" | "created_date">): Promise<Task> {
  return apiCall<Task>("createTask", { task });
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  return apiCall<Task>("updateTask", { id, updates });
}

// --- Meetings ---

export async function getMeetings(leadId?: string): Promise<Meeting[]> {
  return apiCall<Meeting[]>("getMeetings", leadId ? { lead_id: leadId } : {});
}

export async function scheduleMeeting(
  meeting: Omit<Meeting, "id" | "meet_link" | "created_date">
): Promise<Meeting> {
  return apiCall<Meeting>("scheduleMeeting", { meeting });
}

// --- Email ---

export async function sendEmail(email: Omit<EmailLog, "id" | "sent_date">): Promise<EmailLog> {
  return apiCall<EmailLog>("sendEmail", { email });
}

export async function getEmails(leadId?: string): Promise<EmailLog[]> {
  return apiCall<EmailLog[]>("getEmails", leadId ? { lead_id: leadId } : {});
}

// --- Dashboard ---

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiCall<DashboardStats>("getDashboardStats");
}
