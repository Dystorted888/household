import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import { getHouseholdId } from "@/lib/household";

export async function GET() {
  try {
    const householdId = await getHouseholdId();
    const dashboardData = await getDashboardData(householdId);
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
