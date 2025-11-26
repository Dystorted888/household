import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getShoppingLists, getShoppingItems } from "@/lib/shopping";
import { ShoppingClient } from "@/components/shopping/shopping-client";

export const dynamic = 'force-dynamic';

export default async function ShoppingPage() {
  const householdId = await getHouseholdId();
  const lists = await getShoppingLists(householdId);
  const activeListId = lists[0]?.id || null;
  const items = activeListId ? await getShoppingItems(activeListId) : [];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShoppingClient
        initialLists={lists}
        initialItems={items}
        activeListId={activeListId}
      />
    </Suspense>
  );
}
