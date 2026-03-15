"use client";

import { useState, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { getTasks, updateTask } from "@/lib/api";
import { Task, TEAM_MEMBERS } from "@/types";
import { formatDate, isOverdue, isDueToday } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function TasksPage() {
  const { data: tasks, loading, refetch } = useApi(getTasks);
  const [filterOwner, setFilterOwner] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (filterOwner && t.assigned_user !== filterOwner) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterOwner, filterStatus]);

  const toggleStatus = async (task: Task) => {
    const next = task.status === "Done" ? "Pending" : task.status === "Pending" ? "In Progress" : "Done";
    await updateTask(task.id, { status: next });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="w-40">
          <Select
            label="Owner"
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            options={[{ value: "", label: "All" }, ...TEAM_MEMBERS.map((m) => ({ value: m, label: m }))]}
          />
        </div>
        <div className="w-40">
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "All" },
              { value: "Pending", label: "Pending" },
              { value: "In Progress", label: "In Progress" },
              { value: "Done", label: "Done" },
            ]}
          />
        </div>
      </div>

      <Card>
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No tasks found</div>
          ) : (
            filtered.map((task) => {
              const overdue = task.status !== "Done" && isOverdue(task.due_date);
              const dueToday = task.status !== "Done" && isDueToday(task.due_date);

              return (
                <div key={task.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(task)} className="text-gray-400 hover:text-brand-600">
                      {task.status === "Done" ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : overdue ? (
                        <AlertTriangle size={20} className="text-red-500" />
                      ) : (
                        <Clock size={20} />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${task.status === "Done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {task.task_title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.assigned_user} &middot; Due {formatDate(task.due_date)}
                        {dueToday && <span className="text-orange-500 font-medium"> (Today)</span>}
                        {overdue && <span className="text-red-500 font-medium"> (Overdue)</span>}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      task.status === "Done"
                        ? "bg-green-100 text-green-800"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
