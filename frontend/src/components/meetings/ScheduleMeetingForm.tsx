"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface ScheduleMeetingFormProps {
  defaultAttendees: string;
  onSubmit: (data: {
    title: string;
    date: string;
    time: string;
    duration: number;
    attendees: string;
    notes: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ScheduleMeetingForm({
  defaultAttendees,
  onSubmit,
  onCancel,
  loading,
}: ScheduleMeetingFormProps) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "10:00",
    duration: 30,
    attendees: defaultAttendees,
    notes: "",
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <Input label="Meeting Title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} />
        <Input label="Time" type="time" required value={form.time} onChange={(e) => set("time", e.target.value)} />
        <Input
          label="Duration (min)"
          type="number"
          min={15}
          step={15}
          value={form.duration}
          onChange={(e) => set("duration", Number(e.target.value))}
        />
      </div>
      <Input label="Attendees (emails, comma-separated)" value={form.attendees} onChange={(e) => set("attendees", e.target.value)} />
      <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Scheduling..." : "Schedule Meeting"}</Button>
      </div>
    </form>
  );
}
