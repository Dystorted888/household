import "server-only";
import { prisma } from "./prisma";
import { BabyItemType, BabyItemStatus } from "@prisma/client";
import { BABY_SECTIONS } from "./baby/sections";

export const SECTIONS = BABY_SECTIONS;

export async function getBabyChecklistItems(householdId: string) {
  try {
    return await prisma.babyChecklistItem.findMany({
      where: { householdId },
      include: {
        assignedTo: true,
        relatedTask: true,
        relatedShoppingItem: true,
      },
      orderBy: [
        { section: "asc" },
        { dueDate: "asc" },
        { createdAt: "asc" },
      ],
    });
  } catch (error: any) {
    // If migration hasn't been run, try without assignedTo relation
    if (error?.message?.includes("assignedToUserId") || error?.message?.includes("column")) {
      console.warn("Baby items query failed, trying without assignedTo relation:", error?.message);
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
    throw error;
  }
}

export async function createBabyChecklistItem(
  householdId: string,
  section: string,
  title: string,
  itemType: BabyItemType,
  dueDate?: Date,
  assignedToUserId?: string | null
) {
  return await prisma.babyChecklistItem.create({
    data: {
      householdId,
      section,
      title,
      itemType,
      dueDate,
      assignedToUserId: assignedToUserId || null,
    },
  });
}

export async function updateBabyChecklistItem(
  itemId: string,
  householdId: string,
  data: {
    title?: string;
    section?: string;
    itemType?: BabyItemType;
    dueDate?: Date | null;
    assignedToUserId?: string | null;
    status?: BabyItemStatus;
  }
) {
  // Verify the item belongs to this household
  const existing = await prisma.babyChecklistItem.findFirst({
    where: { id: itemId, householdId },
  });

  if (!existing) {
    throw new Error("Baby item not found");
  }

  return await prisma.babyChecklistItem.update({
    where: { id: itemId },
    data,
    include: {
      assignedTo: true,
      relatedTask: true,
      relatedShoppingItem: true,
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
    include: {
      assignedTo: true,
    },
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
