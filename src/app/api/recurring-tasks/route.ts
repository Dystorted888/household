import { NextResponse } from "next/server";
import { getRecurringTasks } from "@/lib/tasks";
import { getHouseholdId } from "@/lib/household";

export async function GET() {
  try {
    const householdId = await getHouseholdId();
    const recurringTasks = await getRecurringTasks(householdId);
    return NextResponse.json(recurringTasks);
  } catch (error) {
    console.error("Error fetching recurring tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
