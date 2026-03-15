"use client";

import { useApi } from "@/hooks/useApi";
import { getDashboardStats } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import PipelineChart from "@/components/dashboard/PipelineChart";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Trophy,
  XCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { STAGES, type DashboardStats } from "@/types";

const emptyStats: DashboardStats = {
  totalLeads: 0,
  dealsWon: 0,
  dealsLost: 0,
  meetingsScheduled: 0,
  pipelineValue: 0,
  leadsByStage: Object.fromEntries(STAGES.map((s) => [s, 0])) as DashboardStats["leadsByStage"],
};

export default function DashboardPage() {
  const { data: stats, loading } = useApi(getDashboardStats);
  const s = stats || emptyStats;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Leads" value={s.totalLeads} icon={Users} color="bg-blue-500" />
        <StatCard title="Deals Won" value={s.dealsWon} icon={Trophy} color="bg-green-500" />
        <StatCard title="Deals Lost" value={s.dealsLost} icon={XCircle} color="bg-red-500" />
        <StatCard
          title="Meetings"
          value={s.meetingsScheduled}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(s.pipelineValue)}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>
      <PipelineChart leadsByStage={s.leadsByStage} />
    </div>
  );
}
