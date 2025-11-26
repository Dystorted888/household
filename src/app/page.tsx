import { Suspense } from "react";
import { getDashboardData, getUsers } from "@/lib/dashboard";
import { getHouseholdId } from "@/lib/household";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function Home() {
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
}