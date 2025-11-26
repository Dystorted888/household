import { NextRequest, NextResponse } from "next/server";
import { getBabyChecklistItems, createBabyChecklistItem } from "@/lib/baby";
import { getHouseholdId } from "@/lib/household";

export async function GET() {
  try {
    const householdId = await getHouseholdId();
    const items = await getBabyChecklistItems(householdId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching baby items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const householdId = await getHouseholdId();
    const { title, section, itemType, dueDate } = await request.json();

    const item = await createBabyChecklistItem(householdId, section, title, itemType, dueDate ? new Date(dueDate) : undefined);
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating baby item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
