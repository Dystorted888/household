"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Baby } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { BabyChecklistItem } from "@prisma/client";

interface BabyPrepCardProps {
  babyProgress: {
    total: number;
    completed: number;
    upcoming: (BabyChecklistItem & { assignedTo?: { name: string } })[];
  };
}

export function BabyPrepCard({ babyProgress }: BabyPrepCardProps) {
  const progressPercentage = babyProgress.total > 0
    ? Math.round((babyProgress.completed / babyProgress.total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Baby className="h-4 w-4" />
          <span>Baby Preparation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {babyProgress.total > 0 ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-on-surface">Progress</span>
                <span className="text-on-surface">{babyProgress.completed}/{babyProgress.total} completed</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-center text-sm font-semibold text-purple-600">
                {progressPercentage}% Complete
              </div>
            </div>

            {/* Next Items */}
            {babyProgress.upcoming.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-on-surface">Next Up</h4>
                <div className="space-y-3">
                  {babyProgress.upcoming.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border-2 border-surface-variant p-3 bg-surface">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm font-medium text-on-surface">{item.title}</span>
                          <Badge variant="secondary" className="text-xs font-medium self-start">{item.section}</Badge>
                        </div>
                        {item.dueDate && (
                          <div className="text-xs text-on-surface-variant font-medium mt-1">
                            Due: {format(item.dueDate, "MMM d")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/baby">
              <Button variant="tonal" className="w-full">
                View all baby prep items →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-outline-variant p-6 text-center">
            <Baby className="h-10 w-10 mx-auto mb-3 text-on-surface-variant/40" />
            <p className="text-on-surface-variant font-medium">No baby preparation items yet</p>
            <Link href="/baby">
              <Button variant="tonal" className="mt-4">
                Start planning →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
