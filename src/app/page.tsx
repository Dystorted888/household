import { Suspense } from "react";
import { getDashboardData, getUsers } from "@/lib/dashboard";
import { getHouseholdId } from "@/lib/household";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const householdId = await getHouseholdId();
    const dashboardData = await getDashboardData(householdId);
    const users = await getUsers(householdId);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardClient
          initialData={dashboardData}
          users={users}
        />
      </Suspense>
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    const errorMessage = error?.message || "An unexpected error occurred";
    const isMigrationError = errorMessage.includes("column") || errorMessage.includes("assignedToUserId");
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          {isMigrationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-sm">
              <p className="font-semibold text-yellow-800 mb-2">Database Migration Required</p>
              <p className="text-yellow-700 mb-2">
                The database schema needs to be updated. Please run the migration:
              </p>
              <code className="block bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
                ALTER TABLE "BabyChecklistItem" ADD COLUMN "assignedToUserId" TEXT;
              </code>
              <code className="block bg-yellow-100 p-2 rounded text-xs overflow-x-auto mt-2">
                ALTER TABLE "BabyChecklistItem" ADD CONSTRAINT "BabyChecklistItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }
}