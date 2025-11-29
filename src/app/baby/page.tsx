import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getBabyChecklistItems } from "@/lib/baby";
import { getUsers } from "@/lib/dashboard";
import { BabyClient } from "@/components/baby/baby-client";

export const dynamic = 'force-dynamic';

export default async function BabyPage() {
  const householdId = await getHouseholdId();
  const babyItems = await getBabyChecklistItems(householdId);
  const users = await getUsers(householdId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BabyClient initialItems={babyItems} users={users} />
    </Suspense>
  );
}
