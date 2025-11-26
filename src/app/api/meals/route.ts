import { NextRequest, NextResponse } from "next/server";
import { getMealsForWeek, createOrUpdateMeal } from "@/lib/meals";
import { getHouseholdId } from "@/lib/household";

export async function GET(request: NextRequest) {
  try {
    const householdId = await getHouseholdId();
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") || "0");

    const mealsData = await getMealsForWeek(householdId, offset);
    return NextResponse.json(mealsData);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const householdId = await getHouseholdId();
    const { date, label, notes } = await request.json();

    const meal = await createOrUpdateMeal(householdId, new Date(date), label, notes);
    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
