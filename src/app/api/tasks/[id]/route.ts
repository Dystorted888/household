import { NextRequest, NextResponse } from "next/server";
import { getHouseholdId } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { TaskStatus, TaskType, Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const householdId = await getHouseholdId();
    const payload = await request.json();

    const task = await prisma.task.findFirst({
      where: { id: resolvedParams.id, householdId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData: Prisma.TaskUpdateInput = {};

    if ("title" in payload) {
      updateData.title = payload.title;
    }
    if ("description" in payload) {
      updateData.description = payload.description ?? null;
    }
    if ("type" in payload) {
      const type =
        payload.type === "BABY"
          ? TaskType.BABY
          : payload.type === "HOUSE"
            ? TaskType.HOUSE
            : TaskType.GENERIC;
      updateData.type = type;
    }
    if ("assignedToUserId" in payload) {
      updateData.assignedTo = {
        connect: payload.assignedToUserId
          ? { id: payload.assignedToUserId }
          : undefined,
        disconnect: payload.assignedToUserId ? undefined : true,
      };
    }
    if ("dueDate" in payload) {
      updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
    }
    if ("status" in payload && payload.status) {
      const status =
        payload.status === "IN_PROGRESS"
          ? TaskStatus.IN_PROGRESS
          : payload.status === "DONE"
            ? TaskStatus.DONE
            : TaskStatus.TODO;
      updateData.status = status;
      updateData.completedAt = status === TaskStatus.DONE ? new Date() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: { assignedTo: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}