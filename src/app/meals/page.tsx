import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getMealsForWeek } from "@/lib/meals";
import { MealsClient } from "@/components/meals/meals-client";

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  const householdId = await getHouseholdId();
  const initialMeals = await getMealsForWeek(householdId, 0); // Current week

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MealsClient initialMeals={initialMeals} />
    </Suspense>
  );
}
