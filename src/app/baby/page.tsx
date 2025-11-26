import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getBabyChecklistItems } from "@/lib/baby";
import { BabyClient } from "@/components/baby/baby-client";

export default async function BabyPage() {
  const householdId = await getHouseholdId();
  const babyItems = await getBabyChecklistItems(householdId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BabyClient initialItems={babyItems} />
    </Suspense>
  );
}
