import { prisma } from "./prisma";
import { BabyItemType, BabyItemStatus } from "@prisma/client";

const SECTIONS = [
  "Room",
  "Health",
  "Transport",
  "Hygiene",
  "Admin",
  "Organization"
] as const;

export { SECTIONS };

export async function getBabyChecklistItems(householdId: string) {
  return await prisma.babyChecklistItem.findMany({
    where: { householdId },
    include: {
      relatedTask: true,
      relatedShoppingItem: true,
    },
    orderBy: [
      { section: "asc" },
      { dueDate: "asc" },
      { createdAt: "asc" },
    ],
  });
}

export async function createBabyChecklistItem(
  householdId: string,
  section: string,
  title: string,
  itemType: BabyItemType,
  dueDate?: Date
) {
  return await prisma.babyChecklistItem.create({
    data: {
      householdId,
      section,
      title,
      itemType,
      dueDate,
    },
  });
}

export async function updateBabyItemStatus(
  itemId: string,
  status: BabyItemStatus
) {
  const data: any = { status };
  if (status === "DONE") {
    data.completedAt = new Date();
  }

  return await prisma.babyChecklistItem.update({
    where: { id: itemId },
    data,
  });
}

export async function addBabyItemToShoppingList(
  householdId: string,
  itemId: string,
  shoppingListId: string
) {
  // Get the baby item
  const babyItem = await prisma.babyChecklistItem.findUnique({
    where: { id: itemId },
  });

  if (!babyItem) return null;

  // Import enums
  const { ShoppingPriority } = await import("@prisma/client");

  // Create shopping item
  const shoppingItem = await prisma.shoppingItem.create({
    data: {
      listId: shoppingListId,
      name: babyItem.title,
      category: "Baby",
      priority: ShoppingPriority.MEDIUM,
    },
  });

  // Link them
  await prisma.babyChecklistItem.update({
    where: { id: itemId },
    data: { relatedShoppingItemId: shoppingItem.id },
  });

  return shoppingItem;
}

export async function createTaskFromBabyItem(
  householdId: string,
  itemId: string,
  assignedToId?: string
) {
  // Get the baby item
  const babyItem = await prisma.babyChecklistItem.findUnique({
    where: { id: itemId },
  });

  if (!babyItem) return null;

  // Import enums
  const { TaskType } = await import("@prisma/client");

  // Create task
  const task = await prisma.task.create({
    data: {
      householdId,
      title: babyItem.title,
      description: `Baby preparation: ${babyItem.section}`,
      type: TaskType.BABY,
      assignedToUserId: assignedToId,
      dueDate: babyItem.dueDate,
    },
  });

  // Link them
  await prisma.babyChecklistItem.update({
    where: { id: itemId },
    data: { relatedTaskId: task.id },
  });

  return task;
}
