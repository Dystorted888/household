import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getMealsForWeek } from "@/lib/meals";
import { MealsClient } from "@/components/meals/meals-client";

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  try {
    const householdId = await getHouseholdId();
    const initialMeals = await getMealsForWeek(householdId, 0); // Current week

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MealsClient initialMeals={initialMeals} />
      </Suspense>
    );
  } catch (error: any) {
    console.error("Meals page error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }
}
