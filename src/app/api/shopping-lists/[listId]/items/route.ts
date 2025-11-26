import { NextRequest, NextResponse } from "next/server";
import { getShoppingItems, createShoppingItem } from "@/lib/shopping";
import { getHouseholdId } from "@/lib/household";
import { ShoppingPriority } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();

    // Verify the list belongs to this household
    const list = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.shoppingList.findFirst({
        where: { id: resolvedParams.listId, householdId },
      })
    );

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const items = await getShoppingItems(resolvedParams.listId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching shopping items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  try {
    const params = await context.params;
    const householdId = await getHouseholdId();
    const { name, quantity, category, priority } = await request.json();

    // Verify the list belongs to this household
    const { prisma } = await import("@/lib/prisma");
    const list = await prisma.shoppingList.findFirst({
      where: { id: params.listId, householdId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const item = await createShoppingItem(params.listId, name, quantity, category, priority);
    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error creating shopping item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
