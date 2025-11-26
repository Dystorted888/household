import { NextRequest, NextResponse } from "next/server";
import { getShoppingLists, createShoppingList } from "@/lib/shopping";
import { getHouseholdId } from "@/lib/household";

export async function GET() {
  try {
    const householdId = await getHouseholdId();
    const lists = await getShoppingLists(householdId);
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const householdId = await getHouseholdId();
    const { name } = await request.json();

    const list = await createShoppingList(householdId, name);
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
