"use client";

import Card from "@/components/ui/Card";
import { Stage, STAGES, STAGE_COLORS } from "@/types";

interface PipelineChartProps {
  leadsByStage: Record<Stage, number>;
}

export default function PipelineChart({ leadsByStage }: PipelineChartProps) {
  const maxCount = Math.max(...Object.values(leadsByStage), 1);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const count = leadsByStage[stage] || 0;
          const pct = (count / maxCount) * 100;
          return (
            <div key={stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{stage}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${STAGE_COLORS[stage].split(" ")[0]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
