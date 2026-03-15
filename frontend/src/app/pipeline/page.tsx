"use client";

import { useApi } from "@/hooks/useApi";
import { getLeads } from "@/lib/api";
import PipelineBoard from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  const { data: leads, loading, refetch } = useApi(getLeads);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <PipelineBoard leads={leads || []} onUpdate={refetch} />;
}
