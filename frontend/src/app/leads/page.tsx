"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { getLeads, createLead } from "@/lib/api";
import { Lead, STAGE_COLORS, Stage } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LeadForm from "@/components/leads/LeadForm";
import LeadsFilter, { Filters } from "@/components/leads/LeadsFilter";
import { Plus } from "lucide-react";

export default function LeadsPage() {
  const { data: leads, loading, refetch } = useApi(getLeads);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    stage: "",
    owner: "",
    source: "",
    search: "",
  });

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      if (filters.stage && lead.stage !== filters.stage) return false;
      if (filters.owner && lead.owner !== filters.owner) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${lead.company} ${lead.contact_name} ${lead.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filters]);

  const handleCreate = async (lead: Omit<Lead, "id" | "created_date">) => {
    setCreating(true);
    try {
      await createLead(lead);
      setShowForm(false);
      refetch();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <LeadsFilter filters={filters} onChange={setFilters} />
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-1" /> Add Lead
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Loading leads...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/lead/${lead.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {lead.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{lead.contact_name}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.email}</td>
                    <td className="px-4 py-3">
                      <Badge className={STAGE_COLORS[lead.stage as Stage]}>
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{lead.owner}</td>
                    <td className="px-4 py-3">{formatCurrency(lead.deal_value)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(lead.created_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Lead">
        <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={creating} />
      </Modal>
    </div>
  );
}
