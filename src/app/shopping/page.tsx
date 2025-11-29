import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getShoppingLists, getShoppingItems } from "@/lib/shopping";
import { ShoppingClient } from "@/components/shopping/shopping-client";

export const dynamic = 'force-dynamic';

export default async function ShoppingPage() {
  try {
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
  } catch (error: any) {
    console.error("Shopping page error:", error);
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
