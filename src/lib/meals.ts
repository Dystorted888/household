import { prisma } from "./prisma";
import { getCurrentWeek, addDays, format } from "./dates";

export async function getMealsForWeek(householdId: string, weekOffset: number = 0) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + (weekOffset * 7));
  const { start, end } = getCurrentWeek(baseDate);

  const meals = await prisma.mealPlanEntry.findMany({
    where: {
      householdId,
      date: {
        gte: start,
        lte: end,
      },
      mealType: "DINER",
    },
    orderBy: { date: "asc" },
  });

  // Create a map of date -> meal for easy lookup
  const mealsMap = new Map();
  meals.forEach(meal => {
    const dateKey = format(meal.date, "yyyy-MM-dd");
    mealsMap.set(dateKey, meal);
  });

  // Fill in the week with all 7 days
  const weekMeals = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const dateKey = format(date, "yyyy-MM-dd");
    const meal = mealsMap.get(dateKey);

    weekMeals.push({
      date,
      dateKey,
      dayOfWeek: format(date, "EEEE"),
      meal: meal || null,
    });
  }

  return {
    weekMeals,
    weekOffset,
    weekStart: start,
    weekEnd: end,
  };
}

export async function createOrUpdateMeal(
  householdId: string,
  date: Date,
  label: string,
  notes?: string,
  status: "PLANNED" | "DONE" = "PLANNED"
) {
  // First, try to find an existing meal entry for this household, date, and meal type
  const existingMeal = await prisma.mealPlanEntry.findFirst({
    where: {
      householdId,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
      mealType: "DINER",
    },
  });

  if (existingMeal) {
    // Update existing meal
    return await prisma.mealPlanEntry.update({
      where: { id: existingMeal.id },
      data: {
        label,
        notes,
        status,
      },
    });
  } else {
    // Create new meal
    return await prisma.mealPlanEntry.create({
      data: {
        householdId,
        date,
        dayOfWeek: format(date, "EEEE"),
        mealType: "DINER",
        label,
        notes,
        status,
      },
    });
  }
}

export async function updateMealStatus(householdId: string, mealId: string, status: "PLANNED" | "DONE") {
  return await prisma.mealPlanEntry.updateMany({
    where: {
      id: mealId,
      householdId,
    },
    data: { status },
  });
}
