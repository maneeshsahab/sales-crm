"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Lead, Stage, STAGES, STAGE_COLORS } from "@/types";
import { updateLeadStage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface PipelineBoardProps {
  leads: Lead[];
  onUpdate: () => void;
}

export default function PipelineBoard({ leads, onUpdate }: PipelineBoardProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const columns: Record<Stage, Lead[]> = {} as Record<Stage, Lead[]>;
  for (const stage of STAGES) {
    columns[stage] = leads.filter((l) => l.stage === stage);
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const leadId = result.draggableId;
    const newStage = result.destination.droppableId as Stage;

    if (result.source.droppableId === newStage) return;

    setUpdating(leadId);
    try {
      await updateLeadStage(leadId, newStage);
      onUpdate();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <Badge className={STAGE_COLORS[stage]}>{stage}</Badge>
              <span className="text-xs text-gray-500">{columns[stage].length}</span>
            </div>
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] rounded-lg p-2 space-y-2 transition-colors ${
                    snapshot.isDraggingOver ? "bg-brand-50" : "bg-gray-100"
                  }`}
                >
                  {columns[stage].map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-lg border p-3 shadow-sm ${
                            snapshot.isDragging ? "shadow-lg ring-2 ring-brand-500" : ""
                          } ${updating === lead.id ? "opacity-50" : ""}`}
                        >
                          <Link href={`/lead/${lead.id}`} className="block">
                            <p className="font-medium text-sm text-gray-900">{lead.company}</p>
                            <p className="text-xs text-gray-500 mt-1">{lead.contact_name}</p>
                            {lead.deal_value > 0 && (
                              <p className="text-xs font-medium text-green-600 mt-2">
                                {formatCurrency(lead.deal_value)}
                              </p>
                            )}
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
