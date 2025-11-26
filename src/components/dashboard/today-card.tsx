"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { MealPlanEntry, Task } from "@prisma/client";

interface TodayCardProps {
  todaysMeal: MealPlanEntry | null;
  todaysTasks: (Task & { assignedTo?: { name: string } })[];
  onTaskToggle: (taskId: string, completed: boolean) => void;
}

export function TodayCard({ todaysMeal, todaysTasks, onTaskToggle }: TodayCardProps) {
  const getMealBadge = (label: string) => {
    if (label.toLowerCase().includes("order") || label.toLowerCase().includes("delivery")) {
      return <Badge variant="outline" className="ml-2">Order food</Badge>;
    }
    if (label.toLowerCase().includes("leftovers") || label.toLowerCase().includes("left over")) {
      return <Badge variant="outline" className="ml-2">Leftovers</Badge>;
    }
    if (label.toLowerCase().includes("eat out") || label.toLowerCase().includes("restaurant")) {
      return <Badge variant="outline" className="ml-2">Eating out</Badge>;
    }
    return null;
  };

  const getAssigneeBadge = (userName?: string) => {
    if (!userName) return <Badge variant="secondary" className="ml-2">Unassigned</Badge>;
    return <Badge variant="secondary" className="ml-2">{userName}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tonight's Meal */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-3">Tonight's Meal</h3>
          {todaysMeal ? (
            <div className="rounded-xl border-2 border-surface-variant p-4 bg-surface-variant/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium text-on-surface">{todaysMeal.label}</span>
                {getMealBadge(todaysMeal.label)}
              </div>
              {todaysMeal.notes && (
                <p className="text-sm text-on-surface-variant mt-2">{todaysMeal.notes}</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
              No meal planned for tonight
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-3">Today's Tasks</h3>
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 rounded-xl border-2 border-surface-variant p-4 bg-surface">
                  <Checkbox
                    checked={task.status === "DONE"}
                    onCheckedChange={(checked) =>
                      onTaskToggle(task.id, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`block font-medium ${task.status === "DONE" ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-sm text-on-surface-variant mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getAssigneeBadge(task.assignedTo?.name)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
              No tasks due today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
