import { NextRequest, NextResponse } from "next/server";
import { updateMealStatus } from "@/lib/meals";
import { getHouseholdId } from "@/lib/household";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const { status } = await request.json();

    const result = await updateMealStatus(householdId, resolvedParams.id, status);
    return NextResponse.json({ success: result.count > 0 });
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
