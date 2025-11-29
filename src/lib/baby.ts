import "server-only";
import { prisma } from "./prisma";
import { BabyItemType, BabyItemStatus } from "@prisma/client";
import { BABY_SECTIONS } from "./baby/sections";

export const SECTIONS = BABY_SECTIONS;

export async function getBabyChecklistItems(householdId: string) {
  // First try with assignedTo relation (if migration has been run)
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
    // If migration hasn't been run, the assignedToUserId column won't exist
    // Query without the assignedTo relation
    const errorMessage = error?.message || "";
    if (errorMessage.includes("assignedToUserId") || errorMessage.includes("column") || errorMessage.includes("does not exist")) {
      console.warn("Migration not run yet, querying baby items without assignedTo relation");
      // Query without assignedTo - use select to explicitly avoid it
      const items = await prisma.babyChecklistItem.findMany({
        where: { householdId },
        select: {
          id: true,
          householdId: true,
          section: true,
          title: true,
          itemType: true,
          status: true,
          dueDate: true,
          createdAt: true,
          completedAt: true,
          relatedTaskId: true,
          relatedShoppingItemId: true,
          relatedTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          relatedShoppingItem: {
            select: {
              id: true,
              name: true,
              isBought: true,
            },
          },
        },
        orderBy: [
          { section: "asc" },
          { dueDate: "asc" },
          { createdAt: "asc" },
        ],
      });
      // Map items to match expected shape (without assignedTo)
      return items.map(item => ({
        ...item,
        assignedTo: null,
        assignedToUserId: null,
      }));
    }
    // If it's a different error, rethrow it
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
