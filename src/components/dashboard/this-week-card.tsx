"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MealPlanEntry } from "@prisma/client";

interface ThisWeekCardProps {
  weeklyMeals: MealPlanEntry[];
  weeklyTaskStats: Record<string, { total: number; completed: number; user?: { name: string } }>;
}

export function ThisWeekCard({ weeklyMeals, weeklyTaskStats }: ThisWeekCardProps) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Meal Strip */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Meals</h3>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {dayNames.map((day, index) => {
              const meal = weeklyMeals.find((m) => new Date(m.date).getDay() === (index + 1) % 7);
              return (
                <div key={day} className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-on-surface-variant mb-1 sm:mb-2">{day}</div>
                  <div className="min-h-[3rem] sm:min-h-[3.5rem] rounded-lg border-2 border-surface-variant bg-surface p-1 sm:p-2 text-xs sm:text-sm flex items-center justify-center">
                    {meal ? (
                      <div className="line-clamp-3 text-on-surface font-medium text-center leading-tight">{meal.label}</div>
                    ) : (
                      <div className="text-on-surface-variant/60 font-medium">-</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Task Stats */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface mb-4">Tasks</h3>
          <div className="space-y-3">
            {Object.entries(weeklyTaskStats).map(([userId, stats]) => (
              <div key={userId} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border-2 border-surface-variant p-4 bg-surface gap-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-primary/30 text-primary font-medium">
                    {stats.user?.name || "Unassigned"}
                  </Badge>
                  <span className="text-sm text-on-surface font-medium">
                    {stats.completed}/{stats.total} completed
                  </span>
                </div>
                <div className="w-full sm:w-24 h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(weeklyTaskStats).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-outline-variant p-4 text-center text-on-surface-variant">
                No tasks this week
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
