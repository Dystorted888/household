import { prisma } from "./prisma";
import { isToday, isAfter, isBefore } from "date-fns";
import { getCurrentWeek } from "./dates";

export async function getDashboardData(householdId: string) {
  const now = new Date();
  const { start: weekStart, end: weekEnd } = getCurrentWeek(now);

  // Today's meal
  const todaysMeal = await prisma.mealPlanEntry.findFirst({
    where: {
      householdId,
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
      mealType: "DINER",
    },
  });

  // Today's tasks
  const todaysTasks = await prisma.task.findMany({
    where: {
      householdId,
      OR: [
        { dueDate: { gte: now, lt: new Date(now.getTime() + 24 * 60 * 60 * 1000) } },
        { dueDate: null },
      ],
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    include: { assignedTo: true },
  });

  // Urgent shopping items (HIGH priority, not bought)
  const urgentShopping = await prisma.shoppingItem.findMany({
    where: {
      list: { householdId },
      priority: "HIGH",
      isBought: false,
    },
    include: { list: true },
    orderBy: { createdAt: "desc" },
  });

  // This week's meals
  const weeklyMeals = await prisma.mealPlanEntry.findMany({
    where: {
      householdId,
      date: { gte: weekStart, lte: weekEnd },
      mealType: "DINER",
    },
    orderBy: { date: "asc" },
  });

  // This week's tasks stats
  const weeklyTasks = await prisma.task.findMany({
    where: {
      householdId,
      dueDate: { gte: weekStart, lte: weekEnd },
    },
    include: { assignedTo: true },
  });

  const weeklyTaskStats = weeklyTasks.reduce(
    (acc, task) => {
      const userId = task.assignedToUserId || "unassigned";
      if (!acc[userId]) acc[userId] = { total: 0, completed: 0, user: task.assignedTo };
      acc[userId].total++;
      if (task.status === "DONE") acc[userId].completed++;
      return acc;
    },
    {} as Record<string, { total: number; completed: number; user?: any }>
  );

  // Baby preparation progress
  let babyItems: any[] = [];
  try {
    babyItems = await prisma.babyChecklistItem.findMany({
      where: { householdId },
      orderBy: { dueDate: "asc" },
    });
  } catch (error: any) {
    // If migration hasn't been run, the assignedToUserId column might not exist
    // Fall back to empty array
    console.error("Error fetching baby items:", error?.message);
    babyItems = [];
  }

  const babyProgress = {
    total: babyItems.length,
    completed: babyItems.filter(item => item.status === "DONE").length,
    upcoming: babyItems
      .filter(item => item.status !== "DONE")
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      })
      .slice(0, 3),
  };

  return {
    todaysMeal,
    todaysTasks,
    urgentShopping,
    weeklyMeals,
    weeklyTaskStats,
    babyProgress,
  };
}

export async function getUsers(householdId: string) {
  // First, check if users exist for this household
  const existingUsers = await prisma.user.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
  });

  // If no users exist, create Husband and Wife
  if (existingUsers.length === 0) {
    const { UserRole } = await import("@prisma/client");
    
    // Create Husband and Wife users
    const [husband, wife] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Husband",
          email: `husband-${householdId}@example.local`,
          role: UserRole.ADMIN,
          profile: "Husband",
          householdId: householdId,
          color: "#2563eb",
        },
      }),
      prisma.user.create({
        data: {
          name: "Wife",
          email: `wife-${householdId}@example.local`,
          role: UserRole.MEMBER,
          profile: "Wife",
          householdId: householdId,
          color: "#db2777",
        },
      }),
    ]);

    return [husband, wife].sort((a, b) => a.name.localeCompare(b.name));
  }

  // If users exist but we're missing Husband or Wife, create the missing one(s)
  const hasHusband = existingUsers.some(u => u.profile === "Husband" || u.name === "Husband");
  const hasWife = existingUsers.some(u => u.profile === "Wife" || u.name === "Wife");

  if (!hasHusband || !hasWife) {
    const { UserRole } = await import("@prisma/client");
    const usersToCreate = [];

    if (!hasHusband) {
      usersToCreate.push(
        prisma.user.create({
          data: {
            name: "Husband",
            email: `husband-${householdId}@example.local`,
            role: UserRole.ADMIN,
            profile: "Husband",
            householdId: householdId,
            color: "#2563eb",
          },
        })
      );
    }

    if (!hasWife) {
      usersToCreate.push(
        prisma.user.create({
          data: {
            name: "Wife",
            email: `wife-${householdId}@example.local`,
            role: UserRole.MEMBER,
            profile: "Wife",
            householdId: householdId,
            color: "#db2777",
          },
        })
      );
    }

    const newUsers = await Promise.all(usersToCreate);
    const allUsers = [...existingUsers, ...newUsers];
    return allUsers.sort((a, b) => a.name.localeCompare(b.name));
  }

  return existingUsers;
}