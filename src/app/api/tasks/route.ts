import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/tasks";
import { getHouseholdId } from "@/lib/household";
import { TaskType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const householdId = await getHouseholdId();
    const { title, description, type, assignedToUserId, dueDate } = await request.json();

    // Convert string type to enum
    const typeEnum = type === "BABY" ? TaskType.BABY :
                     type === "HOUSE" ? TaskType.HOUSE :
                     TaskType.GENERIC;

    const task = await createTask(householdId, title, description, typeEnum, assignedToUserId, dueDate ? new Date(dueDate) : undefined);
    return NextResponse.json(task);
  } catch (error: any) {
    console.error("Error creating task:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json({
      error: "Internal server error",
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
