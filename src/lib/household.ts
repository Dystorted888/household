import { prisma } from "./prisma";

// For now, we use a hardcoded household ID
// In a real app, this would come from user authentication
const DEFAULT_HOUSEHOLD_ID = "default-household";

export async function getHouseholdId(): Promise<string> {
  // Get or create the default household
  const existingHousehold = await prisma.household.findUnique({
    where: { id: DEFAULT_HOUSEHOLD_ID },
  });

  if (existingHousehold) {
    return existingHousehold.id;
  }

  // Create the default household if it doesn't exist
  const household = await prisma.household.create({
    data: {
      id: DEFAULT_HOUSEHOLD_ID,
      name: "Our Household"
    },
  });

  return household.id;
}
