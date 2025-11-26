import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default household
  const household = await prisma.household.upsert({
    where: { id: "default-household" },
    update: {},
    create: {
      id: "default-household",
      name: "Our Household",
    },
  });

  // Create two users: Husband and Wife
  const husband = await prisma.user.upsert({
    where: { email: "husband@example.local" },
    update: {},
    create: {
      name: "Husband",
      email: "husband@example.local",
      role: UserRole.ADMIN,
      profile: "Husband",
      householdId: household.id,
      color: "#2563eb",
    },
  });

  const wife = await prisma.user.upsert({
    where: { email: "wife@example.local" },
    update: {},
    create: {
      name: "Wife",
      email: "wife@example.local",
      role: UserRole.MEMBER,
      profile: "Wife",
      householdId: household.id,
      color: "#db2777",
    },
  });

  console.log("Seeded household and users:", {
    household,
    husbandId: husband.id,
    wifeId: wife.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


