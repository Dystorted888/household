import { NextRequest, NextResponse } from "next/server";
import { updateBabyItemStatus, updateBabyChecklistItem } from "@/lib/baby";
import { getHouseholdId } from "@/lib/household";
import { BabyItemType, BabyItemStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const body = await request.json();

    // If only status is being updated, use the simple function
    if (body.status && Object.keys(body).length === 1) {
      const updatedItem = await updateBabyItemStatus(resolvedParams.id, body.status);
      return NextResponse.json(updatedItem);
    }

    // Otherwise, do a full update
    const updateData: {
      title?: string;
      section?: string;
      itemType?: BabyItemType;
      dueDate?: Date | null;
      assignedToUserId?: string | null;
      status?: BabyItemStatus;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.section !== undefined) updateData.section = body.section;
    if (body.itemType !== undefined) updateData.itemType = body.itemType as BabyItemType;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assignedToUserId !== undefined) updateData.assignedToUserId = body.assignedToUserId || null;
    if (body.status !== undefined) updateData.status = body.status as BabyItemStatus;

    const updatedItem = await updateBabyChecklistItem(resolvedParams.id, householdId, updateData);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating baby item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
