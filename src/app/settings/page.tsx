import { Suspense } from "react";
import { getHouseholdId } from "@/lib/household";
import { getUsers } from "@/lib/dashboard";
import { SettingsClient } from "@/components/settings/settings-client";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    const householdId = await getHouseholdId();
    const users = await getUsers(householdId);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsClient users={users} />
      </Suspense>
    );
  } catch (error: any) {
    console.error("Settings page error:", error);
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
