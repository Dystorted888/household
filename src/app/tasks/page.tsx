import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getTasksForToday, getTasksForWeek, getRecurringTasks } from "@/lib/tasks";
import { getUsers } from "@/lib/dashboard";
import { TasksClient } from "@/components/tasks/tasks-client";

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const householdId = await getHouseholdId();
  const todayTasks = await getTasksForToday(householdId);
  const weekTasks = await getTasksForWeek(householdId);
  const recurringTasks = await getRecurringTasks(householdId);
  const users = await getUsers(householdId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksClient
        initialTodayTasks={todayTasks}
        initialWeekTasks={weekTasks}
        initialRecurringTasks={recurringTasks}
        users={users}
      />
    </Suspense>
  );
}
