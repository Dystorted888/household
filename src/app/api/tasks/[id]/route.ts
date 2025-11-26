import { NextRequest, NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/tasks";
import { getHouseholdId } from "@/lib/household";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const { status } = await request.json();

    // Verify the task belongs to this household
    const task = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.task.findFirst({
        where: { id: resolvedParams.id, householdId },
      })
    );

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await updateTaskStatus(resolvedParams.id, status);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}