import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getUsers } from "@/lib/dashboard";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const householdId = await getHouseholdId();
  const users = await getUsers(householdId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsClient users={users} />
    </Suspense>
  );
}
