import { prisma } from "./prisma";
import { addDays, addWeeks, addMonths } from "date-fns";
import { TaskType, TaskStatus, RecurringFrequency } from "@prisma/client";

export async function getTasksForToday(householdId: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      householdId,
      OR: [
        {
          dueDate: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
        {
          dueDate: null,
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
      ],
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    include: { assignedTo: true },
    orderBy: { createdAt: "asc" },
  });

  return tasks;
}

export async function getTasksForWeek(householdId: string) {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = addDays(weekStart, 7);

  const tasks = await prisma.task.findMany({
    where: {
      householdId,
      dueDate: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    include: { assignedTo: true },
    orderBy: { dueDate: "asc" },
  });

  return tasks;
}

export async function getRecurringTasks(householdId: string) {
  return await prisma.recurringTask.findMany({
    where: { householdId, isActive: true },
    include: { assignedTo: true },
    orderBy: { nextOccurrenceAt: "asc" },
  });
}

export async function createTask(
  householdId: string,
  title: string,
  description?: string,
  type: TaskType = TaskType.GENERIC,
  assignedToUserId?: string,
  dueDate?: Date
) {
  return await prisma.task.create({
    data: {
      householdId,
      title,
      description,
      type,
      assignedToUserId,
      dueDate,
    },
  });
}

export async function createRecurringTask(
  householdId: string,
  title: string,
  frequency: RecurringFrequency,
  description?: string,
  interval: number = 1,
  assignedToUserId?: string
) {
  const nextOccurrenceAt = calculateNextOccurrence(new Date(), frequency, interval);

  return await prisma.recurringTask.create({
    data: {
      householdId,
      title,
      description,
      frequency,
      interval,
      assignedToUserId,
      nextOccurrenceAt,
    },
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const data: any = { status };
  if (status === "DONE") {
    data.completedAt = new Date();
  }

  return await prisma.task.update({
    where: { id: taskId },
    data,
  });
}

export async function completeRecurringTask(recurringTaskId: string) {
  const recurringTask = await prisma.recurringTask.findUnique({
    where: { id: recurringTaskId },
  });

  if (!recurringTask) return null;

  const now = new Date();
  const nextOccurrenceAt = calculateNextOccurrence(
    now,
    recurringTask.frequency,
    recurringTask.interval || 1
  );

  // Update the recurring task
  const updatedRecurringTask = await prisma.recurringTask.update({
    where: { id: recurringTaskId },
    data: {
      lastOccurrenceAt: now,
      nextOccurrenceAt,
    },
  });

  // Optionally create a task record for the completed occurrence
  // This could be useful for tracking history
  const completedTask = await prisma.task.create({
    data: {
      householdId: recurringTask.householdId,
      title: recurringTask.title,
      description: recurringTask.description,
      type: TaskType.GENERIC,
      assignedToUserId: recurringTask.assignedToUserId,
      status: TaskStatus.DONE,
      dueDate: recurringTask.nextOccurrenceAt,
      completedAt: now,
    },
  });

  return { updatedRecurringTask, completedTask };
}

function calculateNextOccurrence(
  from: Date,
  frequency: RecurringFrequency,
  interval: number
): Date {
  switch (frequency) {
    case RecurringFrequency.DAILY:
      return addDays(from, interval);
    case RecurringFrequency.WEEKLY:
      return addWeeks(from, interval);
    case RecurringFrequency.BIWEEKLY:
      return addWeeks(from, interval * 2);
    case RecurringFrequency.MONTHLY:
      return addMonths(from, interval);
    case RecurringFrequency.CUSTOM:
    default:
      return addDays(from, 1);
  }
}
