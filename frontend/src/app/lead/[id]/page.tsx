"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import {
  getLead,
  getTasks,
  getMeetings,
  getEmails,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  sendEmail,
} from "@/lib/api";
import { Stage, STAGES, STAGE_COLORS, Task } from "@/types";
import { formatDate, formatCurrency, isOverdue } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TaskForm from "@/components/tasks/TaskForm";
import SendEmailForm from "@/components/email/SendEmailForm";
import ScheduleMeetingForm from "@/components/meetings/ScheduleMeetingForm";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckSquare,
  ArrowRightLeft,
  Linkedin,
  Phone,
  Globe,
  User,
} from "lucide-react";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: lead, loading, refetch: refetchLead } = useApi(() => getLead(id), [id]);
  const { data: tasks, refetch: refetchTasks } = useApi(() => getTasks(id), [id]);
  const { data: meetings } = useApi(() => getMeetings(id), [id]);
  const { data: emails } = useApi(() => getEmails(id), [id]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newStage, setNewStage] = useState("");

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleStageChange = async () => {
    if (!newStage) return;
    setActionLoading(true);
    try {
      await updateLeadStage(id, newStage as Stage);
      refetchLead();
      setShowStageModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTask = async (data: { task_title: string; due_date: string; assigned_user: string; status: string }) => {
    setActionLoading(true);
    try {
      await createTask({ ...data, lead_id: id, status: data.status as Task["status"] });
      refetchTasks();
      setShowTaskForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendEmail = async (data: { to: string; subject: string; body: string; sent_by: string }) => {
    setActionLoading(true);
    try {
      await sendEmail({ ...data, lead_id: id });
      setShowEmailForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleMeeting = async (data: {
    title: string;
    date: string;
    time: string;
    duration: number;
    attendees: string;
    notes: string;
  }) => {
    setActionLoading(true);
    try {
      await scheduleMeeting({ ...data, lead_id: id });
      setShowMeetingForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Lead Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.company}</h2>
            <p className="text-gray-500 mt-1">{lead.contact_name}</p>
            <Badge className={`mt-2 ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(lead.deal_value)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Created {formatDate(lead.created_date)}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} /> {lead.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={16} /> {lead.phone || "N/A"}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Linkedin size={16} />
            {lead.linkedin_url ? (
              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
                LinkedIn
              </a>
            ) : "N/A"}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} /> Owner: {lead.owner}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
          <Globe size={16} /> Source: {lead.source}
        </div>

        {lead.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            <strong>Notes:</strong> {lead.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
          <Button size="sm" onClick={() => setShowEmailForm(true)}>
            <Mail size={14} className="mr-1" /> Send Email
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowMeetingForm(true)}>
            <Calendar size={14} className="mr-1" /> Schedule Meeting
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowTaskForm(true)}>
            <CheckSquare size={14} className="mr-1" /> Add Task
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setNewStage(lead.stage); setShowStageModal(true); }}>
            <ArrowRightLeft size={14} className="mr-1" /> Move Stage
          </Button>
        </div>
      </Card>

      {/* Tasks */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks ({tasks?.length || 0})</h3>
        {tasks && tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.task_title}</p>
                  <p className="text-xs text-gray-500">
                    Assigned to {task.assigned_user} &middot; Due {formatDate(task.due_date)}
                  </p>
                </div>
                <Badge className={
                  task.status === "Done" ? "bg-green-100 text-green-800" :
                  isOverdue(task.due_date) ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No tasks yet</p>
        )}
      </Card>

      {/* Meetings */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Meetings ({meetings?.length || 0})</h3>
        {meetings && meetings.length > 0 ? (
          <div className="space-y-2">
            {meetings.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(m.date)} at {m.time} &middot; {m.duration}min</p>
                </div>
                {m.meet_link && (
                  <a href={m.meet_link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No meetings scheduled</p>
        )}
      </Card>

      {/* Emails */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Emails ({emails?.length || 0})</h3>
        {emails && emails.length > 0 ? (
          <div className="space-y-2">
            {emails.map((e) => (
              <div key={e.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{e.subject}</p>
                  <p className="text-xs text-gray-500">{formatDate(e.sent_date)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">To: {e.to} &middot; By: {e.sent_by}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No emails sent</p>
        )}
      </Card>

      {/* Modals */}
      <Modal open={showTaskForm} onClose={() => setShowTaskForm(false)} title="Add Task">
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowTaskForm(false)} loading={actionLoading} />
      </Modal>

      <Modal open={showEmailForm} onClose={() => setShowEmailForm(false)} title="Send Email">
        <SendEmailForm
          defaultTo={lead.email}
          onSubmit={handleSendEmail}
          onCancel={() => setShowEmailForm(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal open={showMeetingForm} onClose={() => setShowMeetingForm(false)} title="Schedule Meeting">
        <ScheduleMeetingForm
          defaultAttendees={lead.email}
          onSubmit={handleScheduleMeeting}
          onCancel={() => setShowMeetingForm(false)}
          loading={actionLoading}
        />
      </Modal>

      <Modal open={showStageModal} onClose={() => setShowStageModal(false)} title="Move Stage">
        <div className="space-y-4">
          <Select
            label="New Stage"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            options={STAGES.map((s) => ({ value: s, label: s }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowStageModal(false)}>Cancel</Button>
            <Button onClick={handleStageChange} disabled={actionLoading}>
              {actionLoading ? "Updating..." : "Update Stage"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
