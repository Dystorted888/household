import { NextRequest, NextResponse } from "next/server";
import { updateShoppingItem, deleteShoppingItem } from "@/lib/shopping";
import { getHouseholdId } from "@/lib/household";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const updates = await request.json();

    // Verify the item belongs to this household
    const item = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.shoppingItem.findFirst({
        where: {
          id: resolvedParams.id,
          list: { householdId }
        },
      })
    );

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = await updateShoppingItem(resolvedParams.id, updates);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating shopping item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();

    // Verify the item belongs to this household
    const item = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.shoppingItem.findFirst({
        where: {
          id: resolvedParams.id,
          list: { householdId }
        },
      })
    );

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await deleteShoppingItem(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
