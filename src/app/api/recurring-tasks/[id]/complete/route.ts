import { NextRequest, NextResponse } from "next/server";
import { completeRecurringTask } from "@/lib/tasks";
import { getHouseholdId } from "@/lib/household";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();

    // Verify the recurring task belongs to this household
    const recurringTask = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.recurringTask.findFirst({
        where: { id: resolvedParams.id, householdId },
      })
    );

    if (!recurringTask) {
      return NextResponse.json({ error: "Recurring task not found" }, { status: 404 });
    }

    const result = await completeRecurringTask(resolvedParams.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing recurring task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
