"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { TEAM_MEMBERS } from "@/types";

interface TaskFormProps {
  onSubmit: (data: {
    task_title: string;
    due_date: string;
    assigned_user: string;
    status: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, loading }: TaskFormProps) {
  const [form, setForm] = useState({
    task_title: "",
    due_date: "",
    assigned_user: TEAM_MEMBERS[0],
    status: "Pending" as string,
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Input label="Task Title" required value={form.task_title} onChange={(e) => set("task_title", e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Due Date" type="date" required value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
        <Select
          label="Assigned To"
          value={form.assigned_user}
          onChange={(e) => set("assigned_user", e.target.value)}
          options={TEAM_MEMBERS.map((m) => ({ value: m, label: m }))}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Add Task"}</Button>
      </div>
    </form>
  );
}
