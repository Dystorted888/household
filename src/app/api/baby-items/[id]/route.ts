import { NextRequest, NextResponse } from "next/server";
import { updateBabyItemStatus } from "@/lib/baby";
import { getHouseholdId } from "@/lib/household";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const { status } = await request.json();

    // Verify the item belongs to this household
    const item = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.babyChecklistItem.findFirst({
        where: { id: resolvedParams.id, householdId },
      })
    );

    if (!item) {
      return NextResponse.json({ error: "Baby item not found" }, { status: 404 });
    }

    const updatedItem = await updateBabyItemStatus(resolvedParams.id, status);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating baby item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
