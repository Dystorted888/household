import "server-only";
import { prisma } from "./prisma";
import { BabyItemType, BabyItemStatus } from "@prisma/client";
import { BABY_SECTIONS } from "./baby/sections";

export const SECTIONS = BABY_SECTIONS;

export async function getBabyChecklistItems(householdId: string) {
  // Try to query with assignedTo relation first (if migration has been run)
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
    // If migration hasn't been run, the assignedToUserId column/relation won't exist
    // Query without the assignedTo relation using raw query or select
    const errorMessage = error?.message || "";
    if (errorMessage.includes("assignedToUserId") || errorMessage.includes("does not exist") || errorMessage.includes("column")) {
      console.warn("Migration not run yet, querying baby items without assignedTo relation");
      
      // Use $queryRaw to query without Prisma's relation validation
      // This avoids the schema validation issue
      const items = await prisma.$queryRaw<any[]>`
        SELECT 
          id, "householdId", section, title, "itemType", status, "dueDate", 
          "createdAt", "completedAt", "relatedTaskId", "relatedShoppingItemId"
        FROM "BabyChecklistItem"
        WHERE "householdId" = ${householdId}
        ORDER BY section ASC, "dueDate" ASC, "createdAt" ASC
      `;
      
      // Map to match expected shape
      return items.map(item => ({
        id: item.id,
        householdId: item.householdId,
        section: item.section,
        title: item.title,
        itemType: item.itemType,
        status: item.status,
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
        createdAt: new Date(item.createdAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : null,
        relatedTaskId: item.relatedTaskId,
        relatedShoppingItemId: item.relatedShoppingItemId,
        assignedTo: null,
        assignedToUserId: null,
        relatedTask: null,
        relatedShoppingItem: null,
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
