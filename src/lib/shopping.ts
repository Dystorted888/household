import { prisma } from "./prisma";
import { ShoppingPriority } from "@prisma/client";

export async function getShoppingLists(householdId: string) {
  return await prisma.shoppingList.findMany({
    where: { householdId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getShoppingItems(listId: string) {
  return await prisma.shoppingItem.findMany({
    where: { listId },
    orderBy: [
      { priority: "desc" }, // HIGH first
      { createdAt: "asc" },
    ],
  });
}

export async function createShoppingList(householdId: string, name: string) {
  return await prisma.shoppingList.create({
    data: { householdId, name },
  });
}

export async function createShoppingItem(
  listId: string,
  name: string,
  quantity?: string,
  category?: string,
  priority: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM"
) {
  console.log("createShoppingItem called with:", { listId, name, quantity, category, priority });
  try {
    const result = await prisma.shoppingItem.create({
      data: {
        list: { connect: { id: listId } },
        name,
        quantity,
        category,
        priority: priority as any, // Let Prisma handle the enum conversion
      },
    });
    console.log("createShoppingItem result:", result);
    return result;
  } catch (error) {
    console.error("createShoppingItem error:", error);
    throw error;
  }
}

export async function updateShoppingItem(
  itemId: string,
  updates: {
    name?: string;
    quantity?: string;
    category?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    isBought?: boolean;
  }
) {
  const data: any = { ...updates };
  if (updates.isBought) {
    data.boughtAt = new Date();
  } else if (updates.isBought === false) {
    data.boughtAt = null;
  }

  return await prisma.shoppingItem.update({
    where: { id: itemId },
    data,
  });
}

export async function deleteShoppingItem(itemId: string) {
  return await prisma.shoppingItem.delete({
    where: { id: itemId },
  });
}
