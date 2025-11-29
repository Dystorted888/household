import { prisma } from "./prisma";

const DEFAULT_HOUSEHOLD_ID = "default-household";

export async function getHouseholdId(): Promise<string> {
  const configuredId = process.env.HOUSEHOLD_ID;

  if (configuredId) {
    const configuredHousehold = await prisma.household.findUnique({
      where: { id: configuredId },
    });
    if (configuredHousehold) {
      return configuredHousehold.id;
    }
  }

  const defaultHousehold = await prisma.household.findUnique({
    where: { id: DEFAULT_HOUSEHOLD_ID },
  });
  if (defaultHousehold) {
    return defaultHousehold.id;
  }

  const firstExistingHousehold = await prisma.household.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (firstExistingHousehold) {
    return firstExistingHousehold.id;
  }

  const newlyCreatedHousehold = await prisma.household.create({
    data: {
      id: configuredId || DEFAULT_HOUSEHOLD_ID,
      name: "Our Household",
    },
  });

  return newlyCreatedHousehold.id;
}
