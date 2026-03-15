"use client";

import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { STAGES, TEAM_MEMBERS, LEAD_SOURCES } from "@/types";

export interface Filters {
  stage: string;
  owner: string;
  source: string;
  search: string;
}

interface LeadsFilterProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const allOption = { value: "", label: "All" };

export default function LeadsFilter({ filters, onChange }: LeadsFilterProps) {
  const set = (field: keyof Filters, value: string) =>
    onChange({ ...filters, [field]: value });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Input
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>
      <div className="w-40">
        <Select
          label="Stage"
          value={filters.stage}
          onChange={(e) => set("stage", e.target.value)}
          options={[allOption, ...STAGES.map((s) => ({ value: s, label: s }))]}
        />
      </div>
      <div className="w-40">
        <Select
          label="Owner"
          value={filters.owner}
          onChange={(e) => set("owner", e.target.value)}
          options={[allOption, ...TEAM_MEMBERS.map((m) => ({ value: m, label: m }))]}
        />
      </div>
      <div className="w-40">
        <Select
          label="Source"
          value={filters.source}
          onChange={(e) => set("source", e.target.value)}
          options={[allOption, ...LEAD_SOURCES.map((s) => ({ value: s, label: s }))]}
        />
      </div>
    </div>
  );
}
