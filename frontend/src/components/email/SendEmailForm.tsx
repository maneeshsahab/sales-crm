"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface SendEmailFormProps {
  defaultTo: string;
  onSubmit: (data: { to: string; subject: string; body: string; sent_by: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SendEmailForm({ defaultTo, onSubmit, onCancel, loading }: SendEmailFormProps) {
  const [form, setForm] = useState({
    to: defaultTo,
    subject: "",
    body: "",
    sent_by: "",
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
      <Input label="To" type="email" required value={form.to} onChange={(e) => set("to", e.target.value)} />
      <Input label="Subject" required value={form.subject} onChange={(e) => set("subject", e.target.value)} />
      <Textarea label="Body" required value={form.body} onChange={(e) => set("body", e.target.value)} rows={6} />
      <Input label="Sent By" required value={form.sent_by} onChange={(e) => set("sent_by", e.target.value)} />
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Email"}</Button>
      </div>
    </form>
  );
}
