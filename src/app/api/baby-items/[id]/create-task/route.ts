import { NextRequest, NextResponse } from "next/server";
import { createTaskFromBabyItem } from "@/lib/baby";
import { getHouseholdId } from "@/lib/household";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();

    // Verify the item belongs to this household
    const item = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.babyChecklistItem.findFirst({
        where: { id: resolvedParams.id, householdId },
      })
    );

    if (!item) {
      return NextResponse.json({ error: "Baby item not found" }, { status: 404 });
    }

    const task = await createTaskFromBabyItem(householdId, resolvedParams.id);
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task from baby item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
