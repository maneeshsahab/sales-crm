"use client";

import { useState } from "react";
import { Lead, STAGES, TEAM_MEMBERS, LEAD_SOURCES } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface LeadFormProps {
  onSubmit: (lead: Omit<Lead, "id" | "created_date">) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function LeadForm({ onSubmit, onCancel, loading }: LeadFormProps) {
  const [form, setForm] = useState({
    company: "",
    contact_name: "",
    email: "",
    linkedin_url: "",
    phone: "",
    source: LEAD_SOURCES[0],
    owner: TEAM_MEMBERS[0],
    stage: STAGES[0] as string,
    notes: "",
    deal_value: 0,
  });

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as Omit<Lead, "id" | "created_date">);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Company" required value={form.company} onChange={(e) => set("company", e.target.value)} />
        <Input label="Contact Name" required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <Input label="LinkedIn URL" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Source"
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
          options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          label="Owner"
          value={form.owner}
          onChange={(e) => set("owner", e.target.value)}
          options={TEAM_MEMBERS.map((m) => ({ value: m, label: m }))}
        />
        <Select
          label="Stage"
          value={form.stage}
          onChange={(e) => set("stage", e.target.value)}
          options={STAGES.map((s) => ({ value: s, label: s }))}
        />
      </div>
      <Input
        label="Deal Value ($)"
        type="number"
        min={0}
        value={form.deal_value}
        onChange={(e) => set("deal_value", Number(e.target.value))}
      />
      <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
